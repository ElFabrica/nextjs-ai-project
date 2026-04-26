"use client";

import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ChatMessage } from "@/app/api/web-search-tool/route";

export default function Page() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error, stop } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/web-search-tool",
    }),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {error && <div className="text-red-500 bg-4">{error.message} </div>}
      {messages.map((message) => {
        const sources = message.parts.filter(
          (part) => part.type === "source-url",
        );
        return (
          <div key={message.id}>
            <div>{message.role === "user" ? "You:" : "AI:"}</div>
            {message.parts.map((part, index) => {
              switch (part.type) {
                case "text":
                  return (
                    <div
                      className="whitespace-pre-wrap"
                      key={`${message.id}-${index}`}
                    >
                      {part.text}
                    </div>
                  );
                case "tool-web_search_preview":
                  switch (part.state) {
                    case "input-streaming":
                      return (
                        <div
                          className="bg-zinc-900/50 border-zinc-700 p-2 rounded "
                          key={`${message.id}-getWether`}
                        >
                          <div className="text-sm text-zinc-500">
                            Preparing to search...
                          </div>
                        </div>
                      );
                    case "input-available":
                      return (
                        <div
                          className="bg-zinc-900/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                          key={`${message.id}-getWether-${index}`}
                        >
                          <div className="text-sm text-zinc-500">
                            Searching the web...
                          </div>
                        </div>
                      );
                    case "output-available":
                      return (
                        <React.Fragment
                          key={`${message.id}-getWeather-${index}`}
                        >
                          <div className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2">
                            <div className="text-sm text-zinc-400">
                              Web search complete
                            </div>
                          </div>
                          {message.role === "assistant" &&
                            sources.length > 0 && (
                              <div className="mb-2">
                                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                                      Sources ({sources.length})
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    {sources.map((part, index) => {
                                      if (part.type === "source-url") {
                                        return (
                                          <a
                                            key={`${message.id}-${index}`}
                                            className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline truncate"
                                            href={part.url}
                                            target="_blank"
                                            rel="noopener norerrer"
                                            title={part.url}
                                          >
                                            {part.title || part.url}
                                          </a>
                                        );
                                      }
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                        </React.Fragment>
                      );
                    case "output-error":
                      return (
                        <div
                          key={`${message.id}-getWeather-${index}`}
                          className="bg-zinc-800/50 border border-zinc-700 p-2 rounded mt-1 mb-2"
                        >
                          <div className="text-sm text-red-400">
                            Web search failed: {part.errorText}
                          </div>
                        </div>
                      );
                    default:
                      null;
                  }

                default:
                  return null;
              }
            })}
          </div>
        );
      })}

      {(status === "submitted" || status === "streaming") && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 size-4 border-b-2 border-blue-400 "></div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
            placeholder="How can I help you?"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
          />
          {status === "submitted" || status === "streaming" ? (
            <button
              onClick={stop}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={status !== "ready"}
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
