// ============================================================
// routes/forum.js — Forum Diskusi pakai MongoDB
// ============================================================

const express     = require('express');
const ForumTopic  = require('../models/Forum');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/forum/topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await ForumTopic.find().sort({ createdAt: -1 });
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/forum/topics/:id
router.get('/topics/:id', async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Topik tidak ditemukan.' });
    res.json({ success: true, topic });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// POST /api/forum/topics
router.post('/topics', authMiddleware, async (req, res) => {
  try {
    const { title, category, content } = req.body;
    if (!title || !category || !content)
      return res.status(400).json({ success: false, message: 'Judul, kategori, dan isi harus diisi.' });

    const topic = await ForumTopic.create({
      title: title.trim(),
      category,
      author:     req.user.name  || req.user.email,
      authorId:   req.user.id,
      authorRole: req.user.role,
      messages: [{
        author:     req.user.name  || req.user.email,
        authorId:   req.user.id,
        authorRole: req.user.role,
        content:    content.trim(),
      }]
    });

    res.status(201).json({ success: true, message: 'Topik berhasil dibuat!', topic });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// POST /api/forum/topics/:id/messages
router.post('/topics/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim())
      return res.status(400).json({ success: false, message: 'Isi balasan tidak boleh kosong.' });

    const topic = await ForumTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Topik tidak ditemukan.' });

    const newMsg = {
      author:     req.user.name  || req.user.email,
      authorId:   req.user.id,
      authorRole: req.user.role,
      content:    content.trim(),
    };

    topic.messages.push(newMsg);
    await topic.save();

    res.status(201).json({ success: true, message: 'Balasan berhasil dikirim!', msg: newMsg });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// DELETE /api/forum/topics/:id
router.delete('/topics/:id', authMiddleware, async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Topik tidak ditemukan.' });

    if (req.user.role !== 'admin' && topic.authorId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Tidak punya izin menghapus topik ini.' });

    await topic.deleteOne();
    res.json({ success: true, message: 'Topik berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
