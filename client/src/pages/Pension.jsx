import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Pension() {
  const { API_URL, token } = useAuth();
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState(100);
  const [sim, setSim] = useState(null);

  async function load() {
    const res = await fetch(`${API_URL}/pension/account`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setAccount(data);
  }

  async function deposit() {
    const res = await fetch(`${API_URL}/pension/deposit`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ amount: Number(amount) }) });
    const data = await res.json();
    setAccount(data);
  }

  async function simulate() {
    const res = await fetch(`${API_URL}/pension/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ months: 24 }) });
    const data = await res.json();
    setSim(data);
  }

  useEffect(() => { load(); }, []);

  return (
    <Box>
      <Heading mb={4}>Crypto-Pension Plans</Heading>
      {account && (
        <Box mb={4}>
          <Text>Balance: ${account.balance.toLocaleString()}</Text>
          <Text>APY: {Math.round(account.apy*100)}%</Text>
        </Box>
      )}
      <Stack direction={["column","row"]} gap={4}>
        <Input type="number" placeholder="Deposit" value={amount} onChange={e => setAmount(e.target.value)} />
        <Button onClick={deposit}>Deposit</Button>
        <Button onClick={simulate}>Simulate 24 months</Button>
      </Stack>
      {sim && (
        <Box mt={4}>
          <Text>Projected final value: ${sim.finalValue}</Text>
        </Box>
      )}
    </Box>
  );
}


