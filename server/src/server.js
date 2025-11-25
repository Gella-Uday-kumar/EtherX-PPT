import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jsonAuthRoutes from './routes/jsonAuth.js';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not set, using fallback (not secure for production)');
  process.env.JWT_SECRET = 'fallback-jwt-secret-change-in-production';
}

// Using JSON file database instead of MongoDB

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'EtherXPPT Server Running',
    version: '2.0.0',
    status: 'healthy'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', jsonAuthRoutes);

// Import IPFS routes
import ipfsRoutes from './routes/ipfs.js';
app.use('/api/ipfs', ipfsRoutes);

// Basic API endpoints for missing routes
app.use('/api/cloud', (req, res) => res.json({ message: 'Cloud service not implemented' }));
app.use('/api/presentations', (req, res) => res.json({ presentations: [] }));
app.use('/api/ai', (req, res) => res.json({ message: 'AI service not implemented' }));
app.use('/api/templates', (req, res) => res.json({ templates: [] }));
app.use('/api/versions', (req, res) => res.json({ versions: [] }));
app.use('/api/upload', (req, res) => res.json({ message: 'Upload service not implemented' }));
app.use('/api/charts', (req, res) => res.json({ charts: [] }));
app.use('/api/export', (req, res) => res.json({ message: 'Export service not implemented' }));
app.use('/api/collaboration', (req, res) => res.json({ rooms: [] }));
app.use('/api/search', (req, res) => res.json({ results: [] }));
app.use('/api/animations', (req, res) => res.json({ presets: [] }));
app.use('/api/interactive', (req, res) => res.json({ polls: [] }));
app.use('/api/notes', (req, res) => res.json({ notes: '' }));
app.use('/api/drawing', (req, res) => res.json({ tools: [] }));



// Socket.io for real-time collaboration
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-presentation', (presentationId) => {
    socket.join(presentationId);
    console.log(`User ${socket.id} joined presentation ${presentationId}`);
  });

  socket.on('slide-update', (data) => {
    socket.to(data.presentationId).emit('slide-updated', data);
  });

  socket.on('cursor-move', (data) => {
    socket.to(data.presentationId).emit('cursor-moved', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});