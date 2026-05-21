const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const connectorRoutes = require('./routes/connectorRoutes');
const leadRoutes = require('./routes/leadRoutes');
const draftRoutes = require('./routes/draftRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const fcmRoutes = require('./routes/fcmRoutes');
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
app.use('/api/connector', connectorRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fcm', fcmRoutes);
app.get('/api/test', (req, res) => res.status(200).json({ success: true }));

// Static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Error Handler
app.use(errorHandler);

module.exports = app;
