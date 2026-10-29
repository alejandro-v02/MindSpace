# Mindspace

Un mundo pixel art en tiempo real donde viven varias IAs con avatar propio: caminan,
hablan, usan herramientas y conversan contigo y entre ellas.

> Proyecto de portafolio. Demuestra backend en tiempo real, orquestación
> multiagente con IA, frontend interactivo con animación, y buenas prácticas de
> ingeniería (Docker, CI, tests, documentación).

## Arquitectura

Ver [docs/architecture.md](docs/architecture.md) para el diagrama completo y el
flujo de un mensaje, y [docs/decisions.md](docs/decisions.md) para las decisiones
técnicas clave.

```
apps/web          cliente (React + Vite + Phaser 3)
apps/api          NestJS: API Gateway + Orquestador
apps/ai-service    FastAPI: RAG y embeddings
packages/shared-types  contrato de eventos WebSocket y DTOs compartidos
packages/mcp-server     servidor MCP propio (herramientas de los agentes)
agents/            configuración de cada agente (yaml)
assets/sprites/    spritesheets y mapas
```

## Desarrollo local

Requisitos: Node.js 20+, pnpm, Python 3.12+, Docker Desktop, Git.

```bash
cp .env.example .env     # completa las variables (clave de la API de Claude, etc.)
docker compose up        # levanta postgres, redis, ai-service, api y web
```

O, sin Docker, por servicio:

```bash
pnpm install
pnpm dev:api              # apps/api en :3000
pnpm dev:web              # apps/web en :5173

cd apps/ai-service
uv pip install -e .[dev]  # o: pip install -e .[dev]
uvicorn app.main:app --reload
```

## Estado del proyecto

En construcción. Ver [docs/architecture.md](docs/architecture.md) sección "Fases e
hitos" para el roadmap (mundo + A.L.E.J.O. → multiagente → herramientas → memoria y
voz → pulido).
