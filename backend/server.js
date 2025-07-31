// server.js - BusTracker backend entry (ES6 modules)
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import BusLocationSimulator from './utils/busLocationSim.js';
import routesRouter from './routes/routes.js';
import geminiRouter from './routes/gemini.js';
import authRouter from './routes/auth.js';
import contactRouter from './routes/contact.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  } 
});

// Connect to MongoDB
const getMongoURI = () => {
  // Check multiple possible environment variable names
  return process.env.MONGODB_URI || 
         process.env.DATABASE_URL || 
         process.env.DB_URI || 
         process.env.MONGO_URI ||
         'mongodb://localhost:27017/bustracker';
};

mongoose.connect(getMongoURI(), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  console.log(`📍 Database: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('🔧 Please check your MongoDB connection string');
  console.log('💡 Available environment variables:');
  console.log('   - MONGODB_URI');
  console.log('   - DATABASE_URL');
  console.log('   - DB_URI');
  console.log('   - MONGO_URI');
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

// Initialize bus simulator
const busSimulator = new BusLocationSimulator();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/routes', routesRouter);
app.use('/api/gemini', geminiRouter);
app.use('/api/contact', contactRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mode: 'ES6 Modules',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Admin endpoints for simulation control
app.post('/api/admin/simulate', (req, res) => {
  const { routeId } = req.body;
  if (!routeId) {
    return res.status(400).json({ error: 'routeId is required' });
  }
  
  try {
    busSimulator.startSimulation(routeId, io);
    res.json({ 
      message: `Started simulation for route ${routeId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error starting simulation:', error);
    res.status(500).json({ error: 'Failed to start simulation' });
  }
});

app.post('/api/admin/stop-simulation', (req, res) => {
  try {
    busSimulator.stopSimulation();
    res.json({ 
      message: 'Simulation stopped',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error stopping simulation:', error);
    res.status(500).json({ error: 'Failed to stop simulation' });
  }
});

app.get('/api/admin/status', (req, res) => {
  try {
    const status = busSimulator.getCurrentStatus();
    res.json({ 
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id} at ${new Date().toLocaleTimeString()}`);
  
  // Send welcome message with current status
  const status = busSimulator.getCurrentStatus();
  if (status) {
    socket.emit('simulationStatus', status);
  }
  
  socket.emit('connected', { 
    message: 'Connected to BusTracker server',
    timestamp: new Date().toISOString()
  });
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id} at ${new Date().toLocaleTimeString()}`);
  });
  
  // Handle client requesting current bus status
  socket.on('requestBusStatus', () => {
    const status = busSimulator.getCurrentStatus();
    if (status) {
      socket.emit('busUpdate', status);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 BusTracker Backend Server`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🕐 Started: ${new Date().toLocaleString()}`);
  console.log(`🔧 Mode: ES6 Modules`);
  console.log(`🌐 CORS: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🗄️ MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
  console.log('-----------------------------------');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, server, io };