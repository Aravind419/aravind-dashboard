
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connection');
require('dotenv').config();

// Import route files
const notesRoutes = require('./routes/notes');
const tasksRoutes = require('./routes/tasks');
const studySessionsRoutes = require('./routes/studySessions');
const socialMediaRoutes = require('./routes/socialMedia');
const expensesRoutes = require('./routes/expenses');
const certificatesRoutes = require('./routes/certificates');
const leetcodeRoutes = require('./routes/leetcode');
const themeRoutes = require('./routes/theme');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/notes', notesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/study-sessions', studySessionsRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/theme', themeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
