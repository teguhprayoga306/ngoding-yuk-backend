// ============================================================
// seed-courses.js — Script untuk import courses ke MongoDB
// ============================================================

require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const coursesData = require('../data/courses.json');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ngoding-yuk');
    console.log('✅ MongoDB terhubung untuk seed data');
  } catch (err) {
    console.error('❌ Error koneksi MongoDB:', err.message);
    process.exit(1);
  }
};

const seedCourses = async () => {
  try {
    await Course.deleteMany({});
    console.log('🗑️  Cleared existing courses');

    const inserted = await Course.insertMany(coursesData.courses);
    console.log(`✅ ${inserted.length} courses berhasil diimport!`);

    coursesData.courses.forEach(c => {
      console.log(`  - ${c.title} (${c.id})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding courses:', err.message);
    process.exit(1);
  }
};

(async () => {
  await connectDB();
  await seedCourses();
})();
