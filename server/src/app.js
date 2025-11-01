import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { seedMockData } from './data/mockDb.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import coachingRoutes from './routes/coaching.js';
import microfinanceRoutes from './routes/microfinance.js';
import creditRiskRoutes from './routes/creditRisk.js';
import pensionRoutes from './routes/pension.js';
import insuranceRoutes from './routes/insurance.js';
import realEstateRoutes from './routes/realEstate.js';
import fraudRoutes from './routes/fraud.js';
import adminRoutes from './routes/admin.js';
import walletRoutes from './routes/wallet.js';
import investmentRoutes from './routes/investments.js';

const app = express();
app.use(cors({
  origin: true, // Allow all origins (for development)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Seed data in-memory on boot
seedMockData();

app.get('/', (req, res) => {
  res.json({ name: 'One-Fourth Finance API', status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/coaching', coachingRoutes);
app.use('/microfinance', microfinanceRoutes);
app.use('/credit-risk', creditRiskRoutes);
app.use('/pension', pensionRoutes);
app.use('/insurance', insuranceRoutes);
app.use('/real-estate', realEstateRoutes);
app.use('/fraud', fraudRoutes);
app.use('/admin', adminRoutes);
app.use('/wallet', walletRoutes);
app.use('/investments', investmentRoutes);

const port = process.env.PORT || 4000;
const host = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for mobile access
app.listen(port, host, () => {
  console.log(`One-Fourth Finance API listening on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
  console.log(`To access from mobile devices, use your computer's IP address (e.g., http://192.168.1.XXX:${port})`);
});


