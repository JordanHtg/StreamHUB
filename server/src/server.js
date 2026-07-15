require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const apiRoutes = require('./routes/index');
const { securityHeaders } = require('./middlewares/auth.middleware');

const app = express();
const server = http.createServer(app);

// Socket.io Real-time streaming events & notifications
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  console.log(`📡 New Socket connection established: ${socket.id}`);

  socket.on('join_watch_room', (data) => {
    socket.join(`watch_${data.contentId}`);
    console.log(`User joined watch room: watch_${data.contentId}`);
  });

  socket.on('progress_update', (data) => {
    socket.to(`watch_${data.contentId}`).emit('sync_progress', data);
  });

  socket.on('disconnect', () => {
    console.log(`📡 Socket disconnected: ${socket.id}`);
  });
});

// Security & Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(securityHeaders);

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP. Please try again later.' },
});
app.use('/api', apiLimiter);

// Mount API Routes
app.use('/api', apiRoutes);

// Static file uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error occurred.',
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🎬 StreamHUB Luxury Backend API running on port ${PORT}`);
  });
}

module.exports = app;
