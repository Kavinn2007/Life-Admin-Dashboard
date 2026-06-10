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

app.use(cors());
app.use(express.json());

// Serve static uploaded documents
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
