import express from 'express';
import { nanoid } from 'nanoid';
import { db } from '../data/mockDb.js';
import { requireAuth } from '../middleware/auth.js';
import { simulateLoanApproval, simulateRepaymentSchedule } from '../utils/simulators.js';

const router = express.Router();

router.post('/apply', requireAuth, (req, res) => {
  const { amount, income, creditScore } = req.body;
  const { approved, approvalProbability } = simulateLoanApproval({ amount, income, creditScore });
  const loan = { id: nanoid(), borrowerId: req.user.id, amount, rate: 0.18, termMonths: 12, status: approved ? 'pending_funding' : 'rejected', funded: 0 };
  db.loans.push(loan);
  res.json({ loan, approved, approvalProbability });
});

router.post('/fund', requireAuth, (req, res) => {
  // lenders fund loans
  const { loanId, amount } = req.body;
  const loan = db.loans.find(l => l.id === loanId);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  db.loanFunding.push({ id: nanoid(), loanId, userId: req.user.id, amount });
  loan.funded += amount;
  if (loan.funded >= loan.amount) loan.status = 'active';
  res.json({ loan });
});

router.get('/repayment-schedule/:loanId', requireAuth, (req, res) => {
  const loan = db.loans.find(l => l.id === req.params.loanId);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  const schedule = simulateRepaymentSchedule(loan.amount, loan.rate, loan.termMonths);
  res.json({ schedule });
});

router.get('/my-loans', requireAuth, (req, res) => {
  const myBorrowerLoans = db.loans.filter(l => l.borrowerId === req.user.id);
  const myLenderLoans = db.loanFunding.filter(f => f.userId === req.user.id).map(f => db.loans.find(l => l.id === f.loanId));
  res.json({ borrower: myBorrowerLoans, lender: myLenderLoans });
});

export default router;


