import type { AgentSlug } from '@mindspace/shared-types';

export interface AgentVoiceConfig {
  proveedor: string;
  voice_id: string;
}

export interface AgentConfig {
  slug: AgentSlug;
  nombre: string;
  rol: string;
  sprite: string;
  voz: AgentVoiceConfig;
  herramientas: string[];
  estacion?: string;
  prompt_sistema: string;
  activo: boolean;
}
