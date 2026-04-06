require('dotenv').config();
const path      = require('path');
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');
const businessRoutes = require('./routes/businessRoutes');

// ── Connect to MongoDB ──────────────────────────────────────
connectDB();

// ── Express App ──────────────────────────────────────────────
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images as static files
// Any file in /uploads is accessible at  http://localhost:5000/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'LocalKart API is running 🚀',
    endpoints: {
      allBusinesses:  'GET /api/businesses',
      singleBusiness: 'GET /api/businesses/:id',
      byCategory:     'GET /api/businesses/category/:category',
    },
  });
});

app.use('/api/businesses', businessRoutes);

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
