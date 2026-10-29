import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { AgentSlug } from '@mindspace/shared-types';
import { OrchestratorService } from './orchestrator.service';
import { UserMessageDto } from './dto/user-message.dto';

@WebSocketGateway({
  cors: { origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173' },
})
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly orchestrator: OrchestratorService) {}

  @SubscribeMessage('user:message')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async handleUserMessage(
    @MessageBody() payload: UserMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.debug(
      `user:message de ${client.id} en ${payload.conversationId}`,
    );

    await this.orchestrator.handleUserMessage(
      payload.conversationId,
      payload.text,
      {
        onThinking: (agentId: AgentSlug) =>
          client.emit('agent:thinking', { agentId }),
        onToken: (agentId: AgentSlug, token: string) =>
          client.emit('agent:token', { agentId, token }),
        onDone: (agentId: AgentSlug, message: string) =>
          client.emit('agent:done', { agentId, message }),
      },
    );
  }
}
