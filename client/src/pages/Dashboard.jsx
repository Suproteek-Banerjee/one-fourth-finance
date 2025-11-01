import React, { useEffect, useState } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatHelpText, StatLabel, StatNumber, Card, CardBody, CardHeader, Text, Badge, VStack, HStack, Icon } from '@chakra-ui/react';
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation } from 'react-router-dom';
import { WarningIcon, CheckCircleIcon, ArrowUpIcon, ViewIcon, InfoIcon } from '@chakra-ui/icons';

export default function Dashboard() {
  const { API_URL, token, loading: authLoading } = useAuth();
  const location = useLocation();
  const [data, setData] = useState({ portfolio: {}, investments: [], loans: [], policies: [], pension: null, alerts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading before making API call
    if (authLoading) {
      setLoading(true);
      return;
    }
    
    if (!token) {
      // If no token after auth loads, show empty state
      setLoading(false);
      setData({ portfolio: {}, investments: [], loans: [], policies: [], pension: null, alerts: [] });
      return;
    }
    
    // Load dashboard data
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          console.error('Dashboard API error:', res.status, res.statusText);
          setData({ portfolio: {}, investments: [], loans: [], policies: [], pension: null, alerts: [] });
        } else {
          const json = await res.json();
          setData(json || { portfolio: {}, investments: [], loans: [], policies: [], pension: null, alerts: [] });
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setData({ portfolio: {}, investments: [], loans: [], policies: [], pension: null, alerts: [] });
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, [API_URL, token, authLoading, location.pathname]);

  const investments = data?.investments || [];
  const portfolioValue = data?.portfolio?.value || 0;
  const loansCount = data?.loans?.length || 0;
  const policiesCount = data?.policies?.length || 0;
  const pensionBalance = data?.pension?.balance || 0;
  const alerts = data?.alerts || [];
  
  // Calculate investment values
  const investmentValue = investments.reduce((sum, inv) => {
    if (inv.type === 'stock') return sum + (inv.shares * inv.currentPrice);
    if (inv.type === 'bond') return sum + inv.amount;
    if (inv.type === 'crypto') return sum + (inv.amount * inv.currentPrice);
    return sum;
  }, 0);
  
  const totalPortfolioValue = portfolioValue + investmentValue;
  
  // Calculate allocation from investments
  const allocation = investments.reduce((acc, inv) => {
    if (!inv || !inv.type) return acc;
    const val = inv.type === 'stock' ? (inv.shares || 0) * (inv.currentPrice || inv.avgPrice || 0) : 
                inv.type === 'bond' ? (inv.amount || 0) : 
                (inv.amount || 0) * (inv.currentPrice || inv.avgPrice || 0);
    // Map investment type to plural key
    const key = inv.type === 'stock' ? 'stocks' : inv.type === 'bond' ? 'bonds' : 'crypto';
    acc[key] = (acc[key] || 0) + val;
    return acc;
  }, { stocks: 0, bonds: 0, crypto: 0 });
  
  // Get portfolio allocation from backend
  const portfolioAllocation = data?.portfolio?.allocation || {};
  
  // Combine investment-based allocation with portfolio allocation
  const totalAllocationValue = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  
  // Start with portfolio allocation if available, then merge with investments
  let allocationPercent = { stocks: 0, bonds: 0, crypto: 0, realEstate: 0 };
  
  // If we have investment values, calculate percentages from them
  if (totalAllocationValue > 0) {
    allocationPercent.stocks = allocation.stocks / totalAllocationValue;
    allocationPercent.bonds = allocation.bonds / totalAllocationValue;
    allocationPercent.crypto = allocation.crypto / totalAllocationValue;
  } else if (portfolioAllocation.stocks || portfolioAllocation.bonds || portfolioAllocation.crypto || portfolioAllocation.realEstate) {
    // If no investments but have portfolio allocation, use that
    allocationPercent = {
      stocks: portfolioAllocation.stocks || 0,
      bonds: portfolioAllocation.bonds || 0,
      crypto: portfolioAllocation.crypto || 0,
      realEstate: portfolioAllocation.realEstate || 0
    };
  }
  
  // Build pie chart data
  const fullPieData = [
    { name: 'Stocks', value: Math.round(allocationPercent.stocks * 100), color: '#0088FE' },
    { name: 'Bonds', value: Math.round(allocationPercent.bonds * 100), color: '#00C49F' },
    { name: 'Crypto', value: Math.round(allocationPercent.crypto * 100), color: '#FF8042' },
    { name: 'Real Estate', value: Math.round((allocationPercent.realEstate || 0) * 100), color: '#FFBB28' }
  ].filter(item => item.value > 0);

  const monthlyData = [
    { month: 'Jan', value: 22000 },
    { month: 'Feb', value: 23000 },
    { month: 'Mar', value: 24000 },
    { month: 'Apr', value: 24500 },
    { month: 'May', value: 25000 }
  ];

  // Always show something - never blank
  if (loading || authLoading) {
    return (
      <Box p={8}>
        <Heading mb={2} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Unified Dashboard</Heading>
        <Box display="flex" alignItems="center" justifyContent="center" minH="50vh">
          <Text fontSize="lg" color="gray.600">Loading dashboard...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={2} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Unified Dashboard</Heading>
      <Text color="gray.600" mb={6}>Complete overview of your financial portfolio</Text>
      
      <SimpleGrid columns={[1, 2, 4]} gap={6} mb={8}>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)" transition="all 0.3s" _hover={{ transform: 'translateY(-5px)', boxShadow: '3xl' }}>
          <CardBody>
            <Stat>
              <HStack mb={2}>
                <Icon as={ArrowUpIcon} color="green.500" />
                <StatLabel color="gray.700">Portfolio Value</StatLabel>
              </HStack>
              <StatNumber color="green.600" fontSize="3xl">${totalPortfolioValue.toLocaleString()}</StatNumber>
              <StatHelpText fontWeight="medium">Total Investments</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)" transition="all 0.3s" _hover={{ transform: 'translateY(-5px)', boxShadow: '3xl' }}>
          <CardBody>
            <Stat>
              <HStack mb={2}>
                <Icon as={ViewIcon} color="blue.500" />
                <StatLabel color="gray.700">Active Loans</StatLabel>
              </HStack>
              <StatNumber color="blue.600" fontSize="3xl">{loansCount}</StatNumber>
              <StatHelpText fontWeight="medium">Borrower + Lender</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)" transition="all 0.3s" _hover={{ transform: 'translateY(-5px)', boxShadow: '3xl' }}>
          <CardBody>
            <Stat>
              <HStack mb={2}>
                <Icon as={InfoIcon} color="purple.500" />
                <StatLabel color="gray.700">Policies</StatLabel>
              </HStack>
              <StatNumber color="purple.600" fontSize="3xl">{policiesCount}</StatNumber>
              <StatHelpText fontWeight="medium">Insurance</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)" transition="all 0.3s" _hover={{ transform: 'translateY(-5px)', boxShadow: '3xl' }}>
          <CardBody>
            <Stat>
              <HStack mb={2}>
                <Icon as={CheckCircleIcon} color="orange.500" />
                <StatLabel color="gray.700">Pension</StatLabel>
              </HStack>
              <StatNumber color="orange.600" fontSize="3xl">${pensionBalance.toLocaleString()}</StatNumber>
              <StatHelpText fontWeight="medium">Crypto-Pension</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={[1, 2]} gap={6} mb={8}>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader bgGradient="linear(to-r, blue.500, purple.500)" color="white" borderRadius="lg">
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

        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader bgGradient="linear(to-r, green.500, teal.500)" color="white" borderRadius="lg">
            <Heading size="md">Portfolio Allocation</Heading>
          </CardHeader>
          <CardBody>
            {fullPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={fullPieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={70}
                    outerRadius={100} 
                    fill="#8884d8" 
                    dataKey="value"
                    paddingAngle={5}
                    label={({name, value}) => value > 0 ? `${name}: ${value}%` : ''}
                  >
                    {fullPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box textAlign="center" py={12}>
                <Text color="gray.500">Complete coaching assessment to see your allocation</Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {alerts.length > 0 && (
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader bgGradient="linear(to-r, yellow.500, orange.500)" color="white" borderRadius="lg">
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
