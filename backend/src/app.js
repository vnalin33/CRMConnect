const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Body Parser
app.use(express.json());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Error Handler
app.use(errorHandler);

module.exports = app;
