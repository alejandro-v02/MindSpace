import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { AgentSlug } from '@mindspace/shared-types';
import { AgentsService } from '../agents/agents.service';

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface OrchestratorCallbacks {
  onThinking: (agentId: AgentSlug) => void;
  onToken: (agentId: AgentSlug, token: string) => void;
  onDone: (agentId: AgentSlug, message: string) => void;
}

const MAX_HISTORY_TURNS = 20;
const MAX_RESPONSE_TOKENS = 1024;
const MAX_INPUT_CHARS = 4000;

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly history = new Map<string, ConversationTurn[]>();

  constructor(
    private readonly agents: AgentsService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY no está configurada. El chat fallará hasta que se agregue en .env',
      );
    }
    this.client = new Anthropic({ apiKey });
    this.model =
      this.config.get<string>('ANTHROPIC_MODEL') ?? 'claude-sonnet-5-5';
  }

  async handleUserMessage(
    conversationId: string,
    text: string,
    callbacks: OrchestratorCallbacks,
  ): Promise<void> {
    const trimmed = text.trim().slice(0, MAX_INPUT_CHARS);
    if (!trimmed) return;

    // Fase 1: A.L.E.J.O. responde todo directamente. El enrutamiento a otros
    // agentes (Dev, Cyber, Research) llega en la fase 2.
    const agentId: AgentSlug = 'alejo';
    const agent = this.agents.get(agentId);

    const turns = this.history.get(conversationId) ?? [];
    turns.push({ role: 'user', content: trimmed });

    callbacks.onThinking(agentId);

    let fullResponse = '';
    try {
      const stream = this.client.messages.stream({
        model: this.model,
        max_tokens: MAX_RESPONSE_TOKENS,
        system: agent.prompt_sistema,
        messages: turns.map((turn) => ({
          role: turn.role,
          content: turn.content,
        })),
      });

      stream.on('text', (delta) => {
        fullResponse += delta;
        callbacks.onToken(agentId, delta);
      });

      await stream.finalMessage();
    } catch (error) {
      this.logger.error('Falló la llamada a la API de Claude', error);
      fullResponse =
        fullResponse ||
        'Se me cruzaron los cables hablando con mi modelo. Intenta de nuevo en un momento.';
    }

    turns.push({ role: 'assistant', content: fullResponse });
    this.history.set(conversationId, turns.slice(-MAX_HISTORY_TURNS));

    callbacks.onDone(agentId, fullResponse);
  }
}
