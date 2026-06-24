// backend/server.js (atau src/server.ts jika masih pakai TypeScript)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Konfigurasi CORS sangat penting agar Frontend HTML Murni bisa menghubungi API
app.use(cors({
    origin: '*', // Izinkan akses dari mana saja (bisa diubah jadi 'https://rifqy-space.vercel.app' nanti)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Import middleware dan router yang sudah ada sebelumnya
// const { verifyToken } = require('./middleware/auth.middleware');
// const authRoutes = require('./routes/auth');
// const fileRoutes = require('./routes/files');

// Routing API
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'RifqySpace Backend API Online' });
});

// Contoh Pemasangan Router (Sesuaikan dengan nama folder controllermu)
// app.use('/api/auth', authRoutes);
// app.use('/api/files', verifyToken, fileRoutes);

app.listen(PORT, () => {
    console.log(`[Backend API] Berjalan di http://localhost:${PORT}`);
});
