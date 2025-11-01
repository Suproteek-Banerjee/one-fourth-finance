import React, { useEffect, useState } from 'react';
import { Box, Heading, Card, CardBody, CardHeader, SimpleGrid, Text, Input, Button, Select, VStack, HStack, Badge, Table, Thead, Tbody, Tr, Th, Td, Stat, StatLabel, StatNumber, StatHelpText, useToast, Icon, Tabs, TabList, TabPanels, Tab, TabPanel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';

export default function Investments() {
  const { API_URL, token, loading: authLoading } = useAuth();
  const toast = useToast();
  const [options, setOptions] = useState({ stocks: [], bonds: [], crypto: [] });
  const [investments, setInvestments] = useState([]);
  const [selectedType, setSelectedType] = useState('stock');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [sellId, setSellId] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  async function load() {
    if (!token) return;
    try {
      const opts = await fetch(`${API_URL}/investments/options`);
      if (opts.ok) {
        setOptions(await opts.json());
      }
      
      const invs = await fetch(`${API_URL}/investments`, { headers: { Authorization: `Bearer ${token}` } });
      if (invs.ok) {
        const data = await invs.json();
        setInvestments(data.investments || []);
      }
    } catch (err) {
      console.error('Failed to load investments:', err);
    }
  }

  async function buy() {
    if (!selectedSymbol || !amount) {
      toast({ title: 'Please select an asset and enter amount/shares', status: 'warning' });
      return;
    }
    
    setLoading(true);
    try {
      const body = selectedType === 'stock' 
        ? { type: selectedType, symbol: selectedSymbol, shares: Number(amount) }
        : selectedType === 'bond'
        ? { type: selectedType, symbol: selectedSymbol, amount: Number(amount) }
        : { type: selectedType, symbol: selectedSymbol, amount: Number(amount) };
      
      const res = await fetch(`${API_URL}/investments/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) throw new Error('Purchase failed');
      
      toast({ title: 'Purchase successful!', status: 'success' });
      await load();
      setAmount('');
      setSelectedSymbol('');
    } catch (err) {
      toast({ title: 'Purchase failed', status: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function sell() {
    if (!sellAmount) {
      toast({ title: 'Please enter amount/shares to sell', status: 'warning' });
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/investments/sell/${sellId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(selectedType === 'stock' ? { shares: Number(sellAmount) } : { amount: Number(sellAmount) })
      });
      
      if (!res.ok) throw new Error('Sale failed');
      
      toast({ title: 'Sale successful!', status: 'success' });
      await load();
      onClose();
      setSellAmount('');
      setSellId(null);
    } catch (err) {
      toast({ title: 'Sale failed', status: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function openSellModal(inv) {
    setSellId(inv.id);
    setSelectedType(inv.type);
    onOpen();
  }

  useEffect(() => {
    if (!authLoading && token) {
      load();
    }
  }, [API_URL, token, authLoading]);

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
                {((totalGain / totalCost) * 100).toFixed(2)}%
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
                    <Input type="number" placeholder="Number of shares" value={amount} onChange={e => setAmount(e.target.value)} />
                    <Button onClick={buy} isLoading={loading} colorScheme="blue" leftIcon={<Icon as={ArrowUpIcon} />}>
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
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Symbol</Th>
                          <Th>Shares</Th>
                          <Th>Avg Price</Th>
                          <Th>Current</Th>
                          <Th>Gain</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {investments.filter(inv => inv.type === 'stock').map(inv => {
                          const gain = (inv.currentPrice - inv.avgPrice) * inv.shares;
                          const gainPct = ((inv.currentPrice - inv.avgPrice) / inv.avgPrice * 100);
                          return (
                            <Tr key={inv.id}>
                              <Td><Badge fontSize="md">{inv.symbol}</Badge></Td>
                              <Td>{inv.shares}</Td>
                              <Td>${inv.avgPrice}</Td>
                              <Td>${inv.currentPrice}</Td>
                              <Td color={gain >= 0 ? 'green.500' : 'red.500'}>
                                ${gain.toFixed(2)} ({gainPct.toFixed(2)}%)
                              </Td>
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
                    <Button onClick={buy} isLoading={loading} colorScheme="purple" leftIcon={<Icon as={ArrowUpIcon} />}>
                      Buy Bond
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
                <CardHeader bgGradient="linear(to-r, orange.500, red.500)" color="white" borderRadius="lg">
                  <Heading size="md">My Bond Holdings</Heading>
                </CardHeader>
                <CardBody>
                  {investments.filter(inv => inv.type === 'bond').length > 0 ? (
                    <Table variant="simple" size="sm">
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
                            <Td><Badge fontSize="md">{inv.symbol}</Badge></Td>
                            <Td>${inv.amount}</Td>
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
                    <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
                    <Button onClick={buy} isLoading={loading} colorScheme="orange" leftIcon={<Icon as={ArrowUpIcon} />}>
                      Buy Crypto
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
                <CardHeader bgGradient="linear(to-r, teal.500, cyan.500)" color="white" borderRadius="lg">
                  <Heading size="md">My Crypto Holdings</Heading>
                </CardHeader>
                <CardBody>
                  {investments.filter(inv => inv.type === 'crypto').length > 0 ? (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Symbol</Th>
                          <Th>Amount</Th>
                          <Th>Avg Price</Th>
                          <Th>Current</Th>
                          <Th>Gain</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {investments.filter(inv => inv.type === 'crypto').map(inv => {
                          const gain = (inv.currentPrice - inv.avgPrice) * inv.amount;
                          const gainPct = ((inv.currentPrice - inv.avgPrice) / inv.avgPrice * 100);
                          return (
                            <Tr key={inv.id}>
                              <Td><Badge fontSize="md">{inv.symbol}</Badge></Td>
                              <Td>{inv.amount}</Td>
                              <Td>${inv.avgPrice}</Td>
                              <Td>${inv.currentPrice}</Td>
                              <Td color={gain >= 0 ? 'green.500' : 'red.500'}>
                                ${gain.toFixed(2)} ({gainPct.toFixed(2)}%)
                              </Td>
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
          <ModalHeader>Sell {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text>{selectedType === 'stock' ? 'Number of shares to sell:' : 'Amount to sell:'}</Text>
              <Input 
                type="number" 
                placeholder={selectedType === 'stock' ? 'Shares' : 'Amount'} 
                value={sellAmount} 
                onChange={e => setSellAmount(e.target.value)} 
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>Cancel</Button>
            <Button onClick={sell} isLoading={loading} colorScheme="red">Sell</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

