import type { AgentSlug } from "./events";

export interface AgentConfig {
  id: string;
  slug: AgentSlug;
  nombre: string;
  config: Record<string, unknown>;
  activo: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  creadoEn: string;
}

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  agentId: AgentSlug | null;
  contenido: string;
  creadoEn: string;
}

export interface Memory {
  id: string;
  userId: string;
  agentId: AgentSlug;
  contenido: string;
  embedding: number[];
  creadoEn: string;
}

export interface ToolRun {
  id: string;
  messageId: string;
  herramienta: string;
  input: unknown;
  output: unknown;
  duracionMs: number;
}
