"use client";

import { FormEvent, useMemo, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const starterMessage: Message = {
  id: "starter",
  role: "assistant",
  content:
    "Hi! I am ready to help. You can chat normally, or ask math like 'add 12 and 7' or '50 / 5'.",
};

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => {
    return input.trim().length > 0 && !isSending;
  }, [input, isSending]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = input.trim();

    if (!content || isSending) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const payload = (await response.json()) as {
        reply?: string;
        error?: string;
      };
      const assistantReply = payload.reply;

      if (
        !response.ok ||
        typeof assistantReply !== "string" ||
        !assistantReply
      ) {
        throw new Error(
          payload.error ?? "Unable to get a response from the AI."
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantReply,
        },
      ]);
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Unexpected error while contacting the AI."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="flex h-[calc(100vh-4rem)] flex-col rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/15 dark:bg-black">
      <header className="border-b border-black/10 px-4 py-4 sm:px-6 dark:border-white/15">
        <h1 className="text-2xl font-semibold tracking-tight">AI Chat</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Conversational chat with MCP-powered calculator tools.
        </p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-base ${
              message.role === "user"
                ? "bg-foreground text-background ml-auto"
                : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
            }`}
          >
            <p>{message.content}</p>
          </article>
        ))}
        {isSending ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Thinking…</p>
        ) : null}
      </div>

      <form
        onSubmit={sendMessage}
        className="border-t border-black/10 px-4 py-4 sm:px-6 dark:border-white/15"
      >
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <div className="flex items-center gap-3">
          <input
            id="message"
            name="message"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your message..."
            className="h-11 flex-1 rounded-xl border border-black/15 bg-transparent px-4 text-sm ring-0 outline-none placeholder:text-zinc-500 focus:border-black/40 dark:border-white/20 dark:placeholder:text-zinc-500 dark:focus:border-white/40"
            disabled={isSending}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="bg-foreground text-background h-11 rounded-xl px-5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
        {error ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </form>
    </section>
  );
}
