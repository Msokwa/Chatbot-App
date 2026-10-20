import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "assistant" | "user";
  content: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hello! I am your AI assistant. How can I help you today?",
  },
];

function App() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();

    if (!content || isSending) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", content },
    ]);
    setDraft("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        },
      );

      if (!response.ok) {
        throw new Error("The chat service could not process your message.");
      }

      if (!response.body) {
        throw new Error("The chat service returned an empty response.");
      }

      const assistantMessageId = Date.now();
      setMessages((current) => [
        ...current,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: message.content + chunk }
              : message,
          ),
        );
      }

      const finalChunk = decoder.decode();
      if (finalChunk) {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: message.content + finalChunk }
              : message,
          ),
        );
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The chat service is unavailable.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="chat-card" aria-label="Chat application">
        <header className="chat-header">
          <div>
            <p className="eyebrow">AI ASSISTANT</p>
            <h1>Chatbot</h1>
          </div>
          <span className="status">
            <span className="status-dot" aria-hidden="true" />
            Online
          </span>
        </header>

        <div className="messages" aria-live="polite">
          {messages.map((message) => (
            <div className={`message-row ${message.role}`} key={message.id}>
              <p className="message">{message.content}</p>
            </div>
          ))}
          {isSending && (
            <div className="typing-indicator" aria-label="Assistant is typing">
              <span />
              <span />
              <span />
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <div ref={messagesEndRef} />
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="message-input">
            Type a message
          </label>
          <textarea
            id="message-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Message your assistant..."
            rows={1}
          />
          <button aria-label="Send message" disabled={isSending} type="submit">
            {isSending ? "..." : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
