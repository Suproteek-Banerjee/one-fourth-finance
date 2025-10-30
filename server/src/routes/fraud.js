import express from 'express';
import { nanoid } from 'nanoid';
import { db } from '../data/mockDb.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { simulateFraudAlerts } from '../utils/simulators.js';

const router = express.Router();

router.get('/transactions', requireAuth, (req, res) => {
  const tx = db.transactions.filter(t => t.userId === req.user.id).slice(-100);
  res.json(tx);
});

router.post('/simulate', requireAuth, (req, res) => {
  const { transactions = [] } = req.body;
  const alerts = simulateFraudAlerts(transactions);
  alerts.forEach(a => db.fraudAlerts.push({ id: nanoid(), userId: req.user.id, ...a, ts: Date.now() }));
  res.json({ alerts });
});

router.get('/alerts', requireAuth, (req, res) => {
  const alerts = db.fraudAlerts.filter(a => a.userId === req.user.id).slice(-50);
  res.json(alerts);
});

router.get('/admin/all-alerts', requireAuth, requireRole('admin'), (req, res) => {
  res.json(db.fraudAlerts.slice(-200));
});

export default router;


