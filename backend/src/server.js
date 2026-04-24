const app = require('./app');
const { PORT } = require('./config/env');

const HOST = '0.0.0.0'; // Listen on all network interfaces (not just localhost)

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on http://${HOST}:${PORT}`);
});

// Keep the process alive indefinitely
setInterval(() => {}, 1 << 30); 


