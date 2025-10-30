import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { simulateCreditRisk } from '../utils/simulators.js';

const router = express.Router();

router.post('/score', requireAuth, (req, res) => {
  const { income = 0, debts = 0, assets = 0, expenses = 0 } = req.body;
  const result = simulateCreditRisk({ income, debts, assets, expenses });
  res.json(result);
});

export default router;


