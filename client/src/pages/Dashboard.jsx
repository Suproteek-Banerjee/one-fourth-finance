import React, { useState } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatHelpText, StatLabel, StatNumber, Card, CardBody, CardHeader, Text, Badge, VStack, HStack, Icon } from '@chakra-ui/react';
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WarningIcon, CheckCircleIcon, ArrowUpIcon } from '@chakra-ui/icons';

// Mock data - no API calls
const MOCK_DATA = {
  portfolio: {
    value: 25000,
    allocation: { stocks: 0.55, bonds: 0.25, realEstate: 0.15, crypto: 0.05 }
  },
  investments: [
    { id: '1', type: 'stock', symbol: 'AAPL', shares: 5, avgPrice: 150, currentPrice: 175 },
    { id: '2', type: 'stock', symbol: 'MSFT', shares: 3, avgPrice: 300, currentPrice: 380 },
    { id: '3', type: 'bond', symbol: 'US10Y', amount: 5000, yield: 0.045 },
    { id: '4', type: 'crypto', symbol: 'BTC', amount: 0.05, avgPrice: 45000, currentPrice: 45000 }
  ],
  loans: [
    { id: '1', amount: 1500, rate: 0.18, termMonths: 12, status: 'active', funded: 900 }
  ],
  policies: [
    { id: '1', name: 'OFF Basic Health', premium: 25, coverage: 10000 }
  ],
  pension: {
    balance: 5000,
    monthlyContribution: 200,
    apy: 0.08
  },
  alerts: [
    { id: '1', type: 'info', message: 'Portfolio performance is up 5% this month', ts: Date.now() - 86400000 }
  ]
};

export default function Dashboard() {
  const investments = MOCK_DATA.investments;
  const portfolioValue = MOCK_DATA.portfolio.value;
  const loansCount = MOCK_DATA.loans.length;
  const policiesCount = MOCK_DATA.policies.length;
  const pensionBalance = MOCK_DATA.pension.balance;
  const alerts = MOCK_DATA.alerts;
  
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
    const key = inv.type === 'stock' ? 'stocks' : inv.type === 'bond' ? 'bonds' : 'crypto';
    acc[key] = (acc[key] || 0) + val;
    return acc;
  }, { stocks: 0, bonds: 0, crypto: 0 });
  
  // Get portfolio allocation from mock data
  const portfolioAllocation = MOCK_DATA.portfolio.allocation;
  
  // Combine investment-based allocation with portfolio allocation
  const totalAllocationValue = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  
  let allocationPercent = { stocks: 0, bonds: 0, crypto: 0, realEstate: 0 };
  
  if (totalAllocationValue > 0) {
    allocationPercent.stocks = allocation.stocks / totalAllocationValue;
    allocationPercent.bonds = allocation.bonds / totalAllocationValue;
    allocationPercent.crypto = allocation.crypto / totalAllocationValue;
  } else {
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
                <Icon as={CheckCircleIcon} color="blue.500" />
                <StatLabel color="gray.700">Active Loans</StatLabel>
              </HStack>
              <StatNumber color="blue.600" fontSize="3xl">{loansCount}</StatNumber>
              <StatHelpText fontWeight="medium">Microfinance</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)" transition="all 0.3s" _hover={{ transform: 'translateY(-5px)', boxShadow: '3xl' }}>
          <CardBody>
            <Stat>
              <HStack mb={2}>
                <Icon as={CheckCircleIcon} color="purple.500" />
                <StatLabel color="gray.700">Insurance Policies</StatLabel>
              </HStack>
              <StatNumber color="purple.600" fontSize="3xl">{policiesCount}</StatNumber>
              <StatHelpText fontWeight="medium">Active Coverage</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)" transition="all 0.3s" _hover={{ transform: 'translateY(-5px)', boxShadow: '3xl' }}>
          <CardBody>
            <Stat>
              <HStack mb={2}>
                <Icon as={ArrowUpIcon} color="orange.500" />
                <StatLabel color="gray.700">Pension Balance</StatLabel>
              </HStack>
              <StatNumber color="orange.600" fontSize="3xl">${pensionBalance.toLocaleString()}</StatNumber>
              <StatHelpText fontWeight="medium">Retirement Fund</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={[1, 2]} gap={6} mb={8}>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader>
            <Heading size="md" color="gray.700">Portfolio Allocation</Heading>
          </CardHeader>
          <CardBody>
            {fullPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={fullPieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                    {fullPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Text color="gray.500" textAlign="center" py={8}>No allocation data available</Text>
            )}
          </CardBody>
        </Card>

        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader>
            <Heading size="md" color="gray.700">Portfolio Growth</Heading>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </SimpleGrid>

      {alerts.length > 0 && (
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)" mb={8}>
          <CardHeader>
            <Heading size="md" color="gray.700">Recent Alerts</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={2}>
              {alerts.map(alert => (
                <HStack key={alert.id} p={3} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
                  <Icon as={WarningIcon} color="blue.500" />
                  <Text flex={1}>{alert.message}</Text>
                  <Badge colorScheme="blue">{new Date(alert.ts).toLocaleDateString()}</Badge>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}
