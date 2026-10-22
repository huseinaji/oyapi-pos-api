# Tahap 1: install semua dependency untuk build NestJS dan menjalankan migration.
# bun.lock + --frozen-lockfile memastikan versi dependency konsisten di tiap build.
FROM oven/bun:1-alpine AS dependencies
WORKDIR /app
COPY package.json bun.lock ./
RUN bun ci

# Tahap 2: compile source TypeScript menjadi JavaScript di folder dist/.
FROM dependencies AS build
COPY . .
RUN bun run build

# Tahap 3: install dependency production saja agar image runtime lebih kecil.
# Ini hanya memilih paket saat build (dependencies), bukan menetapkan NODE_ENV.
# Nilai NODE_ENV dan konfigurasi lain diberikan saat container dijalankan.
FROM oven/bun:1-alpine AS production-dependencies
WORKDIR /app
COPY package.json bun.lock ./
RUN bun ci

# Tahap 4: image khusus migration.
# Sequelize CLI perlu Node.js karena eksekusinya lewat Bun tidak kompatibel.
# Hanya config, .sequelizerc, migration, dan dependency yang diperlukan yang disalin.
# Bisa dipakai untuk migrate maupun command Sequelize CLI lain.
FROM node:24-alpine AS migration
WORKDIR /app
RUN addgroup -S app && adduser -S -G app app
COPY --from=dependencies --chown=app:app /app/node_modules ./node_modules
COPY --chown=app:app package.json ./
COPY --chown=app:app .sequelizerc ./
COPY --chown=app:app src/infrastructure/database/config/database.config.js ./src/infrastructure/database/config/database.config.js
COPY --chown=app:app src/infrastructure/database/migrations ./src/infrastructure/database/migrations
USER app
# Default menjalankan migration yang belum diterapkan; argumen Docker bisa menggantinya.
ENTRYPOINT ["node", "./node_modules/sequelize-cli/lib/sequelize"]
CMD ["db:migrate"]

# Tahap 5: image runtime akhir.
# Tidak membawa source TypeScript, CLI, atau devDependencies; proses jalan sebagai non-root.
FROM oven/bun:1-alpine AS runtime
WORKDIR /app
RUN addgroup -S app && adduser -S -G app app
RUN mkdir -p /app/logs/app /app/logs/error && chown -R app:app /app/logs
COPY --from=production-dependencies --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
COPY --chown=app:app package.json ./
USER app
EXPOSE 3000
CMD ["bun", "dist/main.js"]
