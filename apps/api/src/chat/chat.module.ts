import { Module } from '@nestjs/common';
import { AgentsModule } from '../agents/agents.module';
import { ChatGateway } from './chat.gateway';
import { OrchestratorService } from './orchestrator.service';

@Module({
  imports: [AgentsModule],
  providers: [ChatGateway, OrchestratorService],
})
export class ChatModule {}
