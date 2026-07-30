"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ChatMessage } from "./ChatMessage";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  createdAt?: string;
}

interface StreamEvent {
  token?: string;
  chatId?: string;
  done?: boolean;
  model?: string;
  error?: string;
  code?: string;
  retryable?: boolean;
}

export function ChatInterface() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `# Welcome to AI Starter Kit 👋

I'm your AI development assistant. I can help you with:

- **Code Generation** — Write functions, components, and algorithms
- **Debugging** — Find and fix bugs in your code
- **Code Review** — Get feedback on your code quality
- **Testing** — Generate test cases and test suites
- **Documentation** — Create docs, READMEs, and API references
- **Refactoring** — Suggest improvements to existing code
- **API Design** — Design RESTful and GraphQL APIs
- **Database Queries** — Write and optimize SQL/Prisma queries
- **DevOps** — Docker, CI/CD, and deployment configs
- **Git** — Generate commit messages and PR descriptions

Try the pre-configured prompts or just ask me anything!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!session?.user) {
      setError("Please sign in to send messages");
      return;
    }

    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const chatMessages = [...messages, userMessage].map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatMessages,
          model: selectedModel,
          chatId,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event: StreamEvent = JSON.parse(line);

            if (event.error) {
              setError(event.error);
              setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
              setIsLoading(false);
              return;
            }

            if (event.chatId) {
              setChatId(event.chatId);
            }

            if (event.token !== undefined) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, content: m.content + event.token }
                    : m
                )
              );
            }

            if (event.done) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, model: event.model }
                    : m
                )
              );
            }
          } catch {
            // skip parse errors for partial lines
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  function insertPrompt(prompt: string) {
    setInput(prompt);
    textareaRef.current?.focus();
  }

  const prompts = [
    { label: "Generate Code", prompt: "Write a function that..." },
    { label: "Debug", prompt: "I'm getting this error..." },
    { label: "Review", prompt: "Review this code for me:\n\n```\n\n```" },
    { label: "Test", prompt: "Write tests for this code:\n\n```\n\n```" },
    { label: "Explain", prompt: "Explain how this works:\n\n```\n\n```" },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-surface-900">AI Chat</h1>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="input-field w-auto py-1.5 text-xs"
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <button onClick={stopGeneration} className="btn-secondary text-xs">
              Stop
            </button>
          )}
          {chatId && (
            <button
              onClick={() => {
                setChatId(null);
                setMessages([
                  {
                    id: "welcome",
                    role: "assistant",
                    content: "Started a new chat. How can I help you?",
                  },
                ]);
                setError(null);
              }}
              className="btn-secondary text-xs"
            >
              New Chat
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-surface-900">
                Start a conversation
              </h2>
              <p className="mt-2 text-sm text-surface-500">
                Choose a prompt below or type your own message.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={isLoading && msg === messages[messages.length - 1] && msg.role === "assistant"}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="mx-auto mb-2 w-full max-w-3xl px-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 font-medium underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-surface-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-3xl">
          {messages.length <= 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button
                  key={p.label}
                  onClick={() => insertPrompt(p.prompt)}
                  className="rounded-full border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-surface-600 transition-colors hover:border-primary-300 hover:text-primary-700"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={session?.user ? "Type your message..." : "Sign in to start chatting..."}
                rows={1}
                disabled={isLoading || !session?.user}
                className="input-field resize-none py-3 pr-12"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !session?.user}
              className="btn-primary h-[42px] w-[42px] shrink-0 p-0"
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
