import express from 'express';
import { db } from '../data/mockDb.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/metrics', requireAuth, requireRole('admin'), (req, res) => {
  const users = db.users.length;
  const loans = db.loans.length;
  const policies = db.policies.length;
  const properties = db.properties.length;
  const alerts = db.fraudAlerts.length;
  res.json({ users, loans, policies, properties, alerts });
});

router.get('/users', requireAuth, requireRole('admin'), (req, res) => {
  res.json(db.users.map(u => ({ id: u.id, email: u.email, role: u.role, name: u.name, eduVerified: u.eduVerified })));
});

router.post('/users/role', requireAuth, requireRole('admin'), (req, res) => {
  const { userId, role } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.role = role;
  res.json({ id: user.id, email: user.email, role: user.role });
});

router.get('/transactions', requireAuth, requireRole('admin'), (req, res) => {
  res.json(db.transactions.slice(-500));
});

export default router;


