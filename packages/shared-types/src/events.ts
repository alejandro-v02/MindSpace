export type AgentSlug = "alejo" | "dev" | "cyber" | "research";

export type Emotion = "neutral" | "happy" | "surprised" | "thinking";

/** Client -> server */
export interface UserMessageEvent {
  type: "user:message";
  conversationId: string;
  text: string;
}

/** Server -> client */
export interface AgentThinkingEvent {
  type: "agent:thinking";
  agentId: AgentSlug;
}

export interface AgentMoveEvent {
  type: "agent:move";
  agentId: AgentSlug;
  destination: string;
}

export type ToolStatus = "started" | "succeeded" | "failed";

export interface AgentToolEvent {
  type: "agent:tool";
  agentId: AgentSlug;
  tool: string;
  status: ToolStatus;
}

export interface AgentTokenEvent {
  type: "agent:token";
  agentId: AgentSlug;
  token: string;
}

export interface AgentDoneEvent {
  type: "agent:done";
  agentId: AgentSlug;
  message: string;
}

export interface AgentEmotionEvent {
  type: "agent:emotion";
  agentId: AgentSlug;
  emotion: Emotion;
}

export type ClientToServerEvent = UserMessageEvent;

export type ServerToClientEvent =
  | AgentThinkingEvent
  | AgentMoveEvent
  | AgentToolEvent
  | AgentTokenEvent
  | AgentDoneEvent
  | AgentEmotionEvent;

export type MindspaceEvent = ClientToServerEvent | ServerToClientEvent;
