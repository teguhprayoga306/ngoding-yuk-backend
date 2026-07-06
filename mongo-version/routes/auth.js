const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'Username, email, dan password harus diisi.' });

    if (username.length < 3)
      return res.status(400).json({ success: false, message: 'Username minimal 3 karakter.' });

    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return res.status(400).json({ success: false, message: 'Username hanya boleh huruf, angka, dan underscore.' });

    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists)
      return res.status(409).json({ success: false, message: 'Username sudah dipakai.' });

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists)
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name?.trim() || '',
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ success: true, message: 'Akun berhasil dibuat!', token, user: userData });

  } catch (err) {
    console.error('Error register:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email dan password harus diisi.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🔐 Login Success:', {
      username: user.username,
      email: user.email,
      role: user.role,
      tokenPayload: { id: user._id, email: user.email, role: user.role }
    });

    const { password: _, ...userData } = user.toObject();
    res.json({ success: true, message: 'Login berhasil!', token, user: userData });

  } catch (err) {
    console.error('Error login:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;