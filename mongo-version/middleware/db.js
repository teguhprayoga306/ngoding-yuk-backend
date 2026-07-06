// ============================================================
// db.js — Koneksi ke MongoDB
// Dipanggil sekali saat server start di server.js
// ============================================================

const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB terhubung!');
  } catch (err) {
    console.error('❌ Gagal konek MongoDB:', err.message);
    process.exit(1); // matikan server kalau DB tidak bisa konek
  }
}

module.exports = connectDB;
