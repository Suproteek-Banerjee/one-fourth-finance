import express from 'express';
import { db } from '../data/mockDb.js';
import { requireAuth } from '../middleware/auth.js';
import { mapRiskToAllocation, simulatePortfolioGrowth } from '../utils/simulators.js';

const router = express.Router();

router.post('/assess', requireAuth, (req, res) => {
  const { answers } = req.body; // array [0-4] * n
  const score = (answers || []).reduce((a, b) => a + Number(b || 0), 0) * 5;
  const allocation = mapRiskToAllocation(score);
  res.json({ score, allocation });
});

router.post('/simulate', requireAuth, (req, res) => {
  const { startValue = 10000, months = 24, allocation } = req.body;
  const result = simulatePortfolioGrowth(startValue, months, allocation || { stocks: 0.5, bonds: 0.3, realEstate: 0.15, crypto: 0.05 });
  res.json(result);
});

router.post('/apply-allocation', requireAuth, (req, res) => {
  const { allocation } = req.body;
  const portfolio = db.portfolios.find(p => p.userId === req.user.id);
  if (!portfolio) {
    db.portfolios.push({ userId: req.user.id, allocation, value: 10000, history: [] });
  } else {
    portfolio.allocation = allocation;
  }
  res.json({ success: true });
});

export default router;


