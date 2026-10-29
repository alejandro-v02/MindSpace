import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { getConversationId, getSocket } from "../lib/socket";
import type { RoomScene } from "../game/RoomScene";

interface ChatMessage {
  id: string;
  role: "user" | "alejo";
  text: string;
}

interface ChatPanelProps {
  sceneRef: React.RefObject<RoomScene | null>;
}

export function ChatPanel({ sceneRef }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(() => getSocket().connected);
  const streamingIdRef = useRef<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onThinking = () => {
      sceneRef.current?.showThinking();
    };

    const onToken = (payload: { agentId: string; token: string }) => {
      sceneRef.current?.appendToken(payload.token);
      setMessages((prev) => {
        if (streamingIdRef.current) {
          return prev.map((m) =>
            m.id === streamingIdRef.current ? { ...m, text: m.text + payload.token } : m,
          );
        }
        const id = crypto.randomUUID();
        streamingIdRef.current = id;
        return [...prev, { id, role: "alejo", text: payload.token }];
      });
    };

    const onDone = (payload: { agentId: string; message: string }) => {
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
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
    getSocket().emit("user:message", { conversationId: getConversationId(), text });
    setDraft("");
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <strong>A.L.E.J.O.</strong>
        <span className={connected ? "status-dot status-dot--on" : "status-dot"} />
      </div>
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`chat-bubble chat-bubble--${message.role}`}>
            {message.text}
          </div>
        ))}
        <div ref={listEndRef} />
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escríbele a A.L.E.J.O."
          autoComplete="off"
        />
        <button type="submit" disabled={!connected || !draft.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}
