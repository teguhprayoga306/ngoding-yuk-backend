// ============================================================
// seed-topics.js — Script untuk import topics ke MongoDB
// ============================================================

require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const topicsData = require('../data/topics.json');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ngoding-yuk');
    console.log('✅ MongoDB terhubung untuk seed data');
  } catch (err) {
    console.error('❌ Error koneksi MongoDB:', err.message);
    process.exit(1);
  }
};

const seedTopics = async () => {
  try {
    await Topic.deleteMany({});
    console.log('🗑️  Cleared existing topics');

    const inserted = await Topic.insertMany(topicsData.topics);
    console.log(`✅ ${inserted.length} topics berhasil diimport!`);

    topicsData.topics.forEach(t => {
      console.log(`  - ${t.title} (${t.id})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding topics:', err.message);
    process.exit(1);
  }
};

(async () => {
  await connectDB();
  await seedTopics();
})();
