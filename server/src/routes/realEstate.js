import express from 'express';
import { nanoid } from 'nanoid';
import { db } from '../data/mockDb.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/properties', requireAuth, (req, res) => {
  res.json(db.properties);
});

router.post('/purchase', requireAuth, (req, res) => {
  const { propertyId, tokens } = req.body;
  const prop = db.properties.find(p => p.id === propertyId);
  if (!prop) return res.status(404).json({ error: 'Property not found' });
  if (prop.tokensAvailable < tokens) return res.status(400).json({ error: 'Not enough tokens available' });
  prop.tokensAvailable -= tokens;
  db.propertyHoldings.push({ id: nanoid(), userId: req.user.id, propertyId, tokens });
  res.json({ success: true, property: prop });
});

router.get('/portfolio', requireAuth, (req, res) => {
  const holdings = db.propertyHoldings.filter(h => h.userId === req.user.id).map(h => ({
    ...h,
    property: db.properties.find(p => p.id === h.propertyId)
  }));
  res.json({ holdings });
});

export default router;


