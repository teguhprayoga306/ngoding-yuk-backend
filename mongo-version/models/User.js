// ============================================================
// models/User.js — Struktur data User di MongoDB
// Ini seperti "blueprint" bagaimana data user disimpan
// ============================================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, default: '', trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  bio:      { type: String, default: 'Saya sedang belajar coding di NGODING YUK!' },
  avatar:   { type: String, default: '' },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  status:   { type: String, enum: ['Aktif', 'Suspended'], default: 'Aktif' },
  progress: { type: Map, of: Number, default: {} },       // progress per kursus (0-100)
  quizAttempts: { type: Map, of: Object, default: {} },   // hasil quiz per kursus
}, { timestamps: true }); // otomatis tambah createdAt & updatedAt

module.exports = mongoose.model('User', userSchema);
