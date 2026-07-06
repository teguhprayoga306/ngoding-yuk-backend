// ============================================================
// verify-data.js — Script untuk verifikasi data di MongoDB
// ============================================================

require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const Topic = require('./models/Topic');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ngoding-yuk');
    console.log('✅ MongoDB terhubung untuk verifikasi');
  } catch (err) {
    console.error('❌ Error koneksi MongoDB:', err.message);
    process.exit(1);
  }
};

const verifyData = async () => {
  try {
    // Cek courses
    const coursesCount = await Course.countDocuments();
    console.log(`\n📚 COURSES: ${coursesCount} data`);
    
    const courses = await Course.find({}, { id: 1, title: 1, status: 1 });
    if (courses.length === 0) {
      console.log('  ⚠️  Tidak ada courses!');
    } else {
      courses.forEach(c => {
        console.log(`  ✅ ${c.title} (${c.id}) - ${c.status || 'N/A'}`);
      });
    }

    // Cek topics
    const topicsCount = await Topic.countDocuments();
    console.log(`\n📖 TOPICS: ${topicsCount} data`);
    
    const topics = await Topic.find({}, { id: 1, title: 1, courseId: 1 });
    if (topics.length === 0) {
      console.log('  ⚠️  Tidak ada topics!');
    } else {
      topics.forEach(t => {
        console.log(`  ✅ ${t.title} (${t.id}) - Course: ${t.courseId}`);
      });
    }

    // Summary
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Total: ${coursesCount} courses + ${topicsCount} topics`);
    console.log(`Status: ${coursesCount > 0 && topicsCount > 0 ? '✅ OK - Siap digunakan!' : '❌ Data tidak lengkap'}`);
    console.log(`${'='.repeat(50)}\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error saat verifikasi:', err.message);
    process.exit(1);
  }
};

(async () => {
  await connectDB();
  await verifyData();
})();
