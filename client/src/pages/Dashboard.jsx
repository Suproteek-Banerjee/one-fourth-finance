import React, { useEffect, useState } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatHelpText, StatLabel, StatNumber, Card, CardBody, CardHeader, Text, Badge, VStack, HStack, Icon } from '@chakra-ui/react';
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import { WarningIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { FaWallet, FaFileInvoiceDollar, FaShieldAlt, FaPiggyBank, FaTrendUp, FaArrowUp } from 'react-icons/fa';

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
    { name: 'Stocks', value: (portfolioAllocation.stocks || 0) * 100, color: '#0088FE' },
    { name: 'Bonds', value: (portfolioAllocation.bonds || 0) * 100, color: '#00C49F' },
    { name: 'Real Estate', value: (portfolioAllocation.realEstate || 0) * 100, color: '#FFBB28' },
    { name: 'Crypto', value: (portfolioAllocation.crypto || 0) * 100, color: '#FF8042' }
  ];

  const monthlyData = [
    { month: 'Jan', value: 22000 },
    { month: 'Feb', value: 23000 },
    { month: 'Mar', value: 24000 },
    { month: 'Apr', value: 24500 },
    { month: 'May', value: 25000 }
  ];

  const totalAssets = portfolioValue + pensionBalance + policiesCount * 1000;

  if (loading) {
    return <Box p={8}><Text>Loading...</Text></Box>;
  }

  return (
    <Box p={6}>
      <Heading mb={2}>Unified Dashboard</Heading>
      <Text color="gray.600" mb={6}>Complete overview of your financial portfolio</Text>
      
      <SimpleGrid columns={[1, 2, 4]} gap={6} mb={8}>
        <Card bgGradient="linear(to-br, green.50, green.100)" boxShadow="md">
          <CardBody>
            <Stat>
              <HStack mb={2}>
                <Icon as={FaTrendUp} color="green.600" />
                <StatLabel color="gray.700">Portfolio Value</StatLabel>
              </HStack>
              <StatNumber color="green.600" fontSize="3xl">${portfolioValue.toLocaleString()}</StatNumber>
              <StatHelpText fontWeight="medium">Total Investments</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bgGradient="linear(to-br, blue.50, blue.100)" boxShadow="md">
          <CardBody>
            <Stat>
              <HStack mb={2}>
                <Icon as={FaFileInvoiceDollar} color="blue.600" />
                <StatLabel color="gray.700">Active Loans</StatLabel>
              </HStack>
              <StatNumber color="blue.600" fontSize="3xl">{loansCount}</StatNumber>
              <StatHelpText fontWeight="medium">Borrower + Lender</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bgGradient="linear(to-br, purple.50, purple.100)" boxShadow="md">
          <CardBody>
            <Stat>
              <HStack mb={2}>
                <Icon as={FaShieldAlt} color="purple.600" />
                <StatLabel color="gray.700">Policies</StatLabel>
              </HStack>
              <StatNumber color="purple.600" fontSize="3xl">{policiesCount}</StatNumber>
              <StatHelpText fontWeight="medium">Insurance</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bgGradient="linear(to-br, orange.50, orange.100)" boxShadow="md">
          <CardBody>
            <Stat>
              <HStack mb={2}>
                <Icon as={FaPiggyBank} color="orange.600" />
                <StatLabel color="gray.700">Pension</StatLabel>
              </HStack>
              <StatNumber color="orange.600" fontSize="3xl">${pensionBalance.toLocaleString()}</StatNumber>
              <StatHelpText fontWeight="medium">Crypto-Pension</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={[1, 2]} gap={6} mb={8}>
        <Card boxShadow="lg">
          <CardHeader bgGradient="linear(to-r, blue.500, purple.500)" color="white">
            <Heading size="md">Portfolio Growth</Heading>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0088FE" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="value" stroke="#0088FE" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card boxShadow="lg">
          <CardHeader bgGradient="linear(to-r, green.500, teal.500)" color="white">
            <Heading size="md">Portfolio Allocation</Heading>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70}
                  outerRadius={100} 
                  fill="#8884d8" 
                  dataKey="value"
                  paddingAngle={5}
                  label={({name, value}) => `${name}: ${value.toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </SimpleGrid>

      {alerts.length > 0 && (
        <Card boxShadow="lg">
          <CardHeader bgGradient="linear(to-r, yellow.500, orange.500)" color="white">
            <Heading size="md">Recent Alerts</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              {alerts.map((alert) => (
                <Card key={alert.id} variant="outline">
                  <CardBody>
                    <HStack>
                      <Icon 
                        as={alert.level === 'high' ? WarningIcon : CheckCircleIcon} 
                        color={alert.level === 'high' ? 'red.500' : 'green.500'}
                        fontSize="2xl"
                      />
                      <Text flex={1} fontWeight="medium">{alert.message}</Text>
                      <Badge 
                        colorScheme={alert.level === 'high' ? 'red' : 'green'}
                        fontSize="md"
                        px={3}
                        py={1}
                      >
                        {alert.level}
                      </Badge>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}
