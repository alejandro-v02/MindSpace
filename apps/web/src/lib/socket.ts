import { io, type Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, { autoConnect: true });
  }
  return socket;
}

const CONVERSATION_ID_KEY = "mindspace:conversationId";

export function getConversationId(): string {
  let id = sessionStorage.getItem(CONVERSATION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(CONVERSATION_ID_KEY, id);
  }
  return id;
}
