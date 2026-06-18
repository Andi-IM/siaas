FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["pnpm", "start"]
