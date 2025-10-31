import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Input, Text, Card, CardBody, CardHeader, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, VStack } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function Pension() {
  const { API_URL, token } = useAuth();
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState(100);
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`${API_URL}/pension/account`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setAccount(data);
    setLoading(false);
  }

  async function deposit() {
    setLoading(true);
    const res = await fetch(`${API_URL}/pension/deposit`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ amount: Number(amount) }) });
    const data = await res.json();
    setAccount(data);
    setLoading(false);
  }

  async function simulate() {
    const res = await fetch(`${API_URL}/pension/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ months: 24 }) });
    const data = await res.json();
    setSim(data);
  }

  useEffect(() => { load(); }, []);

  const simData = sim ? sim.history.map((h, idx) => ({ month: h.month, value: h.value })) : [];

  return (
    <Box p={6}>
      <Heading mb={6}>Crypto-Pension Plans</Heading>
      <SimpleGrid columns={[1, 3]} gap={6} mb={8}>
        {account && (
          <>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="gray.600">Current Balance</StatLabel>
                  <StatNumber color="green.500" fontSize="2xl">${account.balance.toLocaleString()}</StatNumber>
                  <StatHelpText>Crypto Assets</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="gray.600">APY Rate</StatLabel>
                  <StatNumber color="blue.500" fontSize="2xl">{(account.apy * 100).toFixed(2)}%</StatNumber>
                  <StatHelpText>Annual Return</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="gray.600">Monthly Contribution</StatLabel>
                  <StatNumber color="purple.500" fontSize="2xl">${account.monthlyContribution}</StatNumber>
                  <StatHelpText>Auto Deposit</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </>
        )}
      </SimpleGrid>

      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Deposit Funds</Heading>
        </CardHeader>
        <CardBody>
          <Box display="flex" gap={4}>
            <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} flex={1} />
            <Button onClick={deposit} isLoading={loading} colorScheme="blue">Deposit</Button>
          </Box>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Heading size="md">Growth Simulation</Heading>
        </CardHeader>
        <CardBody>
          {sim ? (
            <VStack align="stretch" spacing={4}>
              <Box textAlign="center" p={4} bg="green.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600" mb={2}>Projected Value After 24 Months</Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.600">${sim.finalValue.toLocaleString()}</Text>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={simData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#48BB78" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <Button onClick={simulate} colorScheme="green" size="lg" mt={2}>Update Projection</Button>
            </VStack>
          ) : (
            <Box textAlign="center" py={8}>
              <Text color="gray.500" mb={4}>See your pension growth projection</Text>
              <Button onClick={simulate} colorScheme="blue">Run Simulation</Button>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
