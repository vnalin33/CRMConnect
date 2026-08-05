const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// ── Mobile Routes ──
const authRoutes = require('./routes/authRoutes');
const connectorRoutes = require('./routes/connectorRoutes');
const leadRoutes = require('./routes/leadRoutes');
const draftRoutes = require('./routes/draftRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const fcmRoutes = require('./routes/fcmRoutes');

// ── Admin Routes (merged from Oneassist-CRMConnect backend) ──
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminLeadRoutes = require('./routes/adminLeadRoutes');
const adminInvoiceRoutes = require('./routes/adminInvoiceRoutes');
const adminWithdrawalRoutes = require('./routes/adminWithdrawalRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const adminCompanyProfileRoutes = require('./routes/adminCompanyProfileRoutes');

// ── Admin controllers for backward-compatible mobile routes ──
const AdminInvoiceController = require('./controllers/adminInvoiceController');
const AdminWithdrawalController = require('./controllers/adminWithdrawalController');

// ── Serialization Helper ──
const { serialize } = require('./helpers/serializationHelper');

const app = express();

// ── Serialization Middleware (converts BigInt, dates, etc.) ──
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (body) {
      body = serialize(body);
    }
    return originalJson.call(this, body);
  };
  next();
});

// ── Security Middlewares ──
app.use(helmet());

const allowedOrigins = [
  // Admin web panel origins
  'https://oneassist.net.in',
  'https://one.net.in',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(o => o.trim()) : []),
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    // Also allow any origin in development
    if (process.env.NODE_ENV === 'development') return cb(null, true);
    cb(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parser (increased limit for admin bulk operations) ──
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ── Logger ──
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ════════════════════════════════════════════════════════
// ── MOBILE ROUTES (/api/*) ──
// ════════════════════════════════════════════════════════
app.use('/api/auth', authRoutes);
app.use('/api/connector', connectorRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fcm', fcmRoutes);
app.get('/api/test', (req, res) => res.status(200).json({ success: true }));

// ── Mobile backward-compatible invoice/withdrawal routes ──
app.post('/api/submitInvoiceRequest', AdminInvoiceController.submitRequest);
app.get('/api/getInvoiceRequestsByConnector', AdminInvoiceController.getByConnector);
app.post('/api/submitWithdrawalRequest', AdminWithdrawalController.submitRequest);
app.get('/api/getWithdrawalsByConnector', AdminWithdrawalController.getByConnector);

// Also mount at /onebindapi for backward compatibility
app.post('/onebindapi/submitInvoiceRequest', AdminInvoiceController.submitRequest);
app.get('/onebindapi/getInvoiceRequestsByConnector', AdminInvoiceController.getByConnector);
app.post('/onebindapi/submitWithdrawalRequest', AdminWithdrawalController.submitRequest);
app.get('/onebindapi/getWithdrawalsByConnector', AdminWithdrawalController.getByConnector);

// Root-level routes (mobile CRM_API_URL = http://localhost:5005, no /api prefix)
app.post('/submitInvoiceRequest', AdminInvoiceController.submitRequest);
app.get('/getInvoiceRequestsByConnector', AdminInvoiceController.getByConnector);
app.post('/submitWithdrawalRequest', AdminWithdrawalController.submitRequest);
app.get('/getWithdrawalsByConnector', AdminWithdrawalController.getByConnector);
app.get('/getWalletBalance', (req, res) => {
  res.json({ success: true, data: { walletBalance: '0.00' } });
});
// Mobile invoice PDF access (no admin auth required)
app.get('/invoice-requests/by-track/:trackId/invoice-pdf', AdminInvoiceController.getInvoicePdfByTrackId);

// ════════════════════════════════════════════════════════
// ── ADMIN ROUTES (/api/admin/*) ──
// ════════════════════════════════════════════════════════
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/leads', adminLeadRoutes);
app.use('/api/admin/invoice-requests', adminInvoiceRoutes);
app.use('/api/admin/withdrawals', adminWithdrawalRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/company-profile', adminCompanyProfileRoutes);

// ── Also mount admin routes without /admin prefix for backward compat ──
// (admin frontend currently calls /auth/login, /users/*, etc. without /admin)
app.use('/auth', adminAuthRoutes);
app.use('/users', adminUserRoutes);
app.use('/leads', adminLeadRoutes);
app.use('/invoice-requests', adminInvoiceRoutes);
app.use('/withdrawals', adminWithdrawalRoutes);
app.use('/dashboard', adminDashboardRoutes);
app.use('/company-profile', adminCompanyProfileRoutes);

// ── Static files ──
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health Check ──
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy (unified backend)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CRMConnect Unified Backend',
    timestamp: new Date().toISOString(),
  });
});

// ── Route Registration Log ──
console.log('✅ Unified backend routes registered:');
console.log('   Mobile: /api/auth, /api/connector, /api/leads, /api/drafts, /api/payouts, /api/invoices, /api/notifications, /api/fcm');
console.log('   Admin:  /api/admin/auth, /api/admin/users, /api/admin/leads, /api/admin/invoice-requests, /api/admin/withdrawals, /api/admin/dashboard, /api/admin/company-profile');

// ── Error Handler ──
app.use(errorHandler);

module.exports = app;
