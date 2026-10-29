# Se construye con contexto en la raíz del monorepo (ver docker-compose.yml),
# porque depende del workspace @mindspace/shared-types.
FROM node:20-slim
WORKDIR /repo
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

COPY packages/shared-types packages/shared-types
COPY apps/web apps/web
RUN pnpm --filter @mindspace/shared-types build

WORKDIR /repo/apps/web
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
