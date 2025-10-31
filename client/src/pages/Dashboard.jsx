import React, { useEffect, useState } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatHelpText, StatLabel, StatNumber, Card, CardBody, CardHeader, Text, Badge, VStack, HStack, Icon } from '@chakra-ui/react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import { WarningIcon, CheckCircleIcon } from '@chakra-ui/icons';

export default function Dashboard() {
  const { API_URL, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`${API_URL}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    load();
  }, [API_URL, token]);

  const portfolioValue = data?.portfolio?.value || 0;
  const loansCount = data?.loans?.length || 0;
  const policiesCount = data?.policies?.length || 0;
  const pensionBalance = data?.pension?.balance || 0;
  const alerts = data?.alerts || [];
  const portfolioAllocation = data?.portfolio?.allocation || { stocks: 0, bonds: 0, realEstate: 0, crypto: 0 };

  const pieData = [
    { name: 'Stocks', value: portfolioAllocation.stocks || 0 },
    { name: 'Bonds', value: portfolioAllocation.bonds || 0 },
    { name: 'Real Estate', value: portfolioAllocation.realEstate || 0 },
    { name: 'Crypto', value: portfolioAllocation.crypto || 0 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const monthlyData = [
    { month: 'Jan', value: 22000 },
    { month: 'Feb', value: 23000 },
    { month: 'Mar', value: 24000 },
    { month: 'Apr', value: 24500 },
    { month: 'May', value: 25000 }
  ];

  if (loading) {
    return <Box p={8}><Text>Loading...</Text></Box>;
  }

  return (
    <Box p={6}>
      <Heading mb={6}>Unified Dashboard</Heading>
      <SimpleGrid columns={[1, 2, 4]} gap={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Portfolio Value</StatLabel>
              <StatNumber color="green.500">${portfolioValue.toLocaleString()}</StatNumber>
              <StatHelpText>Total Investments</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Active Loans</StatLabel>
              <StatNumber>{loansCount}</StatNumber>
              <StatHelpText>Borrower + Lender</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Insurance Policies</StatLabel>
              <StatNumber>{policiesCount}</StatNumber>
              <StatHelpText>Active Coverage</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Pension Balance</StatLabel>
              <StatNumber color="blue.500">${pensionBalance.toLocaleString()}</StatNumber>
              <StatHelpText>Crypto-Pension</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={[1, 2]} gap={6} mb={8}>
        <Card>
          <CardHeader>
            <Heading size="md">Portfolio Growth</Heading>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Portfolio Allocation</Heading>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </SimpleGrid>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <Heading size="md">Recent Alerts</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              {alerts.map((alert) => (
                <HStack key={alert.id} p={3} bg="gray.50" borderRadius="md">
                  <Icon as={alert.level === 'high' ? WarningIcon : CheckCircleIcon} color={alert.level === 'high' ? 'red.500' : 'green.500'} />
                  <Text flex={1}>{alert.message}</Text>
                  <Badge colorScheme={alert.level === 'high' ? 'red' : 'green'}>{alert.level}</Badge>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}
