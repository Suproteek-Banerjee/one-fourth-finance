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

const app = express();
app.use(cors());
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

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`One-Fourth Finance API listening on http://localhost:${port}`);
});


