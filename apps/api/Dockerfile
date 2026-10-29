FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable

COPY package.json ./
RUN pnpm install

COPY . .
RUN pnpm run build

EXPOSE 3000
CMD ["node", "dist/main"]
