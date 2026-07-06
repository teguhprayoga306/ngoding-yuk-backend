// ============================================================
// models/Course.js — Struktur data Kursus di MongoDB
// ============================================================

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options:  [{ type: String }],
  answer:   { type: Number, required: true }, // index jawaban benar
});

const courseSchema = new mongoose.Schema({
  id:          { type: String, required: true, unique: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, default: 'general' },
  level:       { type: String, default: 'Pemula' },
  status:      { type: String, default: 'Aktif' },
  image:       { type: String, default: '' },
  quizzes:     [questionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
