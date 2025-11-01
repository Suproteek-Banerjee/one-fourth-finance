import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Input, Text, Card, CardBody, CardHeader, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, VStack, useToast, HStack, Icon, Badge, Alert, AlertIcon } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ViewIcon, ArrowUpIcon, CheckCircleIcon, InfoIcon } from '@chakra-ui/icons';

export default function Pension() {
  const { API_URL, token, loading: authLoading } = useAuth();
  const toast = useToast();
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState(100);
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(false);

  const [initialLoad, setInitialLoad] = useState(true);

  async function load() {
    if (!token) {
      setInitialLoad(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pension/account`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to load pension account:', res.status, errorData);
        toast({ title: 'Failed to load account', status: 'error', description: errorData.error || 'Please try again' });
      }
    } catch (err) {
      console.error('Failed to load account:', err);
      toast({ title: 'Network error', status: 'error', description: 'Could not connect to server' });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }

  async function deposit() {
    if (!token) {
      toast({ title: 'Please wait for authentication', status: 'warning' });
      return;
    }
    if (!amount || amount <= 0) {
      toast({ title: 'Please enter a valid amount', status: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pension/deposit`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ amount: Number(amount) }) 
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Deposit failed' }));
        throw new Error(errorData.error || 'Deposit failed');
      }
      const data = await res.json();
      setAccount(data);
      toast({ title: 'Deposit successful!', status: 'success', description: `Added $${amount} to your pension` });
      setAmount(100);
    } catch (err) {
      toast({ title: 'Deposit failed', status: 'error', description: err.message || 'Please try again' });
    } finally {
      setLoading(false);
    }
  }

  async function simulate() {
    if (!token) {
      toast({ title: 'Please wait for authentication', status: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pension/simulate`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ months: 24 }) 
      });
      if (res.ok) {
        const data = await res.json();
        setSim(data);
        toast({ title: 'Simulation complete!', status: 'success' });
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast({ title: 'Simulation failed', status: 'error', description: errorData.error || 'Please try again' });
      }
    } catch (err) {
      console.error('Simulation failed:', err);
      toast({ title: 'Network error', status: 'error', description: 'Could not connect to server' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && token) {
      load();
    } else if (!authLoading && !token) {
      setInitialLoad(false);
    }
  }, [API_URL, token, authLoading]);

  const simData = sim ? sim.history.map((h, idx) => ({ month: h.month, value: h.value })) : [];
  const projectedGrowth = sim ? sim.finalValue - (account?.balance || 0) : 0;

  return (
    <Box p={6}>
      <HStack mb={6}>
        <Icon as={ViewIcon} fontSize="2xl" color="blue.500" />
        <Heading>Crypto-Pension Plans</Heading>
      </HStack>
      
      {initialLoad && authLoading && (
        <Box p={8}><Text>Loading...</Text></Box>
      )}
      
      <SimpleGrid columns={[1, 2, 4]} gap={6} mb={8}>
        {account ? (
          <>
            <Card bgGradient="linear(to-br, green.400, green.600)" color="white" boxShadow="2xl">
              <CardBody>
                <Stat>
                  <HStack mb={2}>
                    <Icon as={CheckCircleIcon} />
                    <StatLabel opacity={0.9}>Current Balance</StatLabel>
                  </HStack>
                  <StatNumber fontSize="3xl">${account.balance.toLocaleString()}</StatNumber>
                  <StatHelpText opacity={0.8}>Crypto Assets</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bgGradient="linear(to-br, blue.400, blue.600)" color="white" boxShadow="2xl">
              <CardBody>
                <Stat>
                  <HStack mb={2}>
                    <Icon as={ArrowUpIcon} />
                    <StatLabel opacity={0.9}>APY Rate</StatLabel>
                  </HStack>
                  <StatNumber fontSize="3xl">{(account.apy * 100).toFixed(2)}%</StatNumber>
                  <StatHelpText opacity={0.8}>Annual Return</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bgGradient="linear(to-br, purple.400, purple.600)" color="white" boxShadow="2xl">
              <CardBody>
                <Stat>
                  <HStack mb={2}>
                    <Icon as={InfoIcon} />
                    <StatLabel opacity={0.9}>Monthly Deposit</StatLabel>
                  </HStack>
                  <StatNumber fontSize="3xl">${account.monthlyContribution}</StatNumber>
                  <StatHelpText opacity={0.8}>Auto Deposit</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bgGradient="linear(to-br, orange.400, orange.600)" color="white" boxShadow="2xl">
              <CardBody>
                <Stat>
                  <HStack mb={2}>
                    <Icon as={ArrowUpIcon} />
                    <StatLabel opacity={0.9}>Total Value</StatLabel>
                  </HStack>
                  <StatNumber fontSize="3xl">
                    ${((account.balance * (1 + account.apy)) || 0).toLocaleString()}
                  </StatNumber>
                  <StatHelpText opacity={0.8}>With Growth</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </>
        ) : (
          <Card><CardBody><Text>Loading...</Text></CardBody></Card>
        )}
      </SimpleGrid>

      <Card mb={8} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
        <CardHeader bgGradient="linear(to-r, blue.500, purple.500)" color="white" borderRadius="lg">
          <Heading size="md">Deposit Funds</Heading>
        </CardHeader>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text mb={2} fontWeight="medium">Amount to Deposit</Text>
              <Input 
                type="number" 
                placeholder="Enter amount" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                size="lg"
                fontSize="xl"
              />
            </Box>
            <HStack spacing={4}>
              <Button onClick={() => setAmount(100)} variant="outline" size="sm">$100</Button>
              <Button onClick={() => setAmount(500)} variant="outline" size="sm">$500</Button>
              <Button onClick={() => setAmount(1000)} variant="outline" size="sm">$1,000</Button>
              <Button onClick={() => setAmount(5000)} variant="outline" size="sm">$5,000</Button>
            </HStack>
            <Button onClick={deposit} isLoading={loading} colorScheme="blue" size="lg" w="full">
              Deposit ${amount || 0}
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
        <CardHeader bgGradient="linear(to-r, green.500, teal.500)" color="white" borderRadius="lg">
          <Heading size="md">Growth Simulation</Heading>
        </CardHeader>
        <CardBody>
          {sim ? (
            <VStack align="stretch" spacing={6}>
              <SimpleGrid columns={[1, 2]} gap={4}>
                <Box textAlign="center" p={6} bgGradient="linear(to-br, green.50, green.100)" borderRadius="lg">
                  <Text fontSize="xs" color="gray.600" mb={2}>Projected Value After 24 Months</Text>
                  <Text fontSize="4xl" fontWeight="bold" color="green.600">
                    ${sim.finalValue.toLocaleString()}
                  </Text>
                  <Badge mt={2} colorScheme="green" fontSize="md">
                    +${projectedGrowth.toLocaleString()} growth
                  </Badge>
                </Box>
                <Box textAlign="center" p={6} bgGradient="linear(to-br, blue.50, blue.100)" borderRadius="lg">
                  <Text fontSize="xs" color="gray.600" mb={2}>Starting Balance</Text>
                  <Text fontSize="4xl" fontWeight="bold" color="blue.600">
                    ${(account?.balance || 0).toLocaleString()}
                  </Text>
                  <Badge mt={2} colorScheme="blue" fontSize="md">
                    {account?.apy && `${(account.apy * 100).toFixed(2)}% APY`}
                  </Badge>
                </Box>
              </SimpleGrid>
              
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={simData}>
                  <defs>
                    <linearGradient id="colorPension" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#48BB78" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#48BB78" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="gray.200" />
                  <XAxis dataKey="month" stroke="gray.600" />
                  <YAxis stroke="gray.600" />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E2E8F0', 
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#48BB78" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPension)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              <Button onClick={simulate} colorScheme="green" size="lg" leftIcon={<ArrowUpIcon />}>
                Update Projection
              </Button>
            </VStack>
          ) : (
            <Box textAlign="center" py={12}>
              <InfoIcon fontSize="5xl" color="gray.300" mb={4} />
              <Text color="gray.600" fontSize="lg" mb={4}>See your pension growth projection</Text>
              <Button onClick={simulate} colorScheme="blue" size="lg" leftIcon={<ArrowUpIcon />}>
                Run Simulation
              </Button>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
