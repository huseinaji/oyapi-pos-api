# =============================================================================
# Stage 1: deps
# Install ALL dependencies (dev + prod) with bun — shared cache layer
# =============================================================================
FROM oven/bun:1-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile


# =============================================================================
# Stage 2: build
# Compile TypeScript → dist/ with nest build (uses tsc under the hood),
# then install prod-only node_modules for the runtime stage.
# =============================================================================
FROM oven/bun:1-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build \
 && bun install --frozen-lockfile --production


# =============================================================================
# Stage 3: migration
# Runs sequelize-cli db:migrate against the target environment.
# Migration files are plain JS — no TypeScript compile needed.
#
# NODE_ENV diambil dari --env-file atau -e saat docker run.
# Default fallback ke "development" jika tidak di-set.
#
# Build:
#   docker build --target migration -t pos-migration .
#
# Run (NODE_ENV dari .env):
#   docker run --env-file .env pos-migration
#
# Run dengan override NODE_ENV:
#   docker run --env-file .env -e NODE_ENV=staging pos-migration
#
# Undo last migration:
#   docker run --env-file .env -e MIGRATE_CMD=db:migrate:undo pos-migration
# =============================================================================
FROM oven/bun:1-alpine AS migration

WORKDIR /app

# Full node_modules dari deps (butuh sequelize-cli, sequelize, mysql2, dotenv)
COPY --from=deps /app/node_modules ./node_modules

# Migration runtime files only
COPY .sequelizerc ./
COPY src/database/config/database.config.js ./src/database/config/database.config.js
COPY src/database/migrations ./src/database/migrations

ENV MIGRATE_CMD=db:migrate

CMD ["sh", "-c", "NODE_ENV=${NODE_ENV:-development} node_modules/.bin/sequelize-cli $MIGRATE_CMD"]


# =============================================================================
# Stage 4: runtime
# Lean production image — compiled JS only, no source, no devDependencies.
# Runs with Node.js (not bun) for NestJS compatibility stability.
#
# NODE_ENV diambil dari --env-file atau -e saat docker run.
#
# Build:
#   docker build -t pos-app .
#
# Run:
#   docker run --env-file .env -p 3001:3001 pos-app
# =============================================================================
FROM node:20-alpine AS runtime

WORKDIR /app

# Non-root user for security
RUN addgroup -S nodeapp && adduser -S -G nodeapp nodeapp

# Compiled app + prod dependencies only
COPY --from=build /app/dist          ./dist
COPY --from=build /app/node_modules  ./node_modules
COPY --from=build /app/package.json  ./package.json

USER nodeapp

EXPOSE 3001

CMD ["node", "dist/main"]
