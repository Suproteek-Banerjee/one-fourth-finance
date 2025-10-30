import React, { useState } from 'react';
import { Box, Button, Heading, Input, SimpleGrid, Stat, StatLabel, StatNumber, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function CreditRisk() {
  const { API_URL, token } = useAuth();
  const [income, setIncome] = useState(3000);
  const [debts, setDebts] = useState(500);
  const [assets, setAssets] = useState(10000);
  const [expenses, setExpenses] = useState(1200);
  const [result, setResult] = useState(null);

  async function score() {
    const res = await fetch(`${API_URL}/credit-risk/score`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ income: Number(income), debts: Number(debts), assets: Number(assets), expenses: Number(expenses) }) });
    const data = await res.json();
    setResult(data);
  }

  return (
    <Box>
      <Heading mb={4}>AI-Powered Credit Risk</Heading>
      <SimpleGrid columns={[1, 2]} gap={6}>
        <Box>
          <Input mb={2} type="number" placeholder="Income" value={income} onChange={e => setIncome(e.target.value)} />
          <Input mb={2} type="number" placeholder="Debts" value={debts} onChange={e => setDebts(e.target.value)} />
          <Input mb={2} type="number" placeholder="Assets" value={assets} onChange={e => setAssets(e.target.value)} />
          <Input mb={2} type="number" placeholder="Expenses" value={expenses} onChange={e => setExpenses(e.target.value)} />
          <Button onClick={score}>Calculate</Button>
        </Box>
        <Box>
          {result && (
            <SimpleGrid columns={[1,3]} gap={4}>
              <Stat>
                <StatLabel>Score</StatLabel>
                <StatNumber>{result.score}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Prob. Default</StatLabel>
                <StatNumber>{Math.round(result.probabilityOfDefault*100)}%</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Eligible</StatLabel>
                <StatNumber color={result.eligible ? 'green.500' : 'red.500'}>{result.eligible ? 'Yes' : 'No'}</StatNumber>
              </Stat>
            </SimpleGrid>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
}


