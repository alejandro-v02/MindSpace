# Arquitectura

```
Navegador (React + Vite + Phaser 3)
    | WebSocket (estado del mundo, mensajes, streaming)
    | HTTP (auth, historial)
NestJS (API Gateway + Orquestador)
    |-- Claude API (tool use)
    |-- Servidor MCP propio (packages/mcp-server)
    |-- FastAPI (RAG, embeddings) (apps/ai-service)
    |-- PostgreSQL + pgvector
    |-- Redis (estado en vivo, colas)
```

## Flujo de un mensaje

1. El usuario escribe o habla; el cliente envía el mensaje por WebSocket (`user:message`).
2. El orquestador (A.L.E.J.O., en `apps/api`) decide qué agente debe responder.
3. Si hace falta una herramienta, el servidor emite `agent:move` hacia la estación
   correspondiente.
4. El agente llama a la herramienta vía `packages/mcp-server` o `apps/ai-service`,
   recibe el resultado y genera la respuesta en streaming (`agent:token` / `agent:done`).
5. El cliente muestra el texto, reproduce la voz y sincroniza la boca del sprite.
6. La conversación y los embeddings se guardan en Postgres.

El contrato de eventos vive en `packages/shared-types/src/events.ts` y lo usan tanto
`apps/web` como `apps/api`, para que no se desincronice.

## Agentes

Cada agente se define en `agents/*.yaml`: slug, nombre, sprite, voz, prompt de sistema
y herramientas permitidas. Ver [agents/](../agents/).

| Agente | Rol | Herramientas |
| --- | --- | --- |
| A.L.E.J.O. | Anfitrión: conversa y reparte tareas | Orquestación, memoria |
| Dev | Revisa código y repositorios | MCP de GitHub / lectura de repos |
| Cyber | Análisis y explicaciones de ciberseguridad | Base de conocimiento propia (RAG) |
| Research | Busca y resume información | Búsqueda web |

## Estructura del repositorio

```
mindspace/
  apps/
    web/           # cliente (React + Vite + Phaser)
    api/            # NestJS
    ai-service/     # FastAPI
  packages/
    shared-types/   # eventos y DTOs compartidos
    mcp-server/      # servidor MCP propio
  agents/           # configuración de cada agente (yaml)
  assets/sprites/   # spritesheets y mapas
  docs/             # arquitectura, decisiones
  docker-compose.yml
  .github/workflows/
```

Documentación completa del plan original: ver el PDF "Mindspace: documentación
técnica" compartido al iniciar el proyecto (secciones 1-15).
