// ============================================================
// routes/topics.js — API Routes untuk Topics dengan MongoDB
// ============================================================

const express = require('express');
const Topic = require('../models/Topic');
const Course = require('../models/Course');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// GET /api/topics — Ambil semua topics
// ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find();
    res.json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching topics', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/topics/:id — Ambil single topic
// ─────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const topic = await Topic.findOne({ id: req.params.id });
    
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topik tidak ditemukan.' });
    }
    
    res.json({ success: true, topic });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching topic', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/topics/course/:courseId — Ambil topics by course
// ─────────────────────────────────────────────────────────────
router.get('/course/:courseId', async (req, res) => {
  try {
    const topics = await Topic.find({ courseId: req.params.courseId });
    
    if (topics.length === 0) {
      return res.status(404).json({ success: false, message: 'Tidak ada topik untuk kursus ini.' });
    }
    
    res.json({ success: true, topics, count: topics.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching topics', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/topics — Create topic (admin only)
// ─────────────────────────────────────────────────────────────
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { id, title, description, courseId, level, duration, icon, category, content, quiz } = req.body;
    
    if (!id || !title || !description || !courseId) {
      return res.status(400).json({ success: false, message: 'id, title, description, courseId harus diisi.' });
    }
    
    // Check if id already exists
    const existing = await Topic.findOne({ id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'ID topik sudah ada.' });
    }
    
    // Check if course exists
    const course = await Course.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Kursus tidak ditemukan.' });
    }
    
    const newTopic = new Topic({
      id,
      title,
      description,
      courseId,
      level: level || 'Pemula',
      duration: duration || '10 menit',
      icon: icon || 'fas fa-book',
      category: category || 'general',
      content: content || { overview: '', lessons: [], resources: [] },
      quiz: quiz || []
    });
    
    await newTopic.save();
    res.status(201).json({ success: true, message: 'Topik berhasil ditambahkan!', topic: newTopic });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating topic', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/topics/:id — Update topic (admin only)
// ─────────────────────────────────────────────────────────────
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { title, description, courseId, level, duration, icon, category, content, quiz } = req.body;
    
    let topic = await Topic.findOne({ id: req.params.id });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topik tidak ditemukan.' });
    }
    
    if (title) topic.title = title;
    if (description) topic.description = description;
    if (level) topic.level = level;
    if (duration) topic.duration = duration;
    if (icon) topic.icon = icon;
    if (category) topic.category = category;
    if (content) topic.content = content;
    if (quiz) topic.quiz = quiz;
    
    if (courseId && courseId !== topic.courseId) {
      const course = await Course.findOne({ id: courseId });
      if (!course) {
        return res.status(404).json({ success: false, message: 'Kursus tidak ditemukan.' });
      }
      topic.courseId = courseId;
    }
    
    await topic.save();
    res.json({ success: true, message: 'Topik berhasil diupdate!', topic });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating topic', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/topics/:id — Delete topic (admin only)
// ─────────────────────────────────────────────────────────────
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const topic = await Topic.findOneAndDelete({ id: req.params.id });
    
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topik tidak ditemukan.' });
    }
    
    res.json({ success: true, message: 'Topik berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting topic', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/topics/:id/quiz — Get quiz for topic
// ─────────────────────────────────────────────────────────────
router.get('/:id/quiz', async (req, res) => {
  try {
    const topic = await Topic.findOne({ id: req.params.id });
    
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topik tidak ditemukan.' });
    }
    
    res.json({ success: true, quiz: topic.quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching quiz', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/topics/:id/quiz/submit — Submit quiz answers
// ─────────────────────────────────────────────────────────────
router.post('/:id/quiz/submit', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    
    const topic = await Topic.findOne({ id: req.params.id });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topik tidak ditemukan.' });
    }
    
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, message: 'Format answers tidak valid.' });
    }
    
    let correctCount = 0;
    const results = [];
    
    topic.quiz.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.answer;
      
      if (isCorrect) correctCount++;
      
      results.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.answer,
        isCorrect
      });
    });
    
    const score = Math.round((correctCount / topic.quiz.length) * 100);
    
    res.json({
      success: true,
      message: `Kamu berhasil menjawab ${correctCount} dari ${topic.quiz.length} soal!`,
      score,
      correctCount,
      totalQuestions: topic.quiz.length,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error submitting quiz', error: err.message });
  }
});

module.exports = router;
