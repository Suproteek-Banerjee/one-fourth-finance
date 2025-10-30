import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Fraud() {
  const { API_URL, token } = useAuth();
  const [alerts, setAlerts] = useState([]);

  async function simulate() {
    const sample = [
      { id: 'tx1', amount: 15000, country: 'home', retries: 0 },
      { id: 'tx2', amount: 2500, country: 'abroad', retries: 1 },
      { id: 'tx3', amount: 100, country: 'home', retries: 5 }
    ];
    await fetch(`${API_URL}/fraud/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ transactions: sample }) });
    await load();
  }

  async function load() {
    const res = await fetch(`${API_URL}/fraud/alerts`, { headers: { Authorization: `Bearer ${token}` } });
    setAlerts(await res.json());
  }

  useEffect(() => { load(); }, []);

  return (
    <Box>
      <Heading mb={4}>Advanced Fraud Detection</Heading>
      <Button onClick={simulate} mb={3}>Simulate Alerts</Button>
      <Text>Recent Alerts:</Text>
      <pre>{JSON.stringify(alerts, null, 2)}</pre>
    </Box>
  );
}


