# Se construye con contexto en la raíz del monorepo (ver docker-compose.yml),
# porque depende del workspace @mindspace/shared-types y de ../../agents.
FROM node:20-slim
WORKDIR /repo
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile

COPY packages/shared-types packages/shared-types
COPY agents agents
COPY apps/api apps/api
RUN pnpm --filter @mindspace/shared-types build
RUN pnpm --filter api build

WORKDIR /repo/apps/api
EXPOSE 3000
CMD ["node", "dist/main"]
