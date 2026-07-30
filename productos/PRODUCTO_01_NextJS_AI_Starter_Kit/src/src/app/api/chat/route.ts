import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { streamChat, checkRateLimit, ChatError, ENABLED_MODELS, DEFAULT_MODEL } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ChatRequest {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  chatId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    const rl = checkRateLimit(userId ?? ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", code: "RATE_LIMITED" },
        { status: 429, headers: { "X-RateLimit-Reset": String(rl.resetAt) } }
      );
    }

    const body: ChatRequest = await req.json();

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (body.messages.length > 100) {
      return NextResponse.json(
        { error: "Maximum of 100 messages allowed", code: "TOO_MANY_MESSAGES" },
        { status: 400 }
      );
    }

    for (const msg of body.messages) {
      if (!["user", "assistant", "system"].includes(msg.role)) {
        return NextResponse.json(
          { error: `Invalid role: ${msg.role}`, code: "INVALID_ROLE" },
          { status: 400 }
        );
      }
      if (typeof msg.content !== "string" || msg.content.length > 32000) {
        return NextResponse.json(
          { error: "Message content must be a string under 32000 chars", code: "INVALID_CONTENT" },
          { status: 400 }
        );
      }
    }

    const model = body.model && ENABLED_MODELS.includes(body.model) ? body.model : DEFAULT_MODEL;

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 55000);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let chatId = body.chatId;
          let fullResponse = "";

          if (chatId && userId) {
            const chat = await prisma.chat.findUnique({ where: { id: chatId } });
            if (chat && chat.userId !== userId) {
              controller.enqueue(encoder.encode(JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }) + "\n"));
              controller.close();
              clearTimeout(timeout);
              return;
            }
          }

          if (!chatId && userId) {
            const title = body.messages[0]?.content?.slice(0, 100) ?? "New Chat";
            const chat = await prisma.chat.create({
              data: {
                userId,
                title: title.length > 100 ? title.slice(0, 97) + "..." : title,
                model,
              },
            });
            chatId = chat.id;
            controller.enqueue(encoder.encode(JSON.stringify({ chatId: chat.id }) + "\n"));
          }

          if (userId && chatId) {
            await prisma.message.create({
              data: {
                chatId,
                role: body.messages[body.messages.length - 1].role,
                content: body.messages[body.messages.length - 1].content,
                model,
              },
            });
          }

          const generator = streamChat({
            messages: body.messages,
            model,
            temperature: body.temperature ?? 0.7,
            maxTokens: body.maxTokens ?? 4096,
            topP: body.topP ?? 1,
            signal: abortController.signal,
            onToken: (token) => {
              fullResponse += token;
            },
          });

          for await (const token of generator) {
            const data = JSON.stringify({ token }) + "\n";
            controller.enqueue(encoder.encode(data));
          }

          const result = await generator.return();
          if (result && userId && chatId) {
            await prisma.message.create({
              data: {
                chatId,
                role: "assistant",
                content: fullResponse,
                model: result.value?.model ?? model,
              },
            });
          }

          controller.enqueue(encoder.encode(JSON.stringify({ done: true, model: result.value?.model }) + "\n"));
          controller.close();
        } catch (error: unknown) {
          clearTimeout(timeout);
          if (error instanceof ChatError) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  error: error.message,
                  code: error.code,
                  retryable: error.retryable,
                  model: error.model,
                }) + "\n"
              )
            );
          } else if (error instanceof Error && error.name === "AbortError") {
            controller.enqueue(
              encoder.encode(JSON.stringify({ error: "Request timed out", code: "TIMEOUT" }) + "\n")
            );
          } else {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  error: "Internal server error",
                  code: "INTERNAL_ERROR",
                }) + "\n"
              )
            );
          }
          controller.close();
        }
      },
    });

    clearTimeout(timeout);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    if (error instanceof ChatError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");

  if (chatId) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!chat || chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(chat);
  }

  const chats = await prisma.chat.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { _count: { select: { messages: true } } },
  });

  return NextResponse.json(chats);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return NextResponse.json({ error: "chatId is required" }, { status: 400 });
  }

  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat || chat.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.chat.delete({ where: { id: chatId } });
  return NextResponse.json({ success: true });
}
