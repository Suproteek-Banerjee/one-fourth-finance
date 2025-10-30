// Deterministic mock simulators for AI/ML and blockchain-like logic

export function mapRiskToAllocation(score) {
  // score 0-100 → allocation buckets
  const risk = Math.max(0, Math.min(100, score));
  if (risk < 25) return { stocks: 0.25, bonds: 0.55, realEstate: 0.15, crypto: 0.05 };
  if (risk < 50) return { stocks: 0.45, bonds: 0.35, realEstate: 0.15, crypto: 0.05 };
  if (risk < 75) return { stocks: 0.6, bonds: 0.2, realEstate: 0.15, crypto: 0.05 };
  return { stocks: 0.7, bonds: 0.1, realEstate: 0.15, crypto: 0.05 };
}

export function simulatePortfolioGrowth(startValue, months, allocation) {
  // Simple compounding per asset class with fixed monthly returns
  const monthlyReturns = {
    stocks: 0.006,
    bonds: 0.002,
    realEstate: 0.003,
    crypto: 0.015
  };
  let value = startValue;
  const history = [];
  for (let m = 1; m <= months; m++) {
    const growth = Object.entries(allocation).reduce((acc, [k, w]) => acc + (value * w * monthlyReturns[k]), 0);
    value += growth;
    history.push({ month: m, value: Number(value.toFixed(2)) });
  }
  return { finalValue: Number(value.toFixed(2)), history };
}

export function simulateCreditRisk({ income, debts, assets, expenses }) {
  const dti = (debts + expenses) / Math.max(1, income);
  const netWorth = assets - debts;
  let score = 700 - dti * 300 + Math.min(200, netWorth / 1000);
  score = Math.max(300, Math.min(850, Math.round(score)));
  const probabilityOfDefault = Number((1 - (score - 300) / 550).toFixed(2));
  const eligible = score >= 620;
  return { score, probabilityOfDefault, eligible };
}

export function simulateLoanApproval({ amount, income, creditScore }) {
  const base = creditScore >= 700 ? 0.85 : creditScore >= 620 ? 0.6 : 0.25;
  const affordability = income > amount / 2 ? 0.2 : income > amount / 3 ? 0.1 : -0.1;
  const approval = Math.max(0, Math.min(1, base + affordability));
  return { approved: approval > 0.5, approvalProbability: Number(approval.toFixed(2)) };
}

export function simulateRepaymentSchedule(amount, rate, termMonths) {
  const monthlyRate = rate / 12;
  const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  const schedule = [];
  let balance = amount;
  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * monthlyRate;
    const principal = payment - interest;
    balance -= principal;
    schedule.push({ installment: i, payment: round(payment), principal: round(principal), interest: round(interest), balance: round(Math.max(0, balance)) });
  }
  return schedule;
}

export function simulateCompounding(balance, monthlyContribution, months, apy) {
  const monthlyRate = apy / 12;
  const history = [];
  let val = balance;
  for (let m = 1; m <= months; m++) {
    val = (val + monthlyContribution) * (1 + monthlyRate);
    history.push({ month: m, value: round(val) });
  }
  return { finalValue: round(val), history };
}

export function simulateFraudAlerts(transactions) {
  // very simple rules engine
  const alerts = [];
  for (const tx of transactions) {
    if (tx.amount > 10000) alerts.push({ level: 'high', message: 'Large transaction detected', txId: tx.id });
    if (tx.country !== 'home' && tx.amount > 2000) alerts.push({ level: 'medium', message: 'Abroad transaction > $2k', txId: tx.id });
    if (tx.retries > 3) alerts.push({ level: 'low', message: 'Multiple retries', txId: tx.id });
  }
  return alerts;
}

function round(n) {
  return Number(n.toFixed(2));
}


