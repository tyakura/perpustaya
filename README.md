# Katalog Perpustakaan

Website katalog sederhana untuk melihat dan mencari buku dari API Laravel di `peru-api`.

## Menjalankan lokal

API memerlukan PHP 8.2 atau lebih baru dan Composer. Jika PHP terpasang lewat MacPorts tetapi perintah `php` tidak ditemukan, tambahkan `/opt/local/bin` ke `PATH`:

```sh
export PATH="/opt/local/bin:$PATH"
php -v
```

Di macOS dengan Homebrew, PHP dapat dipasang dengan `brew install php`.

Jalankan API di terminal pertama:

```sh
cd peru-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Jalankan frontend di terminal kedua:

```sh
cd frontend-perpus
npm install
npm run dev
```

Vite meneruskan permintaan `/api` ke `http://127.0.0.1:8000`. Seeder menambahkan beberapa judul buku untuk mencoba katalog.

## Endpoint katalog

- `GET /api/books` menampilkan daftar buku dengan paginasi.
- `GET /api/books?search=kata` mencari judul atau nama penulis.
- `GET /api/books/{id}` menampilkan data satu buku.
- `POST /api/books` menambahkan buku dengan `title`, `author`, dan `year` opsional.
- `PUT /api/books/{id}` memperbarui data buku.
- `DELETE /api/books/{id}` menghapus buku setelah konfirmasi dari katalog.

Data buku memakai kolom `title`, `author`, dan `year`. Tahun boleh dikosongkan. Formulir menggunakan pemilih tanggal; karena katalog hanya menyimpan tahun terbit, hari dan bulan dari tanggal pilihan tidak dicatat.
# perpustaya
# perpustaya
