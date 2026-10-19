# POS App API

Backend aplikasi point of sale yang dibuat pakai NestJS, TypeScript, dan Bun. API ini memakai PostgreSQL untuk database dan Redis untuk session serta queue.

## Yang dipakai

- NestJS 12 dengan Fastify
- Sequelize untuk akses PostgreSQL
- Sequelize CLI untuk migration
- Redis untuk session, cache, dan queue
- Bun untuk development, build, dan menjalankan aplikasi
- Docker multistage untuk image production yang lebih ramping

## Sebelum mulai

Pastikan sudah ada:

- Bun
- PostgreSQL
- Redis
- Docker, kalau mau menjalankan lewat container

Install dependency:

```bash
bun install
```

Buat file `.env` di root project. File ini tidak ikut di-commit dan tidak masuk ke image Docker. Isi nilai sesuai environment-mu:

```env
NODE_ENV=local
APP_PORT=3000
CORS_ORIGINS=http://localhost:3003
ENABLE_SWAGGER=false
DATABASE_URL=postgresql://<user>:<password>@<pooled-host>/<database>?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://<user>:<password>@<direct-host>/<database>?sslmode=require
REDIS_HOST=redis://<host>:<port>
SESSION_SECRET=<secret-session-yang-panjang>
INITIAL_USER_ID=<id-user-awal>
INITIAL_STORE_ID=<id-toko-awal>
ADMIN_PASS=<password-admin-awal>
```

Kalau pakai Neon, dua URL ini bisa diambil dari dashboard project lewat **Connect**:

- `DATABASE_URL`: pilih **Pooled connection**. Hostname biasanya punya akhiran `-pooler`. Dipakai aplikasi NestJS untuk traffic reguler; pooler Neon (PgBouncer) membantu mengelola banyak koneksi client.
- `DATABASE_URL_UNPOOLED`: pilih **Direct connection**. Hostname tidak punya akhiran `-pooler`. Dipakai Sequelize CLI untuk migration. Migration/schema changes lebih cocok memakai koneksi direct.

Ganti `<pooled-host>` dan `<direct-host>` dengan hostname lengkap yang diberikan Neon. Jangan menambahkan `-pooler` secara manual—salin URL dari Neon. Simpan kedua URL sebagai rahasia; jangan commit `.env`.

Di production, isi `.env` production dengan `NODE_ENV=production` dan URL Neon untuk branch/database production. Set `CORS_ORIGINS` ke daftar origin frontend, pisahkan dengan koma (contoh `https://pos.example.com`). Kalau tidak diset, CORS lintas origin ditutup di production. Swagger mati secara default di production; set `ENABLE_SWAGGER=true` hanya kalau dokumentasi memang perlu dibuka. Migration config menyediakan environment `local` dan `production`; `staging` tidak dikonfigurasi di project ini. `DATABASE_URL` dipakai aplikasi dan `DATABASE_URL_UNPOOLED` dipakai migration, baik di local maupun production. Tidak perlu mengisi `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, atau `DB_PORT`.

Jangan taruh credential production di repository atau di README.

## Jalanin di lokal

Jalankan API dalam watch mode:

```bash
bun run start:dev
```

Build dan jalankan seperti production:

```bash
bun run build
bun run start:prod
```

Dokumentasi Swagger tersedia di `/doc` saat development. Di production, Swagger mati secara default dan hanya aktif jika `ENABLE_SWAGGER=true`. Prefix API memakai `/api/` dan versioning URI, jadi endpoint versi pertama ada di bawah `/api/v1`.

## Database migration

Migration Sequelize ada di `src/infrastructure/database/migrations`, dan path-nya diatur oleh `.sequelizerc`.

Jalankan migration lokal:

```bash
bun run migrate
```

Rollback satu migration terakhir:

```bash
bun run migrate:undo
```

Pastikan `NODE_ENV` sesuai konfigurasi Sequelize (`local` atau `production`) dan `DATABASE_URL_UNPOOLED` tersedia sebelum menjalankan migration.

## Docker

Dockerfile punya dua target utama:

- `runtime`: aplikasi hasil compile, Bun, dependency production saja, user non-root.
- `migration`: Sequelize CLI dan file migration/configuration saja. CLI dijalankan dengan Node.js karena Sequelize CLI tidak berjalan dengan benar di Bun.

Build image aplikasi dengan tag yang dipakai pada contoh di bawah:

```bash
docker build --target runtime -t pos-app:latest .
```

Jalankan migration terlebih dahulu. Nilai `NODE_ENV` dibaca dari `.env`; gunakan `local` atau `production` sesuai database yang mau dipakai. Migration memakai `DATABASE_URL_UNPOOLED`:

```bash
docker build --target migration -t pos-app:migration .
docker run --rm --env-file .env pos-app:migration
```

Setelah migration sukses, jalankan API. Container membaca `APP_PORT` dari `.env`, jadi port setelah titik dua di `-p` harus sama dengan nilai `APP_PORT`. Misalnya kalau `.env` berisi `APP_PORT=3001`:

```bash
docker run --rm --env-file .env -p 127.0.0.1:3001:3001 pos-app:latest
```

Untuk production, pasang named volume ke `/app/logs` agar file log tetap tersimpan walaupun container diganti:

```bash
docker volume create pos-app-logs
docker run -d --name pos-app --env-file .env -p 127.0.0.1:3001:3001 -v pos-app-logs:/app/logs pos-app:latest
```

Log aplikasi tersimpan di volume `pos-app-logs` pada folder `app/`, sedangkan log error ada di `error/`. Lihat isi log dengan:

```bash
docker run --rm -v pos-app-logs:/logs alpine find /logs -type f
```

Format mapping Docker adalah `host:container`. Jadi `127.0.0.1:3001:3001` membuat API tersedia di `http://localhost:3001` dan hanya bisa diakses dari komputer yang menjalankan Docker. Kalau mau pakai port `3001` di komputer tapi aplikasi di container mendengarkan `3000`, set `APP_PORT=3000` di `.env` lalu gunakan `-p 127.0.0.1:3001:3000`.

Kalau `APP_PORT` tidak diset, aplikasi memakai port default `3000`; samakan port container di opsi `-p` dengan port tersebut.

Kalau sebelumnya sudah punya image dengan tag yang sama, build ulang setelah ada perubahan Dockerfile atau kode aplikasi. Entry point hasil build NestJS di image ini adalah `dist/src/main.js`.

### Pull image dari GitHub Container Registry

Workflow GitHub Actions akan menjalankan unit test dan build NestJS, lalu build dan push target `runtime` ke GHCR setiap ada push ke branch `master`. Image runtime diberi tag `latest` dan `sha-<commit>`. Target migration juga dipush dengan tag `migration-latest` dan `migration-sha-<commit>`.

```bash
docker pull ghcr.io/<owner>/<repository>:latest
docker volume create pos-app-logs
docker run -d --name pos-app --env-file .env -p 127.0.0.1:3001:3001 -v pos-app-logs:/app/logs ghcr.io/<owner>/<repository>:latest
```

Ganti `<owner>` dan `<repository>` sesuai akun/organisasi GitHub dan nama repository-mu. Kalau package masih private, login dulu ke GHCR dengan akun GitHub yang punya akses:

```bash
docker login ghcr.io -u <username-github>
```

Saat diminta password, gunakan GitHub Personal Access Token yang punya izin `read:packages`. Workflow memakai `GITHUB_TOKEN` dengan izin `packages: write`, jadi tidak perlu menyimpan PAT sebagai repository secret untuk proses publish. Atur package menjadi public di pengaturan package GHCR kalau image perlu di-pull tanpa login.

Rollback migration terakhir:

```bash
docker run --rm --env-file .env pos-app:migration db:migrate:undo
```

Untuk menjalankan migration image yang sudah dipublish, pakai tag `migration-latest` (atau tag SHA migration yang sesuai):

```bash
docker run --rm --env-file .env ghcr.io/<owner>/<repository>:migration-latest
```

Urutan amannya: jalankan migration satu kali sebagai langkah deploy, lalu start container API. Jangan jalankan migration bersamaan di setiap replica aplikasi.

`bun install --production` di Dockerfile beda dengan `NODE_ENV=production`: opsi Bun itu hanya menginstall `dependencies` dan melewatkan `devDependencies` untuk mengurangi ukuran image runtime. Nilai `NODE_ENV` aplikasi tetap dibaca dari file yang diberikan lewat `docker run --env-file`.

Login dan registrasi dibatasi masing-masing 5 dan 3 request per menit per alamat IP; ada juga batas umum 120 request per menit. Penyimpanan limiter bawaan ada di memori proses, jadi untuk deployment multi-replica perlu storage rate-limit terdistribusi.

Log production ditulis sebagai file JSON berotasi di volume `/app/logs`. Named volume direkomendasikan karena direktorinya disiapkan dengan ownership user aplikasi non-root. Kalau memilih bind mount host, pastikan direktori host yang dipasang ke `/app/logs` bisa ditulis oleh UID/GID container.

Referensi Neon: [Connection pooling](https://neon.com/docs/connect/connection-pooling).

## Test

```bash
bun run test
bun run test:e2e
bun run test:cov
```
