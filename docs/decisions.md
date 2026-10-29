# Decisiones técnicas

1. **React + Vite para el frontend**, en vez de Angular. Integra bien con Phaser 3 vía
   un wrapper delgado, y el ecosistema de Vite mantiene el ciclo de desarrollo rápido
   para un proyecto de portafolio de este tamaño.

2. **pnpm con workspaces** para el monorepo (`apps/*`, `packages/*`). Instala más
   rápido que npm y comparte dependencias entre `apps/web` y `apps/api` sin duplicar
   `node_modules`.

3. **NestJS como orquestador central**, no solo API. El gateway de WebSocket, los
   módulos y la arquitectura hexagonal encajan con el flujo de "A.L.E.J.O. decide,
   delega, y transmite eventos" descrito en la arquitectura.

4. **PostgreSQL + pgvector en un solo motor** en vez de una base vectorial separada.
   Simplifica el despliegue (un solo contenedor de datos) y es suficiente para el
   volumen de memoria que maneja un proyecto de portafolio.

5. **Contrato de eventos compartido** (`packages/shared-types`) en vez de duplicar
   tipos en cliente y servidor. Evita que el WebSocket se desincronice entre
   `apps/web` y `apps/api` a medida que se agregan eventos.
