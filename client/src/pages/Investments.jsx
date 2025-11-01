import React, { useEffect, useState } from 'react';
import { Box, Heading, Card, CardBody, CardHeader, SimpleGrid, Text, Input, Button, Select, VStack, HStack, Badge, Table, Thead, Tbody, Tr, Th, Td, Stat, StatLabel, StatNumber, StatHelpText, useToast, Icon, Tabs, TabList, TabPanels, Tab, TabPanel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';

// Mock data - no API calls
const MOCK_OPTIONS = {
  stocks: [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175, change24h: 2.5 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 380, change24h: 1.8 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140, change24h: -0.5 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145, change24h: 3.2 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 250, change24h: 5.1 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 480, change24h: 8.3 },
    { symbol: 'META', name: 'Meta Platforms', price: 320, change24h: 4.7 },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: 450, change24h: -2.1 },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 150, change24h: 1.2 },
    { symbol: 'BAC', name: 'Bank of America', price: 35, change24h: 0.8 }
  ],
  bonds: [
    { symbol: 'US10Y', name: 'US 10-Year Treasury', yield: 0.045, maturity: '10Y', risk: 'low' },
    { symbol: 'US30Y', name: 'US 30-Year Treasury', yield: 0.05, maturity: '30Y', risk: 'low' },
    { symbol: 'CORPORATE', name: 'Corporate Bond Fund', yield: 0.07, maturity: '5Y', risk: 'medium' },
    { symbol: 'MUNI', name: 'Municipal Bond Fund', yield: 0.04, maturity: '10Y', risk: 'low' }
  ],
  crypto: [
    { symbol: 'BTC', name: 'Bitcoin', price: 45000, change24h: 2.3 },
    { symbol: 'ETH', name: 'Ethereum', price: 2500, change24h: -1.5 },
    { symbol: 'SOL', name: 'Solana', price: 100, change24h: 5.8 },
    { symbol: 'ADA', name: 'Cardano', price: 0.55, change24h: -0.2 },
    { symbol: 'MATIC', name: 'Polygon', price: 0.85, change24h: 3.1 },
    { symbol: 'DOT', name: 'Polkadot', price: 7.2, change24h: 4.2 }
  ]
};

const getStoredInvestments = () => {
  try {
    const stored = localStorage.getItem('off_investments');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return [
    { id: '1', type: 'stock', symbol: 'AAPL', shares: 5, avgPrice: 150, currentPrice: 175, ts: Date.now() - 86400000 },
    { id: '2', type: 'stock', symbol: 'MSFT', shares: 3, avgPrice: 300, currentPrice: 380, ts: Date.now() - 86400000 },
    { id: '3', type: 'bond', symbol: 'US10Y', amount: 5000, yield: 0.045, ts: Date.now() - 172800000 },
    { id: '4', type: 'crypto', symbol: 'BTC', amount: 0.05, avgPrice: 45000, currentPrice: 45000, ts: Date.now() - 259200000 }
  ];
};

const saveInvestments = (investments) => {
  localStorage.setItem('off_investments', JSON.stringify(investments));
  // Dispatch custom event to notify Dashboard
  window.dispatchEvent(new Event('investmentUpdated'));
};

export default function Investments() {
  const toast = useToast();
  const [options] = useState(MOCK_OPTIONS);
  const [investments, setInvestments] = useState(getStoredInvestments());
  const [selectedType, setSelectedType] = useState('stock');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [sellId, setSellId] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  function buy() {
    if (!selectedSymbol || !amount) {
      toast({ title: 'Please select an asset and enter amount/shares', status: 'warning' });
      return;
    }
    
    // Handle crypto separately since it's singular, not plural
    const optionKey = selectedType === 'crypto' ? 'crypto' : selectedType + 's';
    const option = options[optionKey]?.find(opt => opt.symbol === selectedSymbol);
    if (!option) {
      toast({ title: 'Invalid selection', status: 'error' });
      return;
    }

    const newInvestment = {
      id: Date.now().toString(),
      type: selectedType,
      symbol: selectedSymbol,
      ts: Date.now()
    };

    let updatedInvestments;
    if (selectedType === 'stock') {
      // For stocks: amount is in dollars, calculate number of shares
      const dollarAmount = Number(amount);
      const shares = dollarAmount / option.price;
      newInvestment.shares = shares;
      newInvestment.avgPrice = option.price;
      newInvestment.currentPrice = option.price;
      updatedInvestments = [...investments, newInvestment];
      setInvestments(updatedInvestments);
      saveInvestments(updatedInvestments);
      toast({ 
        title: 'Purchase successful!', 
        status: 'success', 
        description: `Bought ${shares.toFixed(4)} shares for $${dollarAmount.toFixed(2)}` 
      });
    } else if (selectedType === 'bond') {
      newInvestment.amount = Number(amount);
      newInvestment.yield = option.yield;
      updatedInvestments = [...investments, newInvestment];
      setInvestments(updatedInvestments);
      saveInvestments(updatedInvestments);
      toast({ title: 'Purchase successful!', status: 'success', description: `Bought $${amount} in bonds` });
    } else {
      // For crypto: amount is in dollars, calculate crypto amount
      const dollarAmount = Number(amount);
      const cryptoAmount = dollarAmount / option.price;
      newInvestment.amount = cryptoAmount;
      newInvestment.avgPrice = option.price;
      newInvestment.currentPrice = option.price;
      updatedInvestments = [...investments, newInvestment];
      setInvestments(updatedInvestments);
      saveInvestments(updatedInvestments);
      toast({ 
        title: 'Purchase successful!', 
        status: 'success', 
        description: `Bought ${cryptoAmount.toFixed(6)} ${selectedSymbol} for $${dollarAmount.toFixed(2)}` 
      });
    }

    setAmount('');
    setSelectedSymbol('');
  }

  function sell() {
    if (!sellAmount || !sellId) {
      toast({ title: 'Please enter dollar amount to sell', status: 'warning' });
      return;
    }
    
    const investment = investments.find(inv => inv.id === sellId);
    if (!investment) {
      toast({ title: 'Investment not found', status: 'error' });
      return;
    }

    // Get current price
    let currentPrice;
    if (investment.type === 'stock') {
      const option = options.stocks.find(o => o.symbol === investment.symbol);
      currentPrice = option?.price || investment.currentPrice || investment.avgPrice;
    } else if (investment.type === 'crypto') {
      const option = options.crypto.find(o => o.symbol === investment.symbol);
      currentPrice = option?.price || investment.currentPrice || investment.avgPrice;
    } else {
      // For bonds, amount is already in dollars
      currentPrice = 1;
    }

    // sellAmount is in dollars, calculate how many shares/amount to sell
    const dollarAmount = Number(sellAmount);
    
    let updatedInvestments;
    if (investment.type === 'stock') {
      const sharesToSell = dollarAmount / currentPrice;
      const maxValue = investment.shares * currentPrice;
      
      if (dollarAmount > maxValue) {
        toast({ title: 'Not enough funds', status: 'error', description: `You only have $${maxValue.toFixed(2)} worth (${investment.shares.toFixed(4)} shares)` });
        return;
      }
      
      if (sharesToSell >= investment.shares) {
        // Sell everything
        updatedInvestments = investments.filter(inv => inv.id !== sellId);
      } else {
        updatedInvestments = investments.map(inv => 
          inv.id === sellId ? { ...inv, shares: inv.shares - sharesToSell } : inv
        );
      }
      toast({ title: 'Sale successful!', status: 'success', description: `Sold ${sharesToSell.toFixed(4)} shares for $${dollarAmount.toFixed(2)}` });
    } else if (investment.type === 'bond') {
      // For bonds, sellAmount is already in dollars
      if (dollarAmount > investment.amount) {
        toast({ title: 'Not enough funds', status: 'error', description: `You only have $${investment.amount.toFixed(2)}` });
        return;
      }
      if (dollarAmount >= investment.amount) {
        updatedInvestments = investments.filter(inv => inv.id !== sellId);
      } else {
        updatedInvestments = investments.map(inv => 
          inv.id === sellId ? { ...inv, amount: inv.amount - dollarAmount } : inv
        );
      }
      toast({ title: 'Sale successful!', status: 'success', description: `Sold $${dollarAmount.toFixed(2)} worth of bonds` });
    } else {
      // Crypto: sellAmount is in dollars, calculate crypto amount
      const cryptoToSell = dollarAmount / currentPrice;
      const maxValue = investment.amount * currentPrice;
      
      if (dollarAmount > maxValue) {
        toast({ title: 'Not enough funds', status: 'error', description: `You only have $${maxValue.toFixed(2)} worth (${investment.amount.toFixed(6)} ${investment.symbol})` });
        return;
      }
      
      if (cryptoToSell >= investment.amount) {
        updatedInvestments = investments.filter(inv => inv.id !== sellId);
      } else {
        updatedInvestments = investments.map(inv => 
          inv.id === sellId ? { ...inv, amount: inv.amount - cryptoToSell } : inv
        );
      }
      toast({ title: 'Sale successful!', status: 'success', description: `Sold ${cryptoToSell.toFixed(6)} ${investment.symbol} for $${dollarAmount.toFixed(2)}` });
    }

    setInvestments(updatedInvestments);
    saveInvestments(updatedInvestments);
    onClose();
    setSellAmount('');
    setSellId(null);
  }

  function openSellModal(inv) {
    setSellId(inv.id);
    setSelectedType(inv.type);
    onOpen();
  }

  const totalValue = investments.reduce((sum, inv) => {
    if (inv.type === 'stock') return sum + (inv.shares * inv.currentPrice);
    if (inv.type === 'bond') return sum + inv.amount;
    if (inv.type === 'crypto') return sum + (inv.amount * inv.currentPrice);
    return sum;
  }, 0);

  const totalCost = investments.reduce((sum, inv) => {
    if (inv.type === 'stock') return sum + (inv.shares * inv.avgPrice);
    if (inv.type === 'bond') return sum + inv.amount;
    if (inv.type === 'crypto') return sum + (inv.amount * inv.avgPrice);
    return sum;
  }, 0);

  const totalGain = totalValue - totalCost;

  const portfolioData = investments.reduce((acc, inv) => {
    const val = inv.type === 'stock' ? inv.shares * inv.currentPrice : inv.type === 'bond' ? inv.amount : inv.amount * inv.currentPrice;
    acc[inv.type] = (acc[inv.type] || 0) + val;
    return acc;
  }, {});

  const chartData = Object.entries(portfolioData).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: val,
    color: key === 'stock' ? '#0088FE' : key === 'bond' ? '#00C49F' : '#FFBB28'
  }));

  return (
    <Box p={6}>
      <Heading mb={2} bgGradient="linear(to-r, blue.600, green.600)" bgClip="text">Investments</Heading>
      <Text color="gray.600" mb={6}>Buy and sell stocks, bonds, and cryptocurrencies</Text>

      <SimpleGrid columns={[1, 3]} gap={6} mb={8}>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Portfolio Value</StatLabel>
              <StatNumber fontSize="2xl" color="blue.600">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatNumber>
              <StatHelpText color="gray.600">Current worth</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Total Gain/Loss</StatLabel>
              <StatNumber fontSize="2xl" color={totalGain >= 0 ? 'green.500' : 'red.500'}>
                ${totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </StatNumber>
              <StatHelpText color="gray.600">Unrealized P&L</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Return %</StatLabel>
              <StatNumber fontSize="2xl" color={totalGain >= 0 ? 'green.500' : 'red.500'}>
                {totalCost > 0 ? ((totalGain / totalCost) * 100).toFixed(2) : '0.00'}%
              </StatNumber>
              <StatHelpText color="gray.600">Performance</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {chartData.length > 0 && (
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)" mb={8}>
          <CardHeader>
            <Heading size="md" color="gray.700">Portfolio Allocation</Heading>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      <Tabs mb={8}>
        <TabList>
          <Tab onClick={() => setSelectedType('stock')}>Stocks</Tab>
          <Tab onClick={() => setSelectedType('bond')}>Bonds</Tab>
          <Tab onClick={() => setSelectedType('crypto')}>Crypto</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <SimpleGrid columns={[1, 2]} gap={6}>
              <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
                <CardHeader bgGradient="linear(to-r, blue.500, cyan.500)" color="white" borderRadius="lg">
                  <Heading size="md">Available Stocks</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)} placeholder="Select stock">
                      {options.stocks.map(opt => (
                        <option key={opt.symbol} value={opt.symbol}>
                          {opt.name} ({opt.symbol}) - ${opt.price} {opt.change24h >= 0 ? '+' : ''}{opt.change24h}%
                        </option>
                      ))}
                    </Select>
                    <Input type="number" placeholder="Amount in USD ($)" value={amount} onChange={e => setAmount(e.target.value)} />
                    {selectedSymbol && amount && (() => {
                      const option = options.stocks.find(o => o.symbol === selectedSymbol);
                      if (!option) return null;
                      const shares = Number(amount) / option.price;
                      return (
                        <Text fontSize="sm" color="gray.600">
                          You will receive: {shares.toFixed(4)} shares
                        </Text>
                      );
                    })()}
                    <Button onClick={buy} colorScheme="blue" leftIcon={<Icon as={ArrowUpIcon} />}>
                      Buy Stock
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
                <CardHeader bgGradient="linear(to-r, green.500, teal.500)" color="white" borderRadius="lg">
                  <Heading size="md">My Stock Holdings</Heading>
                </CardHeader>
                <CardBody>
                  {investments.filter(inv => inv.type === 'stock').length > 0 ? (
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Symbol</Th>
                          <Th>Shares</Th>
                          <Th>Avg Price</Th>
                          <Th>Current</Th>
                          <Th>Value</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {investments.filter(inv => inv.type === 'stock').map(inv => {
                          const option = options.stocks.find(o => o.symbol === inv.symbol);
                          const currentPrice = option?.price || inv.currentPrice;
                          const value = inv.shares * currentPrice;
                          const gain = value - (inv.shares * inv.avgPrice);
                          return (
                            <Tr key={inv.id}>
                              <Td fontWeight="bold">{inv.symbol}</Td>
                              <Td>{inv.shares}</Td>
                              <Td>${inv.avgPrice.toFixed(2)}</Td>
                              <Td>${currentPrice.toFixed(2)}</Td>
                              <Td color={gain >= 0 ? 'green.500' : 'red.500'}>${value.toFixed(2)}</Td>
                              <Td><Button size="sm" onClick={() => openSellModal(inv)} colorScheme="red">Sell</Button></Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text color="gray.500" textAlign="center" py={8}>No stock holdings</Text>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          <TabPanel>
            <SimpleGrid columns={[1, 2]} gap={6}>
              <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
                <CardHeader bgGradient="linear(to-r, purple.500, pink.500)" color="white" borderRadius="lg">
                  <Heading size="md">Available Bonds</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)} placeholder="Select bond">
                      {options.bonds.map(opt => (
                        <option key={opt.symbol} value={opt.symbol}>
                          {opt.name} - {(opt.yield * 100).toFixed(2)}% yield
                        </option>
                      ))}
                    </Select>
                    <Input type="number" placeholder="Amount ($)" value={amount} onChange={e => setAmount(e.target.value)} />
                    <Button onClick={buy} colorScheme="purple" leftIcon={<Icon as={ArrowUpIcon} />}>
                      Buy Bond
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
                <CardHeader bgGradient="linear(to-r, green.500, teal.500)" color="white" borderRadius="lg">
                  <Heading size="md">My Bond Holdings</Heading>
                </CardHeader>
                <CardBody>
                  {investments.filter(inv => inv.type === 'bond').length > 0 ? (
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Symbol</Th>
                          <Th>Amount</Th>
                          <Th>Yield</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {investments.filter(inv => inv.type === 'bond').map(inv => (
                          <Tr key={inv.id}>
                            <Td fontWeight="bold">{inv.symbol}</Td>
                            <Td>${inv.amount.toLocaleString()}</Td>
                            <Td>{(inv.yield * 100).toFixed(2)}%</Td>
                            <Td><Button size="sm" onClick={() => openSellModal(inv)} colorScheme="red">Sell</Button></Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text color="gray.500" textAlign="center" py={8}>No bond holdings</Text>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          <TabPanel>
            <SimpleGrid columns={[1, 2]} gap={6}>
              <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
                <CardHeader bgGradient="linear(to-r, yellow.500, orange.500)" color="white" borderRadius="lg">
                  <Heading size="md">Available Crypto</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)} placeholder="Select crypto">
                      {options.crypto.map(opt => (
                        <option key={opt.symbol} value={opt.symbol}>
                          {opt.name} ({opt.symbol}) - ${opt.price.toLocaleString()} {opt.change24h >= 0 ? '+' : ''}{opt.change24h}%
                        </option>
                      ))}
                    </Select>
                    <Input type="number" placeholder="Amount in USD ($)" value={amount} onChange={e => setAmount(e.target.value)} />
                    {selectedSymbol && amount && (() => {
                      const option = options.crypto.find(o => o.symbol === selectedSymbol);
                      if (!option) return null;
                      const cryptoAmount = Number(amount) / option.price;
                      return (
                        <Text fontSize="sm" color="gray.600">
                          You will receive: {cryptoAmount.toFixed(6)} {selectedSymbol}
                        </Text>
                      );
                    })()}
                    <Button onClick={buy} colorScheme="orange" leftIcon={<Icon as={ArrowUpIcon} />}>
                      Buy Crypto
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
                <CardHeader bgGradient="linear(to-r, green.500, teal.500)" color="white" borderRadius="lg">
                  <Heading size="md">My Crypto Holdings</Heading>
                </CardHeader>
                <CardBody>
                  {investments.filter(inv => inv.type === 'crypto').length > 0 ? (
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Symbol</Th>
                          <Th>Amount</Th>
                          <Th>Avg Price</Th>
                          <Th>Current</Th>
                          <Th>Value</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {investments.filter(inv => inv.type === 'crypto').map(inv => {
                          const option = options.crypto.find(o => o.symbol === inv.symbol);
                          const currentPrice = option?.price || inv.currentPrice;
                          const value = inv.amount * currentPrice;
                          const cost = inv.amount * inv.avgPrice;
                          const gain = value - cost;
                          return (
                            <Tr key={inv.id}>
                              <Td fontWeight="bold">{inv.symbol}</Td>
                              <Td>{inv.amount.toFixed(6)}</Td>
                              <Td>${inv.avgPrice.toLocaleString()}</Td>
                              <Td>${currentPrice.toLocaleString()}</Td>
                              <Td color={gain >= 0 ? 'green.500' : 'red.500'}>${value.toFixed(2)}</Td>
                              <Td><Button size="sm" onClick={() => openSellModal(inv)} colorScheme="red">Sell</Button></Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text color="gray.500" textAlign="center" py={8}>No crypto holdings</Text>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sell {selectedType === 'stock' ? 'Stock' : selectedType === 'bond' ? 'Bond' : 'Crypto'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              {(() => {
                const investment = investments.find(inv => inv.id === sellId);
                if (!investment) return null;
                
                let currentPrice, maxValue, unit;
                if (investment.type === 'stock') {
                  const option = options.stocks.find(o => o.symbol === investment.symbol);
                  currentPrice = option?.price || investment.currentPrice || investment.avgPrice;
                  maxValue = investment.shares * currentPrice;
                  unit = 'shares';
                } else if (investment.type === 'crypto') {
                  const option = options.crypto.find(o => o.symbol === investment.symbol);
                  currentPrice = option?.price || investment.currentPrice || investment.avgPrice;
                  maxValue = investment.amount * currentPrice;
                  unit = investment.symbol;
                } else {
                  currentPrice = 1;
                  maxValue = investment.amount;
                  unit = 'dollars';
                }
                
                const amountToSell = sellAmount ? (investment.type === 'stock' ? Number(sellAmount) / currentPrice : investment.type === 'crypto' ? Number(sellAmount) / currentPrice : Number(sellAmount)) : 0;
                
                return (
                  <>
                    <Box>
                      <Text mb={2} fontWeight="medium">Available to sell:</Text>
                      <Text fontSize="sm" color="gray.600">
                        {investment.type === 'stock' && `${investment.shares.toFixed(4)} shares ($${maxValue.toFixed(2)})`}
                        {investment.type === 'crypto' && `${investment.amount.toFixed(6)} ${investment.symbol} ($${maxValue.toFixed(2)})`}
                        {investment.type === 'bond' && `$${investment.amount.toFixed(2)}`}
                      </Text>
                    </Box>
                    <Input 
                      type="number" 
                      placeholder="Amount in USD ($)" 
                      value={sellAmount} 
                      onChange={e => setSellAmount(e.target.value)} 
                    />
                    {sellAmount && amountToSell > 0 && (
                      <Text fontSize="sm" color="gray.600">
                        You will sell: {
                          investment.type === 'stock' ? `${amountToSell.toFixed(4)} shares` :
                          investment.type === 'crypto' ? `${amountToSell.toFixed(6)} ${investment.symbol}` :
                          `$${amountToSell.toFixed(2)}`
                        }
                      </Text>
                    )}
                  </>
                );
              })()}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" onClick={sell}>Sell</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
