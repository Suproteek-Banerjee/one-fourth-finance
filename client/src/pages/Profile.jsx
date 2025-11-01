import React, { useState, useEffect } from 'react';
import { Box, Heading, Card, CardBody, CardHeader, SimpleGrid, Text, Input, Button, VStack, HStack, Badge, Avatar, useToast, Stat, StatLabel, StatNumber, StatHelpText, Progress, Select } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Country list
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Spain',
  'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'India', 'China', 'Japan', 'South Korea', 'Singapore', 'Hong Kong', 'Malaysia', 'Thailand',
  'Indonesia', 'Philippines', 'Vietnam', 'New Zealand', 'Brazil', 'Mexico', 'Argentina', 'Chile',
  'South Africa', 'Kenya', 'Nigeria', 'Ghana', 'Egypt', 'Morocco', 'United Arab Emirates', 'Saudi Arabia',
  'Israel', 'Turkey', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Portugal', 'Greece'
];

const ID_TYPES = [
  'Passport',
  'National ID Card',
  'Driver\'s License',
  'Social Security Card',
  'Tax ID Number',
  'Birth Certificate'
];

// Get investments from localStorage
const getStoredInvestments = () => {
  try {
    const stored = localStorage.getItem('off_investments');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return [];
};

// Get pension from localStorage or use default
const getStoredPension = () => {
  try {
    const stored = localStorage.getItem('off_pension');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return { balance: 5000, monthlyContribution: 200, apy: 0.08 };
};

// Get loans from localStorage or use default
const getStoredLoans = () => {
  try {
    const stored = localStorage.getItem('off_loans');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return { borrower: [], lender: [] };
};

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  
  // Load KYC data from localStorage
  const getStoredKYC = () => {
    try {
      const stored = localStorage.getItem('off_kyc');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return { country: '', idType: '', idNumber: '', status: null };
  };
  
  const [kyc, setKyc] = useState(getStoredKYC());
  const [loading, setLoading] = useState(false);
  
  // Load real data from localStorage
  const [investments, setInvestments] = useState([]);
  const [pension, setPension] = useState(null);
  const [loans, setLoans] = useState({ borrower: [], lender: [] });
  
  useEffect(() => {
    // Load investments
    const storedInvestments = getStoredInvestments();
    setInvestments(storedInvestments);
    
    // Load pension
    const storedPension = getStoredPension();
    setPension(storedPension);
    
    // Load loans
    const storedLoans = getStoredLoans();
    setLoans(storedLoans);
    
    // Listen for changes
    const handleStorageChange = () => {
      setInvestments(getStoredInvestments());
      setPension(getStoredPension());
      setLoans(getStoredLoans());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('investmentUpdated', handleStorageChange);
    window.addEventListener('pensionUpdated', handleStorageChange);
    window.addEventListener('loansUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('investmentUpdated', handleStorageChange);
      window.removeEventListener('pensionUpdated', handleStorageChange);
      window.removeEventListener('loansUpdated', handleStorageChange);
    };
  }, []);

  function submitKYC() {
    if (!kyc.country || !kyc.idType || !kyc.idNumber) {
      toast({ title: 'Please fill all fields', status: 'warning' });
      return;
    }
    setLoading(true);
    
    // Simulate KYC submission
    setTimeout(() => {
      const kycData = {
        ...kyc,
        status: 'pending',
        submittedAt: Date.now()
      };
      localStorage.setItem('off_kyc', JSON.stringify(kycData));
      setKyc(kycData);
      toast({ 
        title: 'KYC Submitted Successfully!', 
        status: 'success', 
        description: 'Your KYC is under review. You will be notified once verified.' 
      });
      setLoading(false);
    }, 500);
  }

  // Stock and crypto prices (matching Investments page)
  const stockPrices = { AAPL: 175, MSFT: 380, GOOGL: 140, AMZN: 145, TSLA: 250, NVDA: 480, META: 320, NFLX: 450, JPM: 150, BAC: 35 };
  const cryptoPrices = { BTC: 45000, ETH: 2500, SOL: 100, ADA: 0.55, MATIC: 0.85, DOT: 7.2 };
  
  // Calculate investment values with current prices
  const investmentsWithPrices = investments.map(inv => {
    if (inv.type === 'stock') {
      return { ...inv, currentPrice: stockPrices[inv.symbol] || inv.currentPrice || inv.avgPrice };
    } else if (inv.type === 'crypto') {
      return { ...inv, currentPrice: cryptoPrices[inv.symbol] || inv.currentPrice || inv.avgPrice };
    }
    return inv;
  });
  
  const investmentValue = investmentsWithPrices.reduce((sum, inv) => {
    if (inv.type === 'stock') return sum + (inv.shares * inv.currentPrice);
    if (inv.type === 'bond') return sum + inv.amount;
    if (inv.type === 'crypto') return sum + (inv.amount * inv.currentPrice);
    return sum;
  }, 0);
  
  const pensionBalance = pension?.balance || 0;
  const totalDebt = loans.borrower.reduce((sum, loan) => sum + (loan.amount - (loan.funded || 0)), 0);
  const totalInvested = investmentValue + pensionBalance;

  // Generate realistic account performance data based on actual investments
  // Simulate 30 days of realistic market movements
  function generatePerformanceData(baseValue) {
    const days = [];
    let currentValue = baseValue || 10000;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29); // Start 30 days ago
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Add realistic volatility: -2% to +2% daily change
      const dailyChange = (Math.random() - 0.5) * 0.04; // Random between -2% and +2%
      currentValue = currentValue * (1 + dailyChange);
      
      days.push({
        day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(currentValue)
      });
    }
    
    return days;
  }

  // Generate portfolio growth data based on actual investments
  function generatePortfolioGrowthData(invWithPrices) {
    if (!invWithPrices || invWithPrices.length === 0) {
      return [];
    }
    
    // Get earliest investment timestamp
    const timestamps = invWithPrices.map(inv => inv.ts || Date.now()).filter(ts => ts);
    if (timestamps.length === 0) {
      return [];
    }
    
    const earliestTs = Math.min(...timestamps);
    const startDate = new Date(earliestTs);
    const months = [];
    const today = new Date();
    
    // Calculate months from first investment to now (max 12 months)
    const monthDiff = Math.min(12, Math.max(1, Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 30))));
    
    let currentValue = 0;
    
    for (let i = 0; i <= monthDiff; i++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(monthDate.getMonth() + i);
      
      // Calculate value at this point in time
      let monthValue = 0;
      
      // Only count investments made before or during this month
      invWithPrices.forEach(inv => {
        const invDate = new Date(inv.ts || Date.now());
        if (invDate <= monthDate) {
          // Calculate approximate value (simplified - could be more sophisticated)
          if (inv.type === 'stock') {
            const priceChange = (Math.random() - 0.4) * 0.1; // -4% to +6% per month
            monthValue += inv.shares * (inv.avgPrice * (1 + priceChange * i / monthDiff));
          } else if (inv.type === 'bond') {
            monthValue += inv.amount * (1 + (inv.yield || 0.04) * i / 12);
          } else if (inv.type === 'crypto') {
            const priceChange = (Math.random() - 0.3) * 0.15; // -3% to +12% per month
            monthValue += inv.amount * (inv.avgPrice * (1 + priceChange * i / monthDiff));
          }
        }
      });
      
      months.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: Math.round(monthValue || currentValue)
      });
      
      if (monthValue > 0) currentValue = monthValue;
    }
    
    return months;
  }

  const performanceData = generatePerformanceData(investmentValue + pensionBalance);
  const portfolioGrowthData = generatePortfolioGrowthData(investmentsWithPrices);

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
              {kyc.status && (
                <Box p={3} bg={kyc.status === 'approved' ? 'green.50' : kyc.status === 'rejected' ? 'red.50' : 'yellow.50'} borderRadius="md" borderLeft="4px solid" borderColor={kyc.status === 'approved' ? 'green.500' : kyc.status === 'rejected' ? 'red.500' : 'yellow.500'}>
                  <Text fontWeight="bold" color={kyc.status === 'approved' ? 'green.700' : kyc.status === 'rejected' ? 'red.700' : 'yellow.700'}>
                    Status: {kyc.status === 'approved' ? '✓ Approved' : kyc.status === 'rejected' ? '✗ Rejected' : '⏳ Under Review'}
                  </Text>
                </Box>
              )}
              <Box>
                <Text mb={2} fontWeight="medium">Country</Text>
                <Select 
                  placeholder="Select your country" 
                  value={kyc.country} 
                  onChange={e => setKyc({ ...kyc, country: e.target.value })}
                  isDisabled={kyc.status === 'approved'}
                >
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </Select>
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">ID Type</Text>
                <Select 
                  placeholder="Select ID type" 
                  value={kyc.idType} 
                  onChange={e => setKyc({ ...kyc, idType: e.target.value })}
                  isDisabled={kyc.status === 'approved'}
                >
                  {ID_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">ID Number</Text>
                <Input 
                  placeholder="Enter your ID number" 
                  value={kyc.idNumber} 
                  onChange={e => setKyc({ ...kyc, idNumber: e.target.value })}
                  isDisabled={kyc.status === 'approved'}
                />
              </Box>
              {kyc.status !== 'approved' && (
                <Button onClick={submitKYC} isLoading={loading} colorScheme="blue" w="full">
                  {kyc.status === 'pending' ? 'Update KYC' : 'Submit KYC'}
                </Button>
              )}
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
              <StatNumber fontSize="3xl">${investmentValue.toLocaleString()}</StatNumber>
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

      <SimpleGrid columns={[1, 2]} gap={6} mb={8}>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.3)">
          <CardHeader>
            <Heading size="md">Account Performance (30 Days)</Heading>
          </CardHeader>
          <CardBody>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3182CE" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3182CE" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#718096" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#718096" 
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E2E8F0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3182CE" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorPerformance)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Box textAlign="center" py={12}>
                <Text color="gray.500">No data available. Start investing to see your performance!</Text>
              </Box>
            )}
          </CardBody>
        </Card>

        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.3)">
          <CardHeader>
            <Heading size="md">Portfolio Growth</Heading>
          </CardHeader>
          <CardBody>
            {portfolioGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={portfolioGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#718096" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#718096" 
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E2E8F0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3182CE" 
                    strokeWidth={3}
                    dot={{ fill: '#3182CE', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Portfolio Value"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box textAlign="center" py={12}>
                <Text color="gray.500">No investment history. Make your first investment to track growth!</Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
