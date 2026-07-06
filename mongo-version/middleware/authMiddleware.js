// ============================================================
// authMiddleware.js — Cek token JWT
// ============================================================

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Silakan login terlebih dahulu.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa. Silakan login ulang.' });
  }
}

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    console.log('👤 Admin Check - Decoded JWT:', {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      timestamp: new Date().toISOString()
    });

    if (req.user.role !== 'admin') {
      console.error('❌ Admin Access Denied - User role is:', req.user.role);
      return res.status(403).json({ 
        success: false, 
        message: 'Akses ditolak. Hanya admin yang boleh mengakses ini.',
        userRole: req.user.role 
      });
    }

    console.log('✅ Admin Access Granted');
    next();
  });
}

module.exports = { authMiddleware, adminMiddleware };
