import express from 'express';
import { nanoid } from 'nanoid';
import { db } from '../data/mockDb.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Mock market prices
const getMarketPrice = (type, symbol) => {
  const prices = {
    stock: {
      AAPL: 175, MSFT: 380, GOOGL: 140, AMZN: 145, TSLA: 250,
      NVDA: 480, META: 320, NFLX: 450, JPM: 150, BAC: 35
    },
    bond: {
      US10Y: 1, US30Y: 1, CORPORATE: 1, MUNI: 1
    },
    crypto: {
      BTC: 45000, ETH: 2500, SOL: 100, ADA: 0.55, MATIC: 0.85, DOT: 7.2
    }
  };
  return prices[type]?.[symbol] || 1;
};

// Get user's investments
router.get('/', requireAuth, (req, res) => {
  const myInvestments = db.investments.filter(inv => inv.userId === req.user.id);
  res.json({ investments: myInvestments });
});

// Get available investment options
router.get('/options', (req, res) => {
  const options = {
    stocks: [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175, change24h: 2.5 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 380, change24h: 1.8 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140, change24h: -0.5 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145, change24h: 3.2 },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 250, change24h: 5.1 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 480, change24h: 8.3 },
      { symbol: 'META', name: 'Meta Platforms', price: 320, change24h: 4.7 },
      { symbol: 'NFLX', name: 'Netflix Inc.', price: 450, change24h: -2.1 },
      { symbol: 'JPM', name: 'JPMorgan Chase', price: 150, change24h: 1.2 },
      { symbol: 'BAC', name: 'Bank of America', price: 35, change24h: 0.8 }
    ],
    bonds: [
      { symbol: 'US10Y', name: 'US 10-Year Treasury', yield: 0.045, maturity: '10Y', risk: 'low' },
      { symbol: 'US30Y', name: 'US 30-Year Treasury', yield: 0.05, maturity: '30Y', risk: 'low' },
      { symbol: 'CORPORATE', name: 'Corporate Bond Fund', yield: 0.07, maturity: '5Y', risk: 'medium' },
      { symbol: 'MUNI', name: 'Municipal Bond Fund', yield: 0.04, maturity: '10Y', risk: 'low' }
    ],
    crypto: [
      { symbol: 'BTC', name: 'Bitcoin', price: 45000, change24h: 2.3 },
      { symbol: 'ETH', name: 'Ethereum', price: 2500, change24h: -1.5 },
      { symbol: 'SOL', name: 'Solana', price: 100, change24h: 5.8 },
      { symbol: 'ADA', name: 'Cardano', price: 0.55, change24h: -0.2 },
      { symbol: 'MATIC', name: 'Polygon', price: 0.85, change24h: 3.1 },
      { symbol: 'DOT', name: 'Polkadot', price: 7.2, change24h: 4.2 }
    ]
  };
  res.json(options);
});

// Buy investment
router.post('/buy', requireAuth, (req, res) => {
  const { type, symbol, amount, shares } = req.body;
  
  if (!type || !symbol || !amount) return res.status(400).json({ error: 'Missing fields' });

  const currentPrice = getMarketPrice(type, symbol);
  
  // For stocks, we need shares
  if (type === 'stock' && !shares) return res.status(400).json({ error: 'Shares required for stocks' });

  // Calculate shares for stocks or amount for bonds/crypto
  const investment = {
    id: nanoid(),
    userId: req.user.id,
    type,
    symbol,
    avgPrice: currentPrice,
    currentPrice,
    ts: Date.now()
  };

  if (type === 'stock') {
    investment.shares = shares;
    investment.totalCost = shares * currentPrice;
  } else if (type === 'bond') {
    investment.amount = amount;
    investment.yield = db.investments.find(inv => inv.type === 'bond' && inv.symbol === symbol)?.yield || 0.045;
  } else if (type === 'crypto') {
    investment.amount = amount;
    investment.totalCost = amount * currentPrice;
  }

  db.investments.push(investment);

  // Update wallet if crypto
  if (type === 'crypto') {
    const wallet = db.cryptoWallets.find(w => w.userId === req.user.id);
    if (wallet) {
      wallet.balances[symbol] = (wallet.balances[symbol] || 0) + investment.amount;
      const tx = {
        id: nanoid(),
        type: 'investment',
        currency: symbol,
        amount: investment.amount,
        status: 'completed',
        ts: Date.now()
      };
      wallet.history.push(tx);
      db.transactions.push({ ...tx, userId: req.user.id });
    }
  }

  res.json({ success: true, investment });
});

// Sell investment
router.post('/sell/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { shares, amount } = req.body;

  const investment = db.investments.find(inv => inv.id === id && inv.userId === req.user.id);
  if (!investment) return res.status(404).json({ error: 'Investment not found' });

  const currentPrice = getMarketPrice(investment.type, investment.symbol);

  if (investment.type === 'stock') {
    if (!shares || shares > investment.shares) return res.status(400).json({ error: 'Invalid shares' });
    
    if (shares === investment.shares) {
      // Remove completely
      db.investments = db.investments.filter(inv => inv.id !== id);
    } else {
      // Partial sale
      investment.shares -= shares;
      investment.avgPrice = ((investment.avgPrice * investment.shares) + (currentPrice * shares)) / (investment.shares + shares);
    }
  } else if (investment.type === 'bond') {
    if (!amount || amount > investment.amount) return res.status(400).json({ error: 'Invalid amount' });
    investment.amount -= amount;
    if (investment.amount <= 0) {
      db.investments = db.investments.filter(inv => inv.id !== id);
    }
  } else if (investment.type === 'crypto') {
    if (!amount || amount > investment.amount) return res.status(400).json({ error: 'Invalid amount' });
    
    investment.amount -= amount;
    
    // Update wallet
    const wallet = db.cryptoWallets.find(w => w.userId === req.user.id);
    if (wallet && wallet.balances[investment.symbol]) {
      wallet.balances[investment.symbol] = Math.max(0, wallet.balances[investment.symbol] - amount);
    }
    
    if (investment.amount <= 0) {
      db.investments = db.investments.filter(inv => inv.id !== id);
    }
  }

  res.json({ success: true, investment });
});

export default router;

