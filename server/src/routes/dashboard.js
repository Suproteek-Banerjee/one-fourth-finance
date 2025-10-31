import express from 'express';
import { db } from '../data/mockDb.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const userId = req.user.id;
  const portfolio = db.portfolios.find(p => p.userId === userId) || { allocation: {}, value: 0, history: [] };
  const investments = db.investments.filter(inv => inv.userId === userId);
  const loans = db.loans.filter(l => l.borrowerId === userId || db.loanFunding.some(f => f.userId === userId && f.loanId === l.id));
  const policies = db.policies.filter(p => p.userId === userId);
  const pension = db.pensionAccounts.find(p => p.userId === userId) || null;
  const alerts = db.fraudAlerts.filter(a => a.userId === userId).slice(-10);
  res.json({ portfolio, investments, loans, policies, pension, alerts });
});

export default router;


