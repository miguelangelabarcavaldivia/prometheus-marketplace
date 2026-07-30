"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "./ChatInterface";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
    }
  };

  return (
    <div
      className={`flex w-full gap-4 ${isUser ? "flex-row-reverse" : ""} animate-slide-up`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
          isUser
            ? "bg-primary-100 text-primary-700"
            : "bg-surface-800 text-surface-50"
        }`}
      >
        {isUser ? "U" : "AI"}
      </div>

      <div className={`group flex max-w-[80%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary-600 text-white"
              : "border border-surface-200 bg-white text-surface-900"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div className="prose-custom prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const isInline = !className;
                    return isInline ? (
                      <code className="rounded bg-surface-100 px-1.5 py-0.5 text-sm text-primary-700" {...props}>
                        {children}
                      </code>
                    ) : (
                      <div className="relative my-3">
                        <div className="absolute right-2 top-2 flex gap-1">
                          <button
                            onClick={handleCopy}
                            className="rounded bg-surface-700/50 px-2 py-1 text-xs text-surface-300 opacity-0 transition-opacity hover:bg-surface-700 group-hover:opacity-100"
                          >
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <code className="block overflow-x-auto rounded-lg bg-surface-900 p-4 text-sm text-surface-50" {...props}>
                          {children}
                        </code>
                      </div>
                    );
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {isStreaming && (
          <div className="mt-1 flex items-center gap-1 px-1">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary-500" />
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary-400" style={{ animationDelay: "0.2s" }} />
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary-300" style={{ animationDelay: "0.4s" }} />
          </div>
        )}

        {message.model && !isStreaming && (
          <span className="mt-1 px-2 text-xs text-surface-400">
            {message.model}
          </span>
        )}
      </div>
    </div>
  );
}
