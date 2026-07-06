// ============================================================
// routes/profile.js — Profil & Progress pakai MongoDB
// ============================================================

const express = require('express');
const User    = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// PUT /api/profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const update = {};
    if (name)   update.name   = name.trim();
    if (bio)    update.bio    = bio.trim();
    if (avatar) update.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
    res.json({ success: true, message: 'Profil berhasil diperbarui!', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// PUT /api/profile/progress
router.put('/progress', authMiddleware, async (req, res) => {
  try {
    const { courseId, progress } = req.body;
    if (!courseId || progress === undefined)
      return res.status(400).json({ success: false, message: 'courseId dan progress harus diisi.' });

    const clamped = Math.min(100, Math.max(0, Number(progress)));

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { [`progress.${courseId}`]: clamped } },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Progress berhasil disimpan!', progress: Object.fromEntries(user.progress) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
