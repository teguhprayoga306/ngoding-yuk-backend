// ============================================================
// routes/admin.js — Admin Panel pakai MongoDB
// ============================================================

const express     = require('express');
const User        = require('../models/User');
const ForumTopic  = require('../models/Forum');
const Course      = require('../models/Course');
const { adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/admin/debug - Diagnostic endpoint for troubleshooting
router.get('/debug', adminMiddleware, async (req, res) => {
  try {
    console.log('📡 GET /admin/debug called - Diagnostic check');
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        mongoUrl: process.env.MONGODB_URI ? '✅ set' : '❌ missing'
      },
      database: {
        connected: true,
        collections: {}
      },
      middleware: {
        adminMiddleware: 'applied'
      }
    };

    // Check collections
    try {
      diagnostics.database.collections.users = await User.countDocuments();
      diagnostics.database.collections.courses = await Course.countDocuments();
      diagnostics.database.collections.topics = await ForumTopic.countDocuments();
    } catch (e) {
      diagnostics.database.collections.error = e.message;
    }

    // Check sample user data
    try {
      const sampleUser = await User.findOne().select('-password');
      diagnostics.database.sampleUser = sampleUser ? {
        _id: sampleUser._id,
        name: sampleUser.name,
        username: sampleUser.username,
        hasCreatedAt: !!sampleUser.createdAt,
        createdAt: sampleUser.createdAt
      } : null;
    } catch (e) {
      diagnostics.database.sampleUser = { error: e.message };
    }

    console.log('✅ Diagnostics:', JSON.stringify(diagnostics, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Diagnostic report generated',
      diagnostics 
    });
  } catch (err) {
    console.error('❌ Error in diagnostic:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Diagnostic error: ' + err.message 
    });
  }
});

// GET /api/admin/stats
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    console.log('📡 GET /admin/stats called');
    
    const [totalUsers, totalCourses, totalTopics] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      ForumTopic.countDocuments(),
    ]);
    
    const topics = await ForumTopic.find()
      .select('messages')
      .lean()
      .exec();
    
    const totalMessages = topics.reduce((sum, t) => sum + (Array.isArray(t.messages) ? t.messages.length : 0), 0);
    
    const statsData = { 
      totalUsers, 
      totalCourses, 
      totalTopics, 
      totalMessages 
    };
    
    console.log('✅ Stats calculated:', statsData);
    
    res.json({ 
      success: true, 
      stats: statsData,
      data: statsData  // Duplicate for frontend flexibility
    });
  } catch (err) {
    console.error('❌ Error fetching stats:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server: ' + err.message 
    });
  }
});

// GET /api/admin/users - VERIFIED working endpoint
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    console.log('📡 GET /admin/users called');
    
    const users = await User.find()
      .select('-password')
      .lean()
      .exec();
    
    console.log(`✅ Found ${users.length} users in database`);
    
    // Return with explicit structure for frontend compatibility
    res.json({ 
      success: true, 
      total: users.length, 
      users: users,
      data: users  // Duplicate for frontend flexibility
    });
  } catch (err) {
    console.error('❌ Error fetching users:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server: ' + err.message 
    });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role))
      return res.status(400).json({ success: false, message: 'Role harus "admin" atau "user".' });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    res.json({ success: true, message: `Role berhasil diubah menjadi ${role}.`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminMiddleware, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri.' });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    res.json({ success: true, message: 'User berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// PATCH /api/admin/users/:id/status
// Update field status user (Aktif/Suspended)
// Body: { status: 'Aktif' | 'Suspended' }
router.patch('/users/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Aktif', 'Suspended'].includes(status))
      return res.status(400).json({ success: false, message: 'Status harus "Aktif" atau "Suspended".' });

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    res.json({ success: true, message: `Status user berhasil diubah menjadi ${status}.`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/admin/stats/new-users-weekly - VERIFIED endpoint with aggregation
router.get('/stats/new-users-weekly', adminMiddleware, async (req, res) => {
  try {
    console.log('📡 GET /admin/stats/new-users-weekly called');
    
    // Get all users with createdAt field
    const users = await User.find()
      .select('createdAt')
      .lean()
      .exec();
    
    console.log(`✅ Fetched ${users.length} users with timestamps`);
    
    // Create array for last 7 days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOfWeek = dayNames[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];
      
      // Count users created on this day
      const count = users.filter(user => {
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt);
        userDate.setHours(0, 0, 0, 0);
        return userDate.getTime() === date.getTime();
      }).length;
      
      weekData.push({
        day: dayOfWeek,
        date: dateStr,
        count: count
      });
      
      console.log(`  ${dateStr} (${dayOfWeek}): ${count} users`);
    }
    
    console.log('✅ Weekly stats calculated:', weekData);
    
    res.json({
      success: true,
      data: weekData,
      total: weekData.reduce((sum, d) => sum + d.count, 0)
    });
  } catch (err) {
    console.error('❌ Error in new-users-weekly:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server: ' + err.message 
    });
  }
});

module.exports = router;
