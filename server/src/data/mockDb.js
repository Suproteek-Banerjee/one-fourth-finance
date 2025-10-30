import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

export const db = {
  users: [],
  kycSubmissions: [],
  portfolios: [],
  loans: [],
  loanFunding: [],
  repayments: [],
  insuranceProducts: [],
  policies: [],
  claims: [],
  p2pCommunities: [],
  notifications: [],
  cryptoWallets: [],
  pensionAccounts: [],
  properties: [],
  propertyHoldings: [],
  transactions: [],
  fraudAlerts: [],
  auditLogs: []
};

export function seedMockData() {
  if (db.users.length > 0) return;

  const adminPassword = bcrypt.hashSync('Admin123!', 8);
  const investorPassword = bcrypt.hashSync('Investor123!', 8);
  const borrowerPassword = bcrypt.hashSync('Borrower123!', 8);

  const admin = { id: nanoid(), email: 'admin@off.demo', password: adminPassword, role: 'admin', name: 'Admin User', eduVerified: true };
  const investor = { id: nanoid(), email: 'investor@off.demo', password: investorPassword, role: 'investor', name: 'Investor One', eduVerified: false };
  const borrower = { id: nanoid(), email: 'borrower@off.demo', password: borrowerPassword, role: 'borrower', name: 'Borrower One', eduVerified: false };

  db.users.push(admin, investor, borrower);

  const investorWallet = { userId: investor.id, address: '0xINVESTOR', balances: { USDC: 1200, BTC: 0.05, ETH: 0.7 }, history: [] };
  db.cryptoWallets.push(investorWallet);

  const investorPension = { id: nanoid(), userId: investor.id, balance: 5000, monthlyContribution: 200, apy: 0.08, history: [] };
  db.pensionAccounts.push(investorPension);

  const defaultProducts = [
    { id: nanoid(), name: 'OFF Basic Health', premiumBase: 25, coverage: 10000, tier: 'basic' },
    { id: nanoid(), name: 'OFF Family Shield', premiumBase: 40, coverage: 25000, tier: 'standard' },
    { id: nanoid(), name: 'OFF Global Travel', premiumBase: 15, coverage: 5000, tier: 'travel' }
  ];
  db.insuranceProducts.push(...defaultProducts);

  // Seed a default P2P insurance community
  db.p2pCommunities.push({ id: nanoid(), name: 'OFF Community Care', contributionMonthly: 10, members: [] });

  const properties = [
    { id: nanoid(), title: 'Nairobi Apartments', price: 250000, roi: 0.11, tokensTotal: 100000, tokensAvailable: 75000 },
    { id: nanoid(), title: 'Lagos Co-working', price: 450000, roi: 0.13, tokensTotal: 150000, tokensAvailable: 120000 },
    { id: nanoid(), title: 'Bangalore Retail', price: 600000, roi: 0.09, tokensTotal: 200000, tokensAvailable: 180000 }
  ];
  db.properties.push(...properties);

  db.portfolios.push({
    userId: investor.id,
    allocation: { stocks: 0.55, bonds: 0.25, realEstate: 0.15, crypto: 0.05 },
    value: 25000,
    history: []
  });

  db.loans.push({ id: nanoid(), borrowerId: borrower.id, amount: 1500, rate: 0.18, termMonths: 12, status: 'active', funded: 900 });

  db.auditLogs.push({ id: nanoid(), type: 'system', message: 'Seed data initialized', ts: Date.now() });
}


