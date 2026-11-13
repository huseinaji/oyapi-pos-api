# Panduan Live API E2E

`api.e2e-spec.ts` menjalankan integration test terhadap API NestJS yang sudah
berjalan. Test menggunakan HTTP sungguhan, session cookie, database, Redis, dan
Swagger lokal; test ini bukan pengganti unit test.

## Prasyarat

- Jalankan API pada `API_BASE_URL` (default `http://localhost:3001`), beserta
  database dan Redis yang dipakai oleh API.
- Gunakan environment test/development yang aman dan dapat dibersihkan. Jangan
  arahkan suite ini ke production karena test membuat serta menghapus data.
- Sediakan akun global administrator dan akun user biasa yang valid. User biasa
  akan ditambahkan ke store fixture oleh test.
- Pastikan file `.env` berisi `E2E_ADMIN_USERNAME`, `E2E_ADMIN_PASSWORD`,
  `E2E_USER_USERNAME`, dan `E2E_USER_PASSWORD`. Jest memuat `.env` melalui
  `dotenv/config`; nilai credential tidak dicetak oleh test.

## Menjalankan

```sh
bun run test:e2e:api
```

Suite sebaiknya dijalankan utuh. Test berbagi fixture dan session yang dibuat
oleh test sebelumnya, jadi menjalankan satu test dengan filter Jest dapat
gagal karena prasyarat fixture belum ada.

## Alur suite

1. **Health** — memastikan endpoint health menjawab.
2. **Auth** — login admin dan user, cek status dan session cookie, uji
   credential/field yang tidak valid, registrasi user sementara, lalu cek
   `me`, logout, cookie yang dibersihkan, dan session yang sudah tidak berlaku.
3. **Users** — admin mencari user fixture; role user biasa ditolak pada route
   admin-only; test membaca, mengubah, dan menghapus user sementara.
4. **Stores dan memberships** — membuat dua store terisolasi (utama dan foreign),
   menambahkan user sebagai member, memilih store, lalu menguji daftar member,
   update role langsung melalui `storeId` tanpa memilih store terlebih dahulu
   untuk global admin, akses foreign-store, disable, dan re-assign.
5. **Inventory** — membuat item global dan item store (produk, bahan baku,
   bundle, serta item disposable); menguji list/detail, update/delete, kategori,
   serta batas ownership saat membaca, mengubah, menghapus item, atau menambah
   komponen bundle lintas-store.
6. **POS session dan transaksi** — membuat transaksi pada store foreign untuk
   skenario ownership, menutup sesinya, lalu membuka sesi store utama. Endpoint
   sellable-item diverifikasi hanya mengembalikan item store aktif non-bahan
   baku, mengecualikan item foreign, dan menghitung stok produk/bundle dari
   session item. Sesudahnya dibuat invoice fixture.
7. **Invoice dan stok** — menguji default invoice hari ini dalam UTC, filter
   rolling last 30 days dengan timezone, custom tanggal inklusif dengan timezone,
   serta validasi rentang custom dan kewajiban timezone; juga
   menguji detail/complete invoice, menolak pembacaan atau penyelesaian invoice
   foreign, menguji penghapusan invoice, serta membaca stock ledger, bins, dan
   stock adjustments.
8. **Cleanup** — menghapus invoice fixtures, item (termasuk bundle yang
   menghapus component melalui cascade), kategori, dan item global; menonaktifkan
   membership fixture; lalu menghapus store. User hasil registrasi juga dihapus
   oleh skenario Users. `afterAll` mencoba mengulang cleanup yang belum selesai
   dan melaporkan kegagalan cleanup.
9. **Throttle dan Swagger coverage** — sebagai langkah akhir, memeriksa batas
   login (5) dan register (3) per IP, kemudian membandingkan semua method/path
   di `/doc-json` dengan operasi yang pernah dipanggil suite.

Setiap fixture memakai prefix acak `api-e2e-*`. Request agent mendapat IP
forwarded acak agar hitungan throttle test tidak mengganggu login fixture atau
test lain. Jangan menghapus atau menggunakan ulang akun fixture aplikasi
sebagai akun yang dibuat suite.

Endpoint delete user dan store menggunakan soft-delete sesuai model aplikasi.
Karena itu, keduanya tidak lagi tampil/aktif melalui API, tetapi row dan data
audit terkait masih dapat tersimpan di database; suite tidak menjalankan hard
delete SQL.

## Membaca hasil dan batas cakupan

- Test dikelompokkan dengan `describe` per module/controller dan `it` per
  skenario; nama setiap test menyebut endpoint atau behavior yang diperiksa.
- Pencocokan Swagger memastikan setiap operasi HTTP terdokumentasi pernah
  disentuh. Itu tidak berarti setiap kombinasi DTO, role, query filter, dan
  business edge case sudah diuji; tambahkan skenario spesifik untuk behavior
  yang berubah.
- Test ownership memakai store utama dan store foreign. Untuk perubahan
  ownership, pastikan ada skenario akses valid dan penolakan lintas-store, serta
  verifikasi resource foreign tetap dapat dibaca oleh store pemiliknya.
- Route tambah komponen bundle saat ini tidak memiliki guard role store
  admin-only di controller. Suite menguji penambahan oleh admin dan penolakan
  komponen foreign, tetapi belum menetapkan apakah cashier memang boleh
  mengubah komposisi bundle; selaraskan aturan bisnis dan test role sebelum
  mengubah behavior tersebut.
- Bila suite gagal, periksa lebih dulu apakah API yang dituju sudah berjalan
  dengan database/Redis yang benar, kredensial test valid, dan IP throttle
  belum dipakai test lain.
