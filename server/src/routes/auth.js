import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { db } from '../data/mockDb.js';

const router = express.Router();

router.post('/signup', (req, res) => {
  const { email, password, name, eduEmail } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (db.users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
  const hash = bcrypt.hashSync(password, 8);
  const role = 'investor';
  const user = { id: nanoid(), email, password: hash, role, name: name || email.split('@')[0], eduVerified: !!(eduEmail && eduEmail.endsWith('.edu')) };
  db.users.push(user);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name, eduVerified: user.eduVerified } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name, eduVerified: user.eduVerified } });
});

router.post('/forgot', (req, res) => {
  // Mock only: always "sent"
  res.json({ message: 'Password reset email sent if account exists' });
});

router.post('/reset', (req, res) => {
  // Mock only: accept any token
  const { email, newPassword } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.password = bcrypt.hashSync(newPassword, 8);
  res.json({ message: 'Password updated' });
});

router.post('/kyc', (req, res) => {
  const { userId, country, idType, idNumber } = req.body;
  if (!userId || !country || !idType || !idNumber) return res.status(400).json({ error: 'Missing fields' });
  db.kycSubmissions.push({ id: nanoid(), userId, country, idType, idNumber, status: 'pending' });
  // Mock verification: auto-approve non-empty idNumber
  const sub = db.kycSubmissions[db.kycSubmissions.length - 1];
  sub.status = idNumber.length > 4 ? 'approved' : 'rejected';
  res.json({ status: sub.status });
});

export default router;


