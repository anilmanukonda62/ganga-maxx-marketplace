const dns = require('dns');

// Fix for Node.js DNS resolution issues with MongoDB SRV on some Windows environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (error) {
  console.warn('Warning: Could not set custom DNS servers:', error.message);
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');

// Route imports
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const contactRoutes = require('./routes/contactRoutes');
const multiEnquiryRoutes = require('./routes/multiEnquiryRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'https://ganga-maxx-marketplace.vercel.app',
  'https://ganga-maxx-admin.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.indexOf(origin) !== -1 || 
      origin.startsWith('http://localhost:') || 
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy block'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/multi-enquiries', multiEnquiryRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Centralized error handling middleware
app.use(errorMiddleware);

// Handle 404 (Route not found)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route Not Found - ${req.originalUrl}`,
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

// Setup Socket.io
const socketio = require('socket.io');
const io = socketio(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 || 
        origin.startsWith('http://localhost:') || 
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy block'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
