# Informasi Database FinanceHub

## Lokasi Database
Database disimpan di: `/home/z/my-project/db/custom.db`

## Tipe Database
- **SQLite** - Database file-based yang ringan dan portabel
- Dikelola menggunakan **Prisma ORM**

## Struktur Database

### Tabel Categories
Menyimpan semua kategori transaksi:
- `id` - Unique identifier
- `name` - Nama kategori (contoh: Gaji Bulanan, Makanan)
- `type` - Tipe kategori: "income" atau "expense"
- `color` - Warna untuk tampilan UI
- `icon` - Emoji untuk tampilan UI
- `createdAt` - Waktu pembuatan
- `updatedAt` - Waktu terakhir update

### Tabel Transactions
Menyimpan semua transaksi:
- `id` - Unique identifier
- `title` - Judul transaksi
- `amount` - Jumlah uang
- `type` - Tipe: "income" atau "expense"
- `date` - Tanggal transaksi
- `description` - Deskripsi opsional
- `categoryId` - ID kategori yang terkait
- `createdAt` - Waktu pembuatan
- `updatedAt` - Waktu terakhir update

## Inisialisasi Otomatis

App sekarang memiliki mekanisme **auto-seed** yang akan:
1. Mengecek apakah ada kategori di database
2. Jika belum ada, otomatis membuat 56 kategori bawaan:
   - 10 kategori pemasukan
   - 46 kategori pengeluaran

## API Endpoints Terkait Database

### `GET /api/init`
- Otomatis menginisialisasi database jika kosong
- Dipanggil otomatis saat app pertama kali dibuka
- Tidak perlu manual

### `GET /api/categories`
- Mengambil semua kategori

### `POST /api/categories`
- Membuat kategori baru

### `PUT /api/categories/[id]`
- Update kategori yang ada

### `DELETE /api/categories/[id]`
- Hapus kategori (hanya jika tidak ada transaksi)

### `GET /api/transactions`
- Mengambil semua transaksi

### `POST /api/transactions`
- Membuat transaksi baru

### `PUT /api/transactions/[id]`
- Update transaksi

### `DELETE /api/transactions/[id]`
- Hapus transaksi

## Saat Publish ke Production

### Masalah yang Solved:
❌ **Sebelumnya**: Kategori hilang saat di-publish ke space.z.ai
✅ **Sekarang**: App otomatis menginisialisasi kategori bawaan saat pertama kali dibuka

### Catatan Penting:
1. **Database bersifat per-instance** - Setiap deployment punya database sendiri
2. **Transaksi tidak persisten antar deployment** - Data transaksi akan reset jika database di-reset
3. **Kategori otomatis dibuat** - Tidak perlu setup manual kategori

### Solusi untuk Production:
Jika ingin data tetap ada antar deployment:
- Gunakan database eksternal (MySQL, PostgreSQL) daripada SQLite
- Atur environment variable `DATABASE_URL` untuk database eksternal
- Update file `.env` dan `prisma/schema.prisma` sesuai provider database

## Backup Database

Untuk backup database lokal:
```bash
# Copy database file
cp /home/z/my-project/db/custom.db /path/to/backup/
```

Untuk restore:
```bash
# Restore dari backup
cp /path/to/backup/custom.db /home/z/my-project/db/
```

## Reset Database (Hati-hati!)

Jika ingin reset database total:
```bash
# Hapus database file
rm /home/z/my-project/db/custom.db

# Push ulang schema ke database
bun run db:push
```

⚠️ **Peringatan**: Ini akan menghapus SEMUA data (transaksi dan kategori)!
