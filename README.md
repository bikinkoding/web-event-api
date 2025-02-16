# Web Event API

## Deskripsi Proyek
REST API untuk Aplikasi Web Event yang dibangun dengan Node.js, Express, dan MySQL.

## Daftar Isi
- [Prasyarat](#prasyarat)
- [Teknologi](#teknologi)
- [Instalasi](#instalasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Kontribusi](#kontribusi)

## Prasyarat
- Node.js (versi 14 atau lebih tinggi)
- Server MySQL
- npm (Node Package Manager)
- Postman (untuk testing API)

## Teknologi
- Express.js - Framework web
- MySQL - Database
- Sequelize - ORM
- JWT - Autentikasi
- Bcrypt - Password hashing
- Multer - Upload file
- Nodemailer - Email service

## Instalasi

1. Clone repositori
```bash
git clone https://github.com/username/web-event-api.git
cd web-event-api
```

2. Install dependencies
```bash
npm install
```

3. Setup Environment Variables
Salin file `example.env` menjadi `.env`:
```bash
cp example.env .env
```

Berikut adalah konfigurasi dalam file `.env`:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=localhost
DB_NAME=web_event_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# SMTP API Configuration
SMTP_API_URL=http://localhost:3001
SMTP_API_KEY=your_smtp_api_key

# Frontend URL (for reset password)
FRONTEND_URL=http://localhost:3000
```

4. Setup Database dan Migrasi

a. Buat database MySQL:
```bash
mysql -u root -p
```

Setelah masuk ke MySQL shell, jalankan:
```sql
CREATE DATABASE web_event_db;
exit;
```

b. Jalankan migrasi database:
```bash
# Install knex secara global jika belum
npm install knex -g

# Jalankan migrasi
npm run migrate
# atau
knex migrate:latest
```

c. (Opsional) Jalankan seeder untuk mengisi data awal:
```bash
# Jalankan semua seeder
npm run seed
# atau
knex seed:run

# Jalankan seeder spesifik (jika ada)
knex seed:run --specific=01_users.js
```

5. Jalankan Aplikasi

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

Server akan berjalan di `http://localhost:3001`

## Menjalankan Aplikasi

### Mode Development
```bash
npm run dev
```

### Mode Production
```bash
npm run build
npm start
```

## Struktur Proyek
```
web-event-api/
├── src/
│   ├── config/          # Konfigurasi aplikasi dan database
│   ├── controllers/     # Logic untuk setiap route
│   ├── middleware/      # Custom middleware
│   ├── models/          # Model database
│   ├── routes/          # Definisi route
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── app.js          # Entry point
├── migrations/          # Database migrations
├── seeders/            # Database seeders
├── uploads/            # Upload directory
├── tests/              # Unit & integration tests
└── package.json
```

## API Endpoints

### Autentikasi
```
POST /api/auth/register     # Registrasi user baru
POST /api/auth/login        # Login user
POST /api/auth/forgot       # Reset password
POST /api/auth/reset        # Konfirmasi reset password
```

### Users
```
GET    /api/users          # Get semua users
GET    /api/users/:id      # Get user by ID
PUT    /api/users/:id      # Update user
DELETE /api/users/:id      # Delete user
```

### Events
```
GET    /api/events         # Get semua events
POST   /api/events         # Buat event baru
GET    /api/events/:id     # Get event by ID
PUT    /api/events/:id     # Update event
DELETE /api/events/:id     # Delete event
```

### Tickets
```
GET    /api/tickets        # Get semua tickets
POST   /api/tickets        # Buat ticket baru
GET    /api/tickets/:id    # Get ticket by ID
PUT    /api/tickets/:id    # Update ticket
DELETE /api/tickets/:id    # Delete ticket
```

### Orders
```
GET    /api/orders         # Get semua orders
POST   /api/orders         # Buat order baru
GET    /api/orders/:id     # Get order by ID
PUT    /api/orders/:id     # Update order status
DELETE /api/orders/:id     # Delete order
```

## Database

### Struktur Database
```sql
-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('mahasiswa', 'admin') DEFAULT 'mahasiswa',
    reset_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT UNSIGNED,
    price DECIMAL(10,2) DEFAULT 0,
    image_url VARCHAR(255),
    status VARCHAR(255) DEFAULT 'draft',
    created_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Blogs Table
CREATE TABLE blogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    status VARCHAR(255) DEFAULT 'draft',
    created_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Event Categories Table
CREATE TABLE event_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Event-Category Relations Table
CREATE TABLE event_category_relations (
    event_id INT UNSIGNED,
    category_id INT UNSIGNED,
    PRIMARY KEY (event_id, category_id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (category_id) REFERENCES event_categories(id)
);

-- Blog Categories Table
CREATE TABLE blog_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Blog-Category Relations Table
CREATE TABLE blog_category_relations (
    blog_id INT UNSIGNED,
    category_id INT UNSIGNED,
    PRIMARY KEY (blog_id, category_id),
    FOREIGN KEY (blog_id) REFERENCES blogs(id),
    FOREIGN KEY (category_id) REFERENCES blog_categories(id)
);

-- Event Registrations Table
CREATE TABLE event_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT UNSIGNED,
    user_id INT UNSIGNED,
    status VARCHAR(255) DEFAULT 'pending',
    payment_status VARCHAR(255) DEFAULT 'pending',
    amount_paid DECIMAL(10,2),
    payment_date TIMESTAMP,
    payment_proof_url VARCHAR(255),
    payment_notes TEXT,
    payment_confirmed_at TIMESTAMP,
    confirmed_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (confirmed_by) REFERENCES users(id)
);
```

### Relasi Database
1. **Users - Events**
   - One-to-Many: Satu user bisa membuat banyak event
   - Relasi melalui kolom `created_by` di tabel events

2. **Users - Blogs**
   - One-to-Many: Satu user bisa membuat banyak blog
   - Relasi melalui kolom `created_by` di tabel blogs

3. **Events - Categories**
   - Many-to-Many: Satu event bisa memiliki banyak kategori, satu kategori bisa dimiliki banyak event
   - Relasi melalui tabel `event_category_relations`

4. **Blogs - Categories**
   - Many-to-Many: Satu blog bisa memiliki banyak kategori, satu kategori bisa dimiliki banyak blog
   - Relasi melalui tabel `blog_category_relations`

5. **Events - Registrations**
   - One-to-Many: Satu event bisa memiliki banyak registrasi
   - Relasi melalui kolom `event_id` di tabel event_registrations

6. **Users - Registrations**
   - One-to-Many: Satu user bisa memiliki banyak registrasi event
   - Relasi melalui kolom `user_id` di tabel event_registrations

## Error Handling
API menggunakan format error response yang konsisten:
```json
{
    "status": "error",
    "code": 400,
    "message": "Pesan error yang deskriptif",
    "errors": [
        "Detail error 1",
        "Detail error 2"
    ]
}
```

## Security
- JWT untuk autentikasi
- Rate limiting untuk mencegah abuse
- CORS configuration
- Helmet untuk security headers
- Input validation dan sanitization
- Password hashing dengan bcrypt

## Testing
```bash
# Menjalankan unit test
npm run test

# Menjalankan test dengan coverage
npm run test:coverage
```

## Kontribusi
1. Fork repositori
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## Lisensi
[MIT License](LICENSE)

## Kontak
Email: emailhendra2@gmail.com
Project Link: https://github.com/username/web-event-api