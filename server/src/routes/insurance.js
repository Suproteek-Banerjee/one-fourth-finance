import express from 'express';
import { nanoid } from 'nanoid';
import { db } from '../data/mockDb.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/products', requireAuth, (req, res) => {
  res.json(db.insuranceProducts);
});

router.post('/quote', requireAuth, (req, res) => {
  const { productId, age = 30, smoker = false } = req.body;
  const product = db.insuranceProducts.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  let premium = product.premiumBase + Math.max(0, age - 30) * 0.5 + (smoker ? 10 : 0);
  res.json({ monthlyPremium: Number(premium.toFixed(2)) });
});

router.post('/purchase', requireAuth, (req, res) => {
  const { productId } = req.body;
  const product = db.insuranceProducts.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const policy = { id: nanoid(), userId: req.user.id, productId, status: 'active', startedAt: Date.now() };
  db.policies.push(policy);
  res.json(policy);
});

router.post('/claim', requireAuth, (req, res) => {
  const { policyId, description } = req.body;
  const policy = db.policies.find(p => p.id === policyId && p.userId === req.user.id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });
  const claim = { id: nanoid(), policyId, userId: req.user.id, description, status: 'processing', ts: Date.now() };
  db.claims.push(claim);
  // mock processing
  claim.status = description && description.length > 10 ? 'approved' : 'rejected';
  // notify user
  db.notifications.push({ id: nanoid(), userId: req.user.id, type: 'claim', message: `Claim ${claim.status}`, ts: Date.now() });
  res.json(claim);
});

router.get('/my', requireAuth, (req, res) => {
  const policies = db.policies.filter(p => p.userId === req.user.id);
  const claims = db.claims.filter(c => c.userId === req.user.id);
  res.json({ policies, claims });
});

// P2P Insurance Communities
router.get('/communities', requireAuth, (req, res) => {
  res.json(db.p2pCommunities.map(c => ({ id: c.id, name: c.name, contributionMonthly: c.contributionMonthly, members: c.members.length })));
});

router.post('/communities', requireAuth, (req, res) => {
  const { name, contributionMonthly = 5 } = req.body;
  const community = { id: nanoid(), name, contributionMonthly, members: [] };
  db.p2pCommunities.push(community);
  res.json(community);
});

router.post('/communities/join', requireAuth, (req, res) => {
  const { communityId } = req.body;
  const community = db.p2pCommunities.find(c => c.id === communityId);
  if (!community) return res.status(404).json({ error: 'Community not found' });
  if (!community.members.includes(req.user.id)) community.members.push(req.user.id);
  db.notifications.push({ id: nanoid(), userId: req.user.id, type: 'community', message: `Joined ${community.name}`, ts: Date.now() });
  res.json({ success: true, community });
});

router.post('/communities/contribute', requireAuth, (req, res) => {
  const { communityId, amount } = req.body;
  const community = db.p2pCommunities.find(c => c.id === communityId);
  if (!community) return res.status(404).json({ error: 'Community not found' });
  db.transactions.push({ id: nanoid(), userId: req.user.id, type: 'p2p_contribution', communityId, amount, ts: Date.now() });
  db.notifications.push({ id: nanoid(), userId: req.user.id, type: 'community', message: `Contributed $${amount} to ${community.name}` , ts: Date.now() });
  res.json({ success: true });
});

router.get('/notifications', requireAuth, (req, res) => {
  const notes = db.notifications.filter(n => n.userId === req.user.id).slice(-50);
  res.json(notes);
});

export default router;


