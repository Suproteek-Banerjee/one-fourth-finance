import React, { useState, useEffect } from 'react';
import { Box, Heading, Card, CardBody, CardHeader, SimpleGrid, Text, Input, Button, VStack, HStack, Badge, Avatar, useToast, Stat, StatLabel, StatNumber, StatHelpText, Progress } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const { user, token, API_URL } = useAuth();
  const toast = useToast();
  const [kyc, setKyc] = useState({ country: '', idType: '', idNumber: '' });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch(`${API_URL}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    }
    loadStats();
  }, [API_URL, token]);

  async function submitKYC() {
    if (!kyc.country || !kyc.idType || !kyc.idNumber) {
      toast({ title: 'Please fill all fields', status: 'warning' });
      return;
    }
    setLoading(true);
    const res = await fetch(`${API_URL}/auth/kyc`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
      body: JSON.stringify({ ...kyc }) 
    });
    const data = await res.json();
    toast({ title: `KYC ${data.status}`, status: data.status === 'approved' ? 'success' : 'error' });
    setLoading(false);
  }

  const portfolioValue = stats?.portfolio?.value || 0;
  const investments = stats?.investments || [];
  const pensionBalance = stats?.pension?.balance || 0;
  const loans = stats?.loans || [];
  const policies = stats?.policies || [];
  
  // Calculate investment values
  const investmentValue = investments.reduce((sum, inv) => {
    if (inv.type === 'stock') return sum + (inv.shares * inv.currentPrice);
    if (inv.type === 'bond') return sum + inv.amount;
    if (inv.type === 'crypto') return sum + (inv.amount * inv.currentPrice);
    return sum;
  }, 0);
  
  const totalInvested = portfolioValue + investmentValue + pensionBalance;
  const totalDebt = loans.reduce((sum, loan) => sum + (loan.amount - (loan.funded || 0)), 0);

  const historyData = [
    { day: 'Mon', value: 24000 },
    { day: 'Tue', value: 24200 },
    { day: 'Wed', value: 23800 },
    { day: 'Thu', value: 24500 },
    { day: 'Fri', value: 25000 }
  ];

  return (
    <Box p={6} bgGradient="linear(to-br, gray.50, blue.50)" minH="100vh">
      <Heading mb={6} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Your Profile</Heading>
      
      <SimpleGrid columns={[1, 2]} gap={6} mb={8}>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.3)">
          <CardHeader>
            <HStack>
              <Avatar name={user.name} size="xl" />
              <Box>
                <Heading size="md">{user.name}</Heading>
                <Text color="gray.600">{user.email}</Text>
              </Box>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold">Role</Text>
                <Badge colorScheme="blue" px={3} py={1} fontSize="md">{user.role}</Badge>
              </HStack>
              <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold">Education Verified</Text>
                <Badge colorScheme={user.eduVerified ? 'green' : 'gray'} px={3} py={1} fontSize="md">
                  {user.eduVerified ? '✓ Verified' : 'Not Verified'}
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.3)">
          <CardHeader>
            <Heading size="md">KYC Verification</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text mb={2} fontWeight="medium">Country</Text>
                <Input placeholder="e.g., US, UK, IN" value={kyc.country} onChange={e => setKyc({ ...kyc, country: e.target.value })} />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">ID Type</Text>
                <Input placeholder="e.g., Passport, Driver License" value={kyc.idType} onChange={e => setKyc({ ...kyc, idType: e.target.value })} />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">ID Number</Text>
                <Input placeholder="ID Number" value={kyc.idNumber} onChange={e => setKyc({ ...kyc, idNumber: e.target.value })} />
              </Box>
              <Button onClick={submitKYC} isLoading={loading} colorScheme="blue" w="full">Submit KYC</Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={[1, 2, 3, 4]} gap={6} mb={8}>
        <Card bgGradient="linear(to-br, green.400, green.600)" color="white" boxShadow="xl">
          <CardBody>
            <Stat>
              <StatLabel color="white" opacity={0.9}>Total Invested</StatLabel>
              <StatNumber fontSize="3xl">${totalInvested.toLocaleString()}</StatNumber>
              <StatHelpText color="white" opacity={0.8}>Across All Platforms</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bgGradient="linear(to-br, blue.400, blue.600)" color="white" boxShadow="xl">
          <CardBody>
            <Stat>
              <StatLabel color="white" opacity={0.9}>Portfolio Value</StatLabel>
              <StatNumber fontSize="3xl">${portfolioValue.toLocaleString()}</StatNumber>
              <StatHelpText color="white" opacity={0.8}>Active Investments</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bgGradient="linear(to-br, purple.400, purple.600)" color="white" boxShadow="xl">
          <CardBody>
            <Stat>
              <StatLabel color="white" opacity={0.9}>Pension Balance</StatLabel>
              <StatNumber fontSize="3xl">${pensionBalance.toLocaleString()}</StatNumber>
              <StatHelpText color="white" opacity={0.8}>Retirement Fund</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bgGradient="linear(to-br, red.400, red.600)" color="white" boxShadow="xl">
          <CardBody>
            <Stat>
              <StatLabel color="white" opacity={0.9}>Total Debt</StatLabel>
              <StatNumber fontSize="3xl">${totalDebt.toLocaleString()}</StatNumber>
              <StatHelpText color="white" opacity={0.8}>Outstanding Loans</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.3)">
        <CardHeader>
          <Heading size="md">Account Performance</Heading>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3182CE" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3182CE" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#718096" />
              <YAxis stroke="#718096" />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#3182CE" strokeWidth={3} fillOpacity={1} fill="url(#colorPerformance)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </Box>
  );
}
