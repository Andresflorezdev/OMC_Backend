FROM node:22-alpine AS base

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm approve-builds --all || true

RUN pnpm install --frozen-lockfile --unsafe-perm

RUN pnpm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
