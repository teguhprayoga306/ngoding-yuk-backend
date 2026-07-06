// ============================================================
// models/Topic.js — Struktur data Topik di MongoDB
// ============================================================

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  id:       { type: Number, required: true },
  question: { type: String, required: true },
  options:  [{ type: String }],
  answer:   { type: Number, required: true }, // index jawaban benar
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text:  { type: String },
  code: { type: String },
  items: [{ type: String }],
}, { _id: false });

const contentSchema = new mongoose.Schema({
  overview:  { type: String, default: '' },
  lessons:   [{ type: String }],
  resources: [{ type: String }],
  sections:  [sectionSchema],
}, { _id: false });

const topicSchema = new mongoose.Schema({
  id:          { type: String, required: true, unique: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  courseId:    { type: String, required: true }, // relasi ke Course
  level:       { type: String, default: 'Pemula' },
  duration:    { type: String, default: '10 menit' },
  icon:        { type: String, default: 'fas fa-book' },
  category:    { type: String, default: 'general' },
  content:     contentSchema,
  quiz:        [quizSchema],
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);
