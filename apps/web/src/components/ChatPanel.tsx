import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { getConversationId, getSocket } from "../lib/socket";
import type { RoomScene } from "../game/RoomScene";

interface ChatMessage {
  id: string;
  role: "user" | "alejo";
  text: string;
  timestamp: Date;
}

interface ChatPanelProps {
  sceneRef: React.RefObject<RoomScene | null>;
}

const MAX_CHAT_MESSAGES = 100;

export function ChatPanel({ sceneRef }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(() => getSocket().connected);
  const [thinking, setThinking] = useState(false);
  const streamingIdRef = useRef<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => {
      setConnected(false);
      setThinking(false);
      streamingIdRef.current = null;
    };

    const onThinking = () => {
      setThinking(true);
      streamingIdRef.current = null;
      sceneRef.current?.showThinking();
    };

    const onToken = (payload: { agentId: string; token: string }) => {
      if (!payload.token) return;
      sceneRef.current?.appendToken(payload.token);
      setMessages((prev) => {
        if (streamingIdRef.current) {
          return prev.map((m) =>
            m.id === streamingIdRef.current ? { ...m, text: m.text + payload.token } : m,
          );
        }
        const id = crypto.randomUUID();
        streamingIdRef.current = id;
        return [
          ...prev,
          { id, role: "alejo", text: payload.token, timestamp: new Date() },
        ].slice(-MAX_CHAT_MESSAGES);
      });
    };

    const onDone = (payload: { agentId: string; message: string }) => {
      setThinking(false);
      streamingIdRef.current = null;
      void sceneRef.current?.say(payload.message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("agent:thinking", onThinking);
    socket.on("agent:token", onToken);
    socket.on("agent:done", onDone);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("agent:thinking", onThinking);
      socket.off("agent:token", onToken);
      socket.off("agent:done", onDone);
    };
  }, [sceneRef]);

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
      listEndRef.current?.scrollIntoView({ behavior });
    }
  }, [messages]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || thinking || !connected) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text, timestamp: new Date() },
    ].slice(-MAX_CHAT_MESSAGES));
    getSocket().emit("user:message", { conversationId: getConversationId(), text });
    setDraft("");
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <strong>A.L.E.J.O.</strong>
        <span
          className={connected ? "status-dot status-dot--on" : "status-dot"}
          role="status"
          aria-label={connected ? "Conectado" : "Desconectado"}
        />
        <span className="connection-label">
          {connected ? "Conectado" : "Desconectado"}
        </span>
      </div>
      <div
        className="chat-messages"
        role="log"
        aria-label="Conversación"
        aria-busy={thinking}
        onScroll={(event) => {
          const element = event.currentTarget;
          shouldAutoScrollRef.current =
            element.scrollHeight - element.scrollTop - element.clientHeight < 48;
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-bubble chat-bubble--${message.role}`}
            title={message.timestamp.toLocaleString()}
          >
            <span>{message.text}</span>
            <time className="chat-timestamp" dateTime={message.timestamp.toISOString()}>
              {message.timestamp.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>
        ))}
        <div ref={listEndRef} />
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={thinking ? "A.L.E.J.O. está pensando..." : "Escríbele a A.L.E.J.O."}
          autoComplete="off"
          maxLength={4000}
          disabled={thinking}
          aria-label="Mensaje para A.L.E.J.O."
          onKeyDown={(event) => {
            if (event.key === "Escape" && !thinking) {
              setDraft("");
            }
          }}
        />
        {draft.length > 3500 && (
          <span className="chat-character-count" aria-live="polite">
            {draft.length}/4000
          </span>
        )}
        <button type="submit" disabled={!connected || thinking || !draft.trim()}>
          {thinking ? "Pensando" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
