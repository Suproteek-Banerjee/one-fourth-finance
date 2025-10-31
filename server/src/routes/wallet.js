import express from 'express';
import { nanoid } from 'nanoid';
import { db } from '../data/mockDb.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const wallet = db.cryptoWallets.find(w => w.userId === req.user.id);
  if (!wallet) {
    const newWallet = { userId: req.user.id, address: `0x${nanoid(40)}`, balances: { USDC: 0, BTC: 0, ETH: 0 }, history: [] };
    db.cryptoWallets.push(newWallet);
    res.json(newWallet);
  } else {
    res.json(wallet);
  }
});

router.post('/deposit', requireAuth, (req, res) => {
  const { currency, amount } = req.body;
  const wallet = db.cryptoWallets.find(w => w.userId === req.user.id);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  
  wallet.balances[currency] = (wallet.balances[currency] || 0) + amount;
  const tx = { id: nanoid(), type: 'deposit', currency, amount, status: 'completed', ts: Date.now() };
  wallet.history.push(tx);
  db.transactions.push({ ...tx, userId: req.user.id });
  
  res.json(wallet);
});

router.post('/withdraw', requireAuth, (req, res) => {
  const { currency, amount } = req.body;
  const wallet = db.cryptoWallets.find(w => w.userId === req.user.id);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  
  if ((wallet.balances[currency] || 0) < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  wallet.balances[currency] -= amount;
  const tx = { id: nanoid(), type: 'withdrawal', currency, amount, status: 'pending', ts: Date.now() };
  wallet.history.push(tx);
  db.transactions.push({ ...tx, userId: req.user.id });
  
  res.json(wallet);
});

router.post('/transfer', requireAuth, (req, res) => {
  const { toAddress, currency, amount } = req.body;
  const wallet = db.cryptoWallets.find(w => w.userId === req.user.id);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  
  if ((wallet.balances[currency] || 0) < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  wallet.balances[currency] -= amount;
  const tx = { id: nanoid(), type: 'transfer', currency, amount, toAddress, status: 'completed', ts: Date.now() };
  wallet.history.push(tx);
  db.transactions.push({ ...tx, userId: req.user.id });
  
  res.json(wallet);
});

router.get('/transactions', requireAuth, (req, res) => {
  const wallet = db.cryptoWallets.find(w => w.userId === req.user.id);
  if (!wallet) return res.json([]);
  res.json(wallet.history.slice(-100));
});

export default router;

