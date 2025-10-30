import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Microfinance() {
  const { API_URL, token } = useAuth();
  const [amount, setAmount] = useState(1000);
  const [income, setIncome] = useState(1200);
  const [creditScore, setCreditScore] = useState(680);
  const [result, setResult] = useState(null);
  const [myLoans, setMyLoans] = useState({ borrower: [], lender: [] });

  async function apply() {
    const res = await fetch(`${API_URL}/microfinance/apply`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ amount: Number(amount), income: Number(income), creditScore: Number(creditScore) }) });
    const data = await res.json();
    setResult(data);
    await loadMy();
  }

  async function fund(loanId) {
    await fetch(`${API_URL}/microfinance/fund`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ loanId, amount: 200 }) });
    await loadMy();
  }

  async function loadMy() {
    const res = await fetch(`${API_URL}/microfinance/my-loans`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMyLoans(data);
  }

  useEffect(() => { loadMy(); }, []);

  return (
    <Box>
      <Heading mb={4}>Cross-Border Microfinance</Heading>
      <Stack direction={["column","row"]} gap={4} mb={4}>
        <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
        <Input type="number" placeholder="Income" value={income} onChange={e => setIncome(e.target.value)} />
        <Input type="number" placeholder="Credit Score" value={creditScore} onChange={e => setCreditScore(e.target.value)} />
        <Button onClick={apply}>Apply</Button>
      </Stack>
      {result && (
        <Box mb={6}>
          <Text>Approval: {result.approved ? 'Approved' : 'Rejected'} ({Math.round(result.approvalProbability*100)}%)</Text>
          <pre>{JSON.stringify(result.loan, null, 2)}</pre>
        </Box>
      )}
      <Heading size="md" mb={2}>My Loans</Heading>
      <Text mb={2}>As Borrower</Text>
      <pre>{JSON.stringify(myLoans.borrower, null, 2)}</pre>
      <Text mt={4} mb={2}>As Lender</Text>
      <pre>{JSON.stringify(myLoans.lender, null, 2)}</pre>
      {myLoans.borrower.map(l => (
        <Button key={l.id} mt={2} onClick={() => fund(l.id)}>Fund $200 (demo)</Button>
      ))}
    </Box>
  );
}


