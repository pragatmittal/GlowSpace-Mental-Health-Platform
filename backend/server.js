const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import models for socket events
const User = require('./models/User');
const Message = require('./models/Message');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const emotionsRoutes = require('./routes/emotions');
// const chatRoutes = require('./routes/chat');
const assessmentRoutes = require('./routes/assessments');
const communityRoutes = require('./routes/community');
const appointmentRoutes = require('./routes/appointments');
const moodRoutes = require('./routes/mood');
const goalRoutes = require('./routes/goals');

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://glow-space-mental-health-platform.vercel.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "https://apis.google.com",
        "https://accounts.google.com",
        "http://localhost:3001",
        "http://localhost:3000"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: [
        "'self'", 
        "http://localhost:3001", 
        "http://localhost:3000", 
        "http://localhost:5001",
        "https://api.openai.com"
      ],
      frameSrc: ["'self'", "https://accounts.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "https://glow-space-mental-health-platform.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100 // Much higher limit in development
});

const emotionsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 300 : 60, // Higher limit in development
  message: {
    success: false,
    message: 'Too many emotion analysis requests, please try again later'
  }
});

const emotionAnalysisLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: process.env.NODE_ENV === 'development' ? 50 : 5, // Higher limit in development
  message: {
    success: false,
    message: 'Please wait a moment before sending more emotion data'
  }
});

// Development-friendly mood limiter
const moodLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 500 : 100, // Very high limit in development
  message: {
    success: false,
    message: 'Too many mood tracking requests, please try again later'
  }
});

// Apply rate limiting
app.use('/api/emotions/analyze', emotionAnalysisLimiter); // Stricter limit for emotion analysis
app.use('/api/emotions', emotionsLimiter); // General limit for other emotion routes

// Apply development-friendly rate limiting
app.use('/api/dashboard', defaultLimiter);
app.use('/api/emotions', defaultLimiter);
app.use('/api/assessments', defaultLimiter);
app.use('/api/community', defaultLimiter);
app.use('/api/appointments', defaultLimiter);
app.use('/api/mood', moodLimiter); // Use special mood limiter with higher limits
app.use('/api/goals', defaultLimiter);

// Log rate limiting configuration
console.log('🔧 Rate Limiting Configuration:');
console.log(`   Environment: ${process.env.NODE_ENV}`);
console.log(`   Default: ${process.env.NODE_ENV === 'development' ? '1000' : '100'} requests per 15 minutes`);
console.log(`   Mood: ${process.env.NODE_ENV === 'development' ? '500' : '100'} requests per minute`);
console.log(`   Emotions: ${process.env.NODE_ENV === 'development' ? '300' : '60'} requests per minute`);
console.log(`   Emotion Analysis: ${process.env.NODE_ENV === 'development' ? '50' : '5'} requests per 10 seconds`);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/emotions', emotionsRoutes);
// app.use('/api/chat', chatRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/goals', goalRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GlowSpace API Server',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
    onlineUsers: onlineUsers.size
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Store online users
const onlineUsers = new Map();
const userRooms = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.userId})`);
  
  // Add user to online users
  onlineUsers.set(socket.userId, {
    socketId: socket.id,
    user: {
      id: socket.userId,
      name: socket.user.name,
      avatar: socket.user.avatar
    },
    lastSeen: new Date()
  });

  // Update user's last login
  User.findByIdAndUpdate(socket.userId, { 
    lastLogin: new Date() 
  }).catch(console.error);

  // Broadcast online users to all clients
  io.emit('online_users', Array.from(onlineUsers.values()).map(u => u.user));

  // Join room event
  socket.on('join_room', (roomId) => {
    console.log(`User ${socket.user.name} joined room: ${roomId}`);
    socket.join(roomId);
    
    // Track user rooms
    if (!userRooms.has(socket.userId)) {
      userRooms.set(socket.userId, new Set());
    }
    userRooms.get(socket.userId).add(roomId);

    // Notify room about new user
    socket.to(roomId).emit('user_joined', {
      userId: socket.userId,
      username: socket.user.name,
      avatar: socket.user.avatar
    });
  });

  // Leave room event
  socket.on('leave_room', (roomId) => {
    console.log(`User ${socket.user.name} left room: ${roomId}`);
    socket.leave(roomId);
    
    // Remove from user rooms tracking
    if (userRooms.has(socket.userId)) {
      userRooms.get(socket.userId).delete(roomId);
    }

    // Notify room about user leaving
    socket.to(roomId).emit('user_left', {
      userId: socket.userId,
      username: socket.user.name
    });
  });

  // Send message event
  socket.on('send_message', async (messageData) => {
    try {
      // Broadcast message to room
      socket.to(messageData.roomId).emit('new_message', messageData);
      
      // Optional: Store message in database if not already stored
      // This is typically done in the chat controller, but we can add real-time features here
      console.log(`Message sent in room ${messageData.roomId} by ${socket.user.name}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing events
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user_typing', {
      userId: socket.userId,
      username: data.username || socket.user.name,
      roomId: data.roomId
    });
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.roomId).emit('user_stop_typing', {
      userId: socket.userId,
      username: data.username || socket.user.name,
      roomId: data.roomId
    });
  });

  // Message reactions
  socket.on('reaction_added', (data) => {
    socket.to(data.roomId).emit('message_reaction', {
      messageId: data.messageId,
      reactions: data.reactions,
      userId: socket.userId,
      action: 'added'
    });
  });

  socket.on('reaction_removed', (data) => {
    socket.to(data.roomId).emit('message_reaction', {
      messageId: data.messageId,
      reactions: data.reactions,
      userId: socket.userId,
      action: 'removed'
    });
  });

  // Message editing
  socket.on('message_edited', (data) => {
    socket.to(data.roomId).emit('message_updated', {
      messageId: data.messageId,
      newContent: data.content,
      editedAt: new Date(),
      userId: socket.userId
    });
  });

  // Message deletion
  socket.on('message_deleted', (data) => {
    socket.to(data.roomId).emit('message_deleted', {
      messageId: data.messageId,
      userId: socket.userId
    });
  });

  // Private message events
  socket.on('send_private_message', async (data) => {
    try {
      const recipientUser = onlineUsers.get(data.receiverId);
      if (recipientUser) {
        // Send to specific user
        io.to(recipientUser.socketId).emit('new_private_message', {
          ...data,
          senderId: socket.userId,
          senderName: socket.user.name
        });
      }
      
      // Also send back to sender for confirmation
      socket.emit('private_message_sent', data);
    } catch (error) {
      console.error('Error sending private message:', error);
      socket.emit('error', { message: 'Failed to send private message' });
    }
  });

  // Counseling session events
  socket.on('join_counseling_session', (sessionId) => {
    socket.join(`counseling_${sessionId}`);
    console.log(`User ${socket.user.name} joined counseling session: ${sessionId}`);
  });

  socket.on('leave_counseling_session', (sessionId) => {
    socket.leave(`counseling_${sessionId}`);
    console.log(`User ${socket.user.name} left counseling session: ${sessionId}`);
  });

  // Emotion detection real-time updates
  socket.on('emotion_detected', (emotionData) => {
    // Broadcast emotion update to specific rooms if needed
    // This could be used for group therapy sessions
    if (emotionData.shareWithGroup && emotionData.roomId) {
      socket.to(emotionData.roomId).emit('user_emotion_update', {
        userId: socket.userId,
        username: socket.user.name,
        dominantEmotion: emotionData.dominantEmotion,
        timestamp: new Date()
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.user.name} (${reason})`);
    
    // Remove from online users
    onlineUsers.delete(socket.userId);
    
    // Clean up user rooms
    if (userRooms.has(socket.userId)) {
      const rooms = userRooms.get(socket.userId);
      rooms.forEach(roomId => {
        socket.to(roomId).emit('user_left', {
          userId: socket.userId,
          username: socket.user.name
        });
      });
      userRooms.delete(socket.userId);
    }

    // Update last seen timestamp
    User.findByIdAndUpdate(socket.userId, { 
      lastLogin: new Date() 
    }).catch(console.error);

    // Broadcast updated online users list
    io.emit('online_users', Array.from(onlineUsers.values()).map(u => u.user));
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});



// Database connection
const connectDB = async () => {
  try {
    const uri = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_URI_TEST 
      : (process.env.MONGODB_URI || 'mongodb://localhost:27017/glowspace');
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    
    // If it's an IP whitelist error, provide helpful message
    if (error.message && error.message.includes('whitelist')) {
      console.error('\n🔴 MongoDB Atlas IP Whitelist Error:');
      console.error('Your current IP address is not whitelisted in MongoDB Atlas.');
      console.error('To fix this:');
      console.error('1. Go to MongoDB Atlas Dashboard');
      console.error('2. Navigate to Network Access');
      console.error('3. Click "Add IP Address"');
      console.error('4. Add your current IP or use "0.0.0.0/0" for all IPs (less secure)');
      console.error('5. Or use a local MongoDB instance instead');
      console.error('\nCurrent IP:', require('child_process').execSync('curl -s ifconfig.me').toString().trim());
    }
    
    // Try to connect to local MongoDB as fallback
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n🔄 Trying to connect to local MongoDB as fallback...');
      try {
        await mongoose.connect('mongodb://localhost:27017/glowspace', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 3000
        });
        console.log('✅ Connected to local MongoDB successfully');
        return;
      } catch (localError) {
        console.error('❌ Local MongoDB connection also failed:', localError.message);
        console.log('⚠️  Continuing without database connection...');
        throw new Error('Database connection failed');
      }
    }
    
    throw new Error('Database connection failed');
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Start server only if not in test environment
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection failed, but continuing with server startup...');
    console.error('Some features may not work without database connection.');
  }
  
  if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO server ready for connections`);
    });
  }
};

startServer();

module.exports = { app, io, connectDB, mongoose };
