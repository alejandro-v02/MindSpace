import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { load } from 'js-yaml';
import type { AgentSlug } from '@mindspace/shared-types';
import type { AgentConfig } from './agent-config.interface';

function resolveAgentsDir(): string {
  const candidates = [
    resolve(process.cwd(), 'agents'),
    resolve(process.cwd(), '../../agents'),
    resolve(__dirname, '../../../../agents'),
    resolve(__dirname, '../../../agents'),
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      `No se encontró el directorio agents/ en ninguna de estas rutas: ${candidates.join(', ')}`,
    );
  }
  return found;
}

@Injectable()
export class AgentsService implements OnModuleInit {
  private readonly logger = new Logger(AgentsService.name);
  private readonly agents = new Map<AgentSlug, AgentConfig>();

  onModuleInit(): void {
    const agentsDir = resolveAgentsDir();
    const files = readdirSync(agentsDir).filter((file) =>
      file.endsWith('.yaml'),
    );

    for (const file of files) {
      const raw = readFileSync(join(agentsDir, file), 'utf-8');
      const config = load(raw) as AgentConfig;
      this.agents.set(config.slug, config);
    }

    this.logger.log(`Agentes cargados: ${[...this.agents.keys()].join(', ')}`);
  }

  get(slug: AgentSlug): AgentConfig {
    const agent = this.agents.get(slug);
    if (!agent) {
      throw new Error(`Agente desconocido: ${slug}`);
    }
    return agent;
  }

  list(): AgentConfig[] {
    return [...this.agents.values()];
  }
}
