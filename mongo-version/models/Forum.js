// ============================================================
// models/Forum.js — Struktur data Forum di MongoDB
// ============================================================

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  author:     { type: String, required: true },
  authorId:   { type: String, required: true },
  authorRole: { type: String, default: 'user' },
  content:    { type: String, required: true },
}, { timestamps: true });

const topicSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  category:   { type: String, required: true },
  author:     { type: String, required: true },
  authorId:   { type: String, required: true },
  authorRole: { type: String, default: 'user' },
  messages:   [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model('ForumTopic', topicSchema);
