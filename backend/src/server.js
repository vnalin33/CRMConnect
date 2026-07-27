const app = require('./app');
const { PORT } = require('./config/env');
const { Server } = require('socket.io');
const { testConnection } = require('./config/db');
const { runMigrations } = require('./migrations/autoMigrate');
const { initializeFirebase } = require('./config/firebase');

const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on http://${HOST}:${PORT}`);
  // Verify DB connectivity at startup
  await testConnection();
  // Auto-create all tables, indexes, and run safe column migrations
  await runMigrations();
  // Initialize Firebase Admin SDK
  initializeFirebase();
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Expose io to the app so routes can access it via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Clients can join rooms based on their user ID to get private updates
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Keep the process alive indefinitely
setInterval(() => {}, 1 << 30);
