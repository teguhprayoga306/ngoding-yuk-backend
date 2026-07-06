require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./middleware/db');

const app  = express();
const PORT = process.env.PORT || 3000;

connectDB();

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: origin not allowed'));
    }
  } : true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/profile',      require('./routes/profile'));
app.use('/api/forum',        require('./routes/forum'));
app.use('/api/courses',      require('./routes/courses'));
app.use('/api/topics',       require('./routes/topics'));
app.use('/api/admin',        require('./routes/admin'));

app.get('/', (req, res) => {
  res.json({ message: '🚀 Backend Ngoding Yuk berjalan!' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.url} tidak ditemukan.` });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;