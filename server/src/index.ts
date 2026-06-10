import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import billRoutes from './routes/bills';
import insuranceRoutes from './routes/insurance';
import documentRoutes from './routes/documents';
import subscriptionRoutes from './routes/subscriptions';
import reminderRoutes from './routes/reminders';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed list or ends with vercel.app
    const isAllowed = allowedOrigins.some(allowed => allowed === origin) || origin.endsWith('.vercel.app');
    
    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // In production, if FRONTEND_URL is not set, allow all to avoid breaking the app
      const hasFrontendUrl = allowedOrigins.some(o => !o.includes('localhost'));
      if (!hasFrontendUrl) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve static uploaded documents
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Life Admin API is running' });
});

// Register routers
app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
