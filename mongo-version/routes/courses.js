// ============================================================
// routes/courses.js — Kursus & Quiz pakai MongoDB
// ============================================================

const express = require('express');
const Course  = require('../models/Course');
const User    = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().select('-quizzes');
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/courses/:id
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.id }).select('-quizzes');
    if (!course) return res.status(404).json({ success: false, message: 'Kursus tidak ditemukan.' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// POST /api/courses (admin only)
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { id, title, description, category, level, status, image } = req.body;
    if (!id || !title || !description)
      return res.status(400).json({ success: false, message: 'id, title, dan description harus diisi.' });

    const exists = await Course.findOne({ id });
    if (exists) return res.status(409).json({ success: false, message: 'ID kursus sudah ada.' });

    const course = await Course.create({ id, title, description, category, level, status, image });
    res.status(201).json({ success: true, message: 'Kursus berhasil ditambahkan!', course });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// DELETE /api/courses/:id (admin only)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ id: req.params.id });
    if (!course) return res.status(404).json({ success: false, message: 'Kursus tidak ditemukan.' });
    res.json({ success: true, message: 'Kursus berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/courses/:id/quiz
router.get('/:id/quiz', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.id });
    if (!course || !course.quizzes.length)
      return res.status(404).json({ success: false, message: 'Latihan soal belum tersedia untuk kursus ini.' });

    // Kirim soal tanpa kunci jawaban
    const questions = course.quizzes.map(({ question, options, _id }) => ({ question, options, _id }));
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// POST /api/courses/:id/quiz/submit
router.post('/:id/quiz/submit', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers))
      return res.status(400).json({ success: false, message: 'Format jawaban tidak valid.' });

    const course = await Course.findOne({ id: req.params.id });
    if (!course || !course.quizzes.length)
      return res.status(404).json({ success: false, message: 'Latihan soal tidak ditemukan.' });

    let correct = 0;
    const results = course.quizzes.map((q, i) => {
      const isCorrect = answers[i] === q.answer;
      if (isCorrect) correct++;
      return {
        question:      q.question,
        yourAnswer:    q.options[answers[i]] || 'Tidak dijawab',
        correctAnswer: q.options[q.answer],
        isCorrect
      };
    });

    const score = Math.round((correct / course.quizzes.length) * 100);

    // Simpan hasil ke profil user
    await User.findByIdAndUpdate(req.user.id, {
      $set: { [`quizAttempts.${req.params.id}`]: { score, attemptedAt: new Date() } }
    });

    res.json({ success: true, score, correct, total: course.quizzes.length, results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
