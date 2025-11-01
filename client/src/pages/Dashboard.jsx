import React, { useState, useEffect } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatHelpText, StatLabel, StatNumber, Card, CardBody, CardHeader, Text, Badge, VStack, HStack, Icon } from '@chakra-ui/react';
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WarningIcon, CheckCircleIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { useLocation } from 'react-router-dom';

// Mock data - no API calls
const MOCK_DATA = {
  portfolio: {
    value: 0, // This will be calculated from investments
    allocation: { stocks: 0.55, bonds: 0.25, realEstate: 0.15, crypto: 0.05 }
  },
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

// Real estate properties (matching RealEstate page)
const REAL_ESTATE_PROPERTIES = [
  { id: '1', title: 'Nairobi Apartments', price: 250000, roi: 0.11, tokensTotal: 100000, tokensAvailable: 75000 },
  { id: '2', title: 'Lagos Co-working', price: 450000, roi: 0.13, tokensTotal: 150000, tokensAvailable: 120000 },
  { id: '3', title: 'Bangalore Retail', price: 600000, roi: 0.09, tokensTotal: 200000, tokensAvailable: 180000 },
  { id: '4', title: 'Cape Town Residences', price: 350000, roi: 0.12, tokensTotal: 125000, tokensAvailable: 95000 },
  { id: '5', title: 'Mumbai Office Complex', price: 750000, roi: 0.10, tokensTotal: 250000, tokensAvailable: 220000 },
  { id: '6', title: 'Dubai Luxury Condos', price: 850000, roi: 0.14, tokensTotal: 280000, tokensAvailable: 250000 }
];

// Get investments from localStorage (shared with Investments page)
const getStoredInvestments = () => {
  try {
    const stored = localStorage.getItem('off_investments');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  // Default investments if none stored
  return [
    { id: '1', type: 'stock', symbol: 'AAPL', shares: 5, avgPrice: 150, currentPrice: 175 },
    { id: '2', type: 'stock', symbol: 'MSFT', shares: 3, avgPrice: 300, currentPrice: 380 },
    { id: '3', type: 'bond', symbol: 'US10Y', amount: 5000, yield: 0.045 },
    { id: '4', type: 'crypto', symbol: 'BTC', amount: 0.05, avgPrice: 45000, currentPrice: 45000 }
  ];
};

// Get real estate holdings from localStorage
const getStoredRealEstate = () => {
  try {
    const stored = localStorage.getItem('off_realestate');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return [];
};

export default function Dashboard() {
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get current stock/crypto prices from mock options
  const stockPrices = { AAPL: 175, MSFT: 380, GOOGL: 140, AMZN: 145, TSLA: 250, NVDA: 480, META: 320, NFLX: 450, JPM: 150, BAC: 35 };
  const cryptoPrices = { BTC: 45000, ETH: 2500, SOL: 100, ADA: 0.55, MATIC: 0.85, DOT: 7.2 };
  
  // Refresh when navigating to dashboard
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [location.pathname]);
  
  // Get investments from storage and make it reactive
  const [investments, setInvestments] = useState(() => {
    const stored = getStoredInvestments();
    return stored.map(inv => {
      if (inv.type === 'stock') {
        return { ...inv, currentPrice: stockPrices[inv.symbol] || inv.currentPrice || inv.avgPrice };
      } else if (inv.type === 'crypto') {
        return { ...inv, currentPrice: cryptoPrices[inv.symbol] || inv.currentPrice || inv.avgPrice };
      }
      return inv;
    });
  });
  
  // Update investments when storage changes or when navigating to dashboard
  useEffect(() => {
    const stored = getStoredInvestments();
    const updated = stored.map(inv => {
      if (inv.type === 'stock') {
        return { ...inv, currentPrice: stockPrices[inv.symbol] || inv.currentPrice || inv.avgPrice };
      } else if (inv.type === 'crypto') {
        return { ...inv, currentPrice: cryptoPrices[inv.symbol] || inv.currentPrice || inv.avgPrice };
      }
      return inv;
    });
    setInvestments(updated);
  }, [location.pathname, refreshKey]);
  
  // Get real estate holdings
  const [realEstateHoldings, setRealEstateHoldings] = useState([]);
  
  useEffect(() => {
    setRealEstateHoldings(getStoredRealEstate());
  }, [refreshKey]);

  // Listen for storage changes (when investments are updated)
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
      // Reload data immediately
      const stored = getStoredInvestments();
      const updated = stored.map(inv => {
        if (inv.type === 'stock') {
          return { ...inv, currentPrice: stockPrices[inv.symbol] || inv.currentPrice || inv.avgPrice };
        } else if (inv.type === 'crypto') {
          return { ...inv, currentPrice: cryptoPrices[inv.symbol] || inv.currentPrice || inv.avgPrice };
        }
        return inv;
      });
      setInvestments(updated);
      setRealEstateHoldings(getStoredRealEstate());
    };
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event (for same-window updates)
    window.addEventListener('investmentUpdated', handleStorageChange);
    window.addEventListener('realEstateUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('investmentUpdated', handleStorageChange);
      window.removeEventListener('realEstateUpdated', handleStorageChange);
    };
  }, []);
  
  const portfolioValue = MOCK_DATA.portfolio.value;
  const loansCount = MOCK_DATA.loans.length;
  const policiesCount = MOCK_DATA.policies.length;
  const pensionBalance = MOCK_DATA.pension.balance;
  const alerts = MOCK_DATA.alerts;
  
  // Calculate investment values - recalculated when investments change
  const investmentValue = investments.reduce((sum, inv) => {
    if (inv.type === 'stock') return sum + ((inv.shares || 0) * (inv.currentPrice || inv.avgPrice || 0));
    if (inv.type === 'bond') return sum + (inv.amount || 0);
    if (inv.type === 'crypto') return sum + ((inv.amount || 0) * (inv.currentPrice || inv.avgPrice || 0));
    return sum;
  }, 0);
  
  // Calculate real estate value from holdings
  const realEstateValue = realEstateHoldings.reduce((sum, holding) => {
    const property = REAL_ESTATE_PROPERTIES.find(p => p.id === holding.propertyId);
    if (!property) return sum;
    const holdingValue = (holding.tokens / property.tokensTotal) * property.price;
    return sum + holdingValue;
  }, 0);
  
  const totalPortfolioValue = portfolioValue + investmentValue + realEstateValue;
  
  // Calculate allocation from investments and real estate
  const allocation = investments.reduce((acc, inv) => {
    if (!inv || !inv.type) return acc;
    const val = inv.type === 'stock' ? (inv.shares || 0) * (inv.currentPrice || inv.avgPrice || 0) : 
                inv.type === 'bond' ? (inv.amount || 0) : 
                (inv.amount || 0) * (inv.currentPrice || inv.avgPrice || 0);
    const key = inv.type === 'stock' ? 'stocks' : inv.type === 'bond' ? 'bonds' : 'crypto';
    acc[key] = (acc[key] || 0) + val;
    return acc;
  }, { stocks: 0, bonds: 0, crypto: 0, realEstate: realEstateValue });
  
  // Calculate total allocation value including real estate
  const totalAllocationValue = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  
  let allocationPercent = { stocks: 0, bonds: 0, crypto: 0, realEstate: 0 };
  
  if (totalAllocationValue > 0) {
    allocationPercent.stocks = allocation.stocks / totalAllocationValue;
    allocationPercent.bonds = allocation.bonds / totalAllocationValue;
    allocationPercent.crypto = allocation.crypto / totalAllocationValue;
    allocationPercent.realEstate = allocation.realEstate / totalAllocationValue;
  }
  
  // Build pie chart data with dollar amounts
  const fullPieData = [
    { 
      name: 'Stocks', 
      value: Math.round(allocationPercent.stocks * 100), 
      amount: allocation.stocks || 0,
      color: '#0088FE' 
    },
    { 
      name: 'Bonds', 
      value: Math.round(allocationPercent.bonds * 100), 
      amount: allocation.bonds || 0,
      color: '#00C49F' 
    },
    { 
      name: 'Crypto', 
      value: Math.round(allocationPercent.crypto * 100), 
      amount: allocation.crypto || 0,
      color: '#FF8042' 
    },
    { 
      name: 'Real Estate', 
      value: Math.round((allocationPercent.realEstate || 0) * 100), 
      amount: allocation.realEstate || 0,
      color: '#FFBB28' 
    }
  ].filter(item => item.value > 0);
  
  // Custom label function to show percentage
  const renderLabel = (entry) => {
    return `${entry.value}%`;
  };
  
  // Custom label line style for better alignment
  const labelLine = { stroke: '#888', strokeWidth: 1 };
  
  // Custom tooltip to show dollar amounts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box bg="white" p={3} border="1px solid" borderColor="gray.200" borderRadius="md" boxShadow="lg">
          <Text fontWeight="bold" mb={1}>{data.name}</Text>
          <Text fontSize="sm" color="gray.600">Percentage: {data.value}%</Text>
          <Text fontSize="sm" color="gray.600" fontWeight="bold">Amount: ${data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </Box>
      );
    }
    return null;
  };

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
                  <Pie 
                    data={fullPieData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100} 
                    fill="#8884d8" 
                    dataKey="value" 
                    label={renderLabel}
                    labelLine={labelLine}
                  >
                    {fullPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
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
