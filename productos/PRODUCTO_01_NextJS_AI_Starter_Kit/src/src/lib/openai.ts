import OpenAI from "openai";
import { createHash, randomUUID } from "crypto";

const DEFAULT_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];

export const ENABLED_MODELS = (
  process.env.OPENAI_ENABLED_MODELS ?? DEFAULT_MODELS.join(",")
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

export const DEFAULT_MODEL = ENABLED_MODELS[0] ?? "gpt-4o";

const clients = new Map<string, OpenAI>();

function getClient(apiKey?: string): OpenAI {
  const key = apiKey ?? process.env.OPENAI_API_KEY ?? "";
  const hash = createHash("sha256").update(key).digest("hex");
  if (!clients.has(hash)) {
    clients.set(
      hash,
      new OpenAI({
        apiKey: key,
        organization: process.env.OPENAI_ORG_ID || undefined,
        maxRetries: 3,
        timeout: 60000,
      })
    );
  }
  return clients.get(hash)!;
}

export interface ChatStreamOptions {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  apiKey?: string;
  signal?: AbortSignal;
  onToken?: (token: string) => void;
}

interface ModelResult {
  model: string;
  success: boolean;
  durationMs: number;
}

export class ChatError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public retryable: boolean = false,
    public model?: string
  ) {
    super(message);
    this.name = "ChatError";
  }
}

async function tryModel(
  model: string,
  options: ChatStreamOptions
): Promise<{ result: ModelResult }> {
  const start = Date.now();
  try {
    const openai = getClient(options.apiKey);
    const stream = await openai.chat.completions.create({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      top_p: options.topP ?? 1,
      frequency_penalty: options.frequencyPenalty ?? 0,
      presence_penalty: options.presencePenalty ?? 0,
      stream: true,
    });

    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content ?? "";
      if (token && options.onToken) {
        options.onToken(token);
      }
    }

    const durationMs = Date.now() - start;
    return {
      result: { model, success: true, durationMs },
    };
  } catch (error: unknown) {
    const durationMs = Date.now() - start;
    if (error instanceof OpenAI.APIError) {
      throw new ChatError(
        error.message,
        error.status ?? 500,
        error.code ?? "API_ERROR",
        error.status === 429 || error.status >= 500,
        model
      );
    }
    throw new ChatError(
      error instanceof Error ? error.message : "Unknown error",
      500,
      "STREAM_ERROR",
      true,
      model
    );
  }
}

export async function* streamChat(
  options: ChatStreamOptions
): AsyncGenerator<string, ModelResult, unknown> {
  const models = options.model
    ? [options.model]
    : ENABLED_MODELS;

  let lastError: ChatError | null = null;

  for (const model of models) {
    try {
      const tokens: string[] = [];
      const onToken = (token: string) => {
        tokens.push(token);
      };

      const { result } = await tryModel(model, { ...options, onToken });

      for (const token of tokens) {
        yield token;
      }

      return result;
    } catch (error: unknown) {
      lastError =
        error instanceof ChatError
          ? error
          : new ChatError(
              error instanceof Error ? error.message : "Unknown error"
            );

      if (options.model) throw lastError;
      continue;
    }
  }

  throw lastError ?? new ChatError("All models failed", 503, "ALL_MODELS_FAILED");
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = parseInt(process.env.RATE_LIMIT_REQUESTS ?? "60", 10),
  windowMs: number = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10)
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `${identifier}:${Math.floor(now / windowMs)}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export const MODEL_INFO: Record<
  string,
  { name: string; provider: string; context: number; costIn: number; costOut: number }
> = {
  "gpt-4o": {
    name: "GPT-4o",
    provider: "OpenAI",
    context: 128000,
    costIn: 2.5,
    costOut: 10,
  },
  "gpt-4o-mini": {
    name: "GPT-4o Mini",
    provider: "OpenAI",
    context: 128000,
    costIn: 0.15,
    costOut: 0.6,
  },
  "gpt-4-turbo": {
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    context: 128000,
    costIn: 10,
    costOut: 30,
  },
  "gpt-3.5-turbo": {
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    context: 16385,
    costIn: 0.5,
    costOut: 1.5,
  },
};

export function getModelInfo(model: string) {
  return MODEL_INFO[model] ?? {
    name: model,
    provider: "Unknown",
    context: 4096,
    costIn: 0,
    costOut: 0,
  };
}
