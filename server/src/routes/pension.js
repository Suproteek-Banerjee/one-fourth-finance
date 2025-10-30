import express from 'express';
import { nanoid } from 'nanoid';
import { db } from '../data/mockDb.js';
import { requireAuth } from '../middleware/auth.js';
import { simulateCompounding } from '../utils/simulators.js';

const router = express.Router();

router.get('/account', requireAuth, (req, res) => {
  let account = db.pensionAccounts.find(p => p.userId === req.user.id);
  if (!account) {
    account = { id: nanoid(), userId: req.user.id, balance: 0, monthlyContribution: 0, apy: 0.07, history: [] };
    db.pensionAccounts.push(account);
  }
  res.json(account);
});

router.post('/deposit', requireAuth, (req, res) => {
  const { amount } = req.body;
  const account = db.pensionAccounts.find(p => p.userId === req.user.id);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  account.balance += amount;
  account.history.push({ type: 'deposit', amount, ts: Date.now() });
  res.json(account);
});

router.post('/simulate', requireAuth, (req, res) => {
  const { months = 24 } = req.body;
  const account = db.pensionAccounts.find(p => p.userId === req.user.id);
  const base = account || { balance: 0, monthlyContribution: 0, apy: 0.07 };
  const result = simulateCompounding(base.balance, base.monthlyContribution, months, base.apy);
  res.json(result);
});

export default router;


