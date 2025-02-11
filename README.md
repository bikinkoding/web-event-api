# Web Event API

## Deskripsi Proyek
REST API untuk Aplikasi Web Event yang dibangun dengan Node.js, Express, dan MySQL.

## Prasyarat
- Node.js (versi 14 atau lebih tinggi)
- Server MySQL
- npm (Node Package Manager)

## Instalasi

1. Clone repositori
```bash
git clone https://github.com/nama-pengguna/web-event-api.git
cd web-event-api
```

2. Instal dependensi
```bash
npm install
```

3. Konfigurasi Variabel Lingkungan
- Salin `example.env` menjadi `.env`
- Edit `.env` dengan konfigurasi spesifik Anda:
  - `PORT`: Port server (default: 3001)
  - `DB_HOST`: Host basis data MySQL
  - `DB_PORT`: Port basis data MySQL
  - `DB_USER`: Nama pengguna MySQL
  - `DB_PASSWORD`: Kata sandi MySQL
  - `DB_NAME`: Nama basis data (contoh: `web_event_db`)
  - `JWT_SECRET`: Kunci rahasia untuk otentikasi JWT
  - `SMTP_API_URL`: URL API SMTP
  - `SMTP_API_KEY`: Kunci API SMTP
  - `FRONTEND_URL`: URL aplikasi frontend

4. Buat Basis Data MySQL
```bash
mysql -u root -p
CREATE DATABASE web_event_db;
exit;
```

5. Jalankan Migrasi Basis Data
```bash
npm run migrate
```

6. (Opsional) Isi Basis Data
```bash
npm run seed
```

## Menjalankan Aplikasi

### Mode Pengembangan
```bash
npm run dev
```
Server akan berjalan di `http://localhost:3001`

### Mode Produksi
```bash
npm start
```

## Endpoint API
Dokumentasi API terperinci akan ditambahkan di pembaruan mendatang.

## Struktur Proyek
- `src/`: Kode sumber
- `migrations/`: Berkas migrasi basis data
- `seeds/`: Berkas isian basis data
- `uploads/`: Direktori unggah berkas

## Dependensi
- Express.js
- Knex.js (Pembuat Kueri SQL)
- MySQL2
- JWT untuk Otentikasi
- Bcrypt untuk Hash Kata Sandi
- Nodemailer untuk Layanan Email

## Kontribusi
1. Fork repositori
2. Buat cabang fitur Anda (`git checkout -b fitur/FiturMenakjubkan`)
3. Commit perubahan Anda (`git commit -m 'Tambahkan FiturMenakjubkan'`)
4. Push ke cabang (`git push origin fitur/FiturMenakjubkan`)
5. Buka Pull Request

## Lisensi
Tentukan lisensi proyek Anda di sini.
