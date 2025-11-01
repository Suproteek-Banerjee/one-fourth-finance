import React, { useState, useEffect } from 'react';
import { Box, Button, Heading, Input, Text, Card, CardBody, CardHeader, SimpleGrid, VStack, HStack, Badge, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Mock data - no API calls
const MOCK_PROPERTIES = [
  { id: '1', title: 'Nairobi Apartments', price: 250000, roi: 0.11, tokensTotal: 100000, tokensAvailable: 75000 },
  { id: '2', title: 'Lagos Co-working', price: 450000, roi: 0.13, tokensTotal: 150000, tokensAvailable: 120000 },
  { id: '3', title: 'Bangalore Retail', price: 600000, roi: 0.09, tokensTotal: 200000, tokensAvailable: 180000 },
  { id: '4', title: 'Cape Town Residences', price: 350000, roi: 0.12, tokensTotal: 125000, tokensAvailable: 95000 },
  { id: '5', title: 'Mumbai Office Complex', price: 750000, roi: 0.10, tokensTotal: 250000, tokensAvailable: 220000 },
  { id: '6', title: 'Dubai Luxury Condos', price: 850000, roi: 0.14, tokensTotal: 280000, tokensAvailable: 250000 }
];

// Get real estate holdings from localStorage
const getStoredRealEstate = () => {
  try {
    const stored = localStorage.getItem('off_realestate');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Map property IDs back to full property objects
      return parsed.map(holding => ({
        ...holding,
        property: MOCK_PROPERTIES.find(p => p.id === holding.propertyId)
      }));
    }
  } catch (e) {}
  return [];
};

export default function RealEstate() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [properties, setProperties] = useState(MOCK_PROPERTIES);
  const [holdings, setHoldings] = useState(getStoredRealEstate());
  const [selected, setSelected] = useState('');
  const [tokens, setTokens] = useState(100);
  const [sellHoldingId, setSellHoldingId] = useState(null);
  const [sellAmount, setSellAmount] = useState('');

  // Load holdings from localStorage on mount and listen for changes
  useEffect(() => {
    const handleStorageChange = () => {
      setHoldings(getStoredRealEstate());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('realEstateUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('realEstateUpdated', handleStorageChange);
    };
  }, []);

  function purchase() {
    if (!selected || !tokens || tokens <= 0) {
      toast({ title: 'Please select a property and enter token amount', status: 'warning' });
      return;
    }

    const property = properties.find(p => p.id === selected);
    if (!property) {
      toast({ title: 'Property not found', status: 'error' });
      return;
    }

    if (tokens > property.tokensAvailable) {
      toast({ title: 'Not enough tokens available', status: 'error' });
      return;
    }

    // Update property tokens
    setProperties(properties.map(p => 
      p.id === selected ? { ...p, tokensAvailable: p.tokensAvailable - tokens } : p
    ));

    // Add to holdings
    let updatedHoldings;
    const existingHolding = holdings.find(h => h.propertyId === selected);
    if (existingHolding) {
      updatedHoldings = holdings.map(h => 
        h.propertyId === selected ? { ...h, tokens: h.tokens + tokens } : h
      );
    } else {
      updatedHoldings = [...holdings, {
        id: Date.now().toString(),
        propertyId: selected,
        tokens: Number(tokens),
        ts: Date.now()
      }];
    }

    setHoldings(updatedHoldings);
    
    // Save to localStorage (without circular reference to property object)
    const holdingsToSave = updatedHoldings.map(h => ({
      id: h.id,
      propertyId: h.propertyId,
      tokens: h.tokens,
      ts: h.ts
    }));
    localStorage.setItem('off_realestate', JSON.stringify(holdingsToSave));
    
    // Dispatch event to notify Dashboard
    window.dispatchEvent(new Event('realEstateUpdated'));
    
    toast({ title: 'Purchase successful!', status: 'success', description: `Purchased ${tokens} tokens` });
    setTokens(100);
    setSelected('');
  }

  function openSellModal(holding) {
    setSellHoldingId(holding.id);
    onOpen();
  }

  function sell() {
    if (!sellAmount || !sellHoldingId) {
      toast({ title: 'Please enter dollar amount to sell', status: 'warning' });
      return;
    }

    const holding = holdings.find(h => h.id === sellHoldingId);
    if (!holding) {
      toast({ title: 'Holding not found', status: 'error' });
      return;
    }

    const property = MOCK_PROPERTIES.find(p => p.id === holding.propertyId);
    if (!property) {
      toast({ title: 'Property not found', status: 'error' });
      return;
    }

    // Calculate current value of holding
    const holdingValue = (holding.tokens / property.tokensTotal) * property.price;
    const pricePerToken = property.price / property.tokensTotal;
    
    // sellAmount is in dollars, calculate how many tokens to sell
    const dollarAmount = Number(sellAmount);
    const tokensToSell = dollarAmount / pricePerToken;
    
    if (dollarAmount > holdingValue) {
      toast({ 
        title: 'Not enough funds', 
        status: 'error', 
        description: `You only have $${holdingValue.toFixed(2)} worth (${holding.tokens.toLocaleString()} tokens)` 
      });
      return;
    }
    
    let updatedHoldings;
    if (tokensToSell >= holding.tokens) {
      // Sell everything
      updatedHoldings = holdings.filter(h => h.id !== sellHoldingId);
    } else {
      updatedHoldings = holdings.map(h => 
        h.id === sellHoldingId ? { ...h, tokens: h.tokens - tokensToSell } : h
      );
    }

    setHoldings(updatedHoldings);
    
    // Save to localStorage
    const holdingsToSave = updatedHoldings.map(h => ({
      id: h.id,
      propertyId: h.propertyId,
      tokens: h.tokens,
      ts: h.ts
    }));
    localStorage.setItem('off_realestate', JSON.stringify(holdingsToSave));
    
    // Dispatch event to notify Dashboard
    window.dispatchEvent(new Event('realEstateUpdated'));
    
    toast({ 
      title: 'Sale successful!', 
      status: 'success', 
      description: `Sold ${tokensToSell.toFixed(2)} tokens for $${dollarAmount.toFixed(2)}` 
    });
    onClose();
    setSellAmount('');
    setSellHoldingId(null);
  }

  const selectedProperty = properties.find(p => p.id === selected);

  return (
    <Box p={6}>
      <Heading mb={6} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Tokenized Real Estate Investment</Heading>
      
      <SimpleGrid columns={[1, 2, 3]} gap={6} mb={8}>
        {properties.map((p) => (
          <Card key={p.id} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border={selected === p.id ? '2px solid' : '1px'} borderColor={selected === p.id ? 'blue.500' : 'rgba(255,255,255,0.5)'} cursor="pointer" onClick={() => setSelected(p.id)} transition="all 0.3s" _hover={{ transform: 'translateY(-3px)', boxShadow: '2xl' }}>
            <CardHeader>
              <Heading size="sm">{p.title}</Heading>
              <Badge colorScheme="green" mt={2} fontSize="md" px={3} py={1}>{Math.round(p.roi * 100)}% ROI</Badge>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between" p={2} bgGradient="linear(to-r, blue.50, purple.50)" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Total Value</Text>
                  <Text fontWeight="bold" fontSize="lg">${p.price.toLocaleString()}</Text>
                </HStack>
                <HStack justify="space-between" p={2} bgGradient="linear(to-r, green.50, teal.50)" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Tokens Available</Text>
                  <Text fontWeight="bold">{p.tokensAvailable.toLocaleString()}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Tokens Total</Text>
                  <Text>{p.tokensTotal.toLocaleString()}</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Card mb={8} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
        <CardHeader>
          <Heading size="md">Purchase Tokens</Heading>
        </CardHeader>
        <CardBody>
          {selectedProperty ? (
            <VStack align="stretch" spacing={4}>
              <Box p={4} bgGradient="linear(to-r, blue.100, purple.100)" borderRadius="md">
                <Text fontWeight="bold" mb={2}>Selected: {selectedProperty.title}</Text>
                <Text fontSize="sm" color="gray.600">Available tokens: {selectedProperty.tokensAvailable.toLocaleString()}</Text>
              </Box>
              <Input type="number" placeholder="Number of tokens" value={tokens} onChange={e => setTokens(e.target.value)} maxW="sm" size="lg" />
              <Button onClick={purchase} colorScheme="blue" size="lg">
                Purchase Tokens
              </Button>
            </VStack>
          ) : (
            <Text color="gray.500">Select a property above to purchase tokens</Text>
          )}
        </CardBody>
      </Card>

      {holdings.length > 0 && (
        <SimpleGrid columns={[1, 2]} gap={6}>
          <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
            <CardHeader>
              <Heading size="md">My Real Estate Holdings</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                {holdings.map((holding) => {
                  const property = MOCK_PROPERTIES.find(p => p.id === holding.propertyId);
                  if (!property) return null;
                  const investmentValue = (holding.tokens / property.tokensTotal) * property.price;
                  return (
                    <Card key={holding.id}>
                      <CardBody>
                        <HStack justify="space-between">
                          <Box>
                            <Text fontWeight="bold" fontSize="lg">{property.title}</Text>
                            <Text fontSize="sm" color="gray.600">Tokens Owned: {holding.tokens.toLocaleString()}</Text>
                            <Text fontSize="sm" color="blue.600" fontWeight="medium">Value: ${investmentValue.toLocaleString()}</Text>
                          </Box>
                          <VStack spacing={2}>
                            <Badge colorScheme="green" fontSize="md" px={4} py={2}>
                              {Math.round(property.roi * 100)}% ROI
                            </Badge>
                            <Button size="sm" onClick={() => openSellModal(holding)} colorScheme="red">
                              Sell
                            </Button>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </VStack>
            </CardBody>
          </Card>

          <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
            <CardHeader>
              <Heading size="md">Real Estate Allocation</Heading>
            </CardHeader>
            <CardBody>
              {(() => {
                // Calculate pie chart data
                const pieData = holdings.map((holding) => {
                  const property = MOCK_PROPERTIES.find(p => p.id === holding.propertyId);
                  if (!property) return null;
                  const investmentValue = (holding.tokens / property.tokensTotal) * property.price;
                  return {
                    name: property.title,
                    value: investmentValue,
                    tokens: holding.tokens,
                    color: property.id === '1' ? '#0088FE' : 
                           property.id === '2' ? '#00C49F' : 
                           property.id === '3' ? '#FFBB28' : 
                           property.id === '4' ? '#FF8042' : 
                           property.id === '5' ? '#8884d8' : '#82ca9d'
                  };
                }).filter(item => item !== null);

                const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);

                // Custom tooltip
                const CustomTooltip = ({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0;
                    return (
                      <Box bg="white" p={3} border="1px solid" borderColor="gray.200" borderRadius="md" boxShadow="lg">
                        <Text fontWeight="bold" mb={1}>{data.name}</Text>
                        <Text fontSize="sm" color="gray.600">Value: ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        <Text fontSize="sm" color="gray.600">Percentage: {percentage}%</Text>
                        <Text fontSize="sm" color="gray.600">Tokens: {data.tokens.toLocaleString()}</Text>
                      </Box>
                    );
                  }
                  return null;
                };

                // Custom label function with better alignment
                const renderLabel = (entry) => {
                  const percentage = totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(1) : 0;
                  return `${percentage}%`;
                };
                
                // Custom label line style for better alignment
                const labelLine = { stroke: '#888', strokeWidth: 1 };

                if (pieData.length > 0) {
                  return (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie 
                          data={pieData} 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={100} 
                          fill="#8884d8" 
                          dataKey="value" 
                          label={renderLabel}
                          labelLine={labelLine}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  );
                } else {
                  return (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500">No holdings to display</Text>
                    </Box>
                  );
                }
              })()}
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sell Real Estate Tokens</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              {(() => {
                const holding = holdings.find(h => h.id === sellHoldingId);
                if (!holding) return null;
                
                const property = MOCK_PROPERTIES.find(p => p.id === holding.propertyId);
                if (!property) return null;
                
                const pricePerToken = property.price / property.tokensTotal;
                const holdingValue = (holding.tokens / property.tokensTotal) * property.price;
                const tokensToSell = sellAmount ? Number(sellAmount) / pricePerToken : 0;
                
                return (
                  <>
                    <Box>
                      <Text mb={2} fontWeight="medium">Property: {property.title}</Text>
                      <Text mb={2} fontWeight="medium">Available to sell:</Text>
                      <Text fontSize="sm" color="gray.600">
                        {holding.tokens.toLocaleString()} tokens (${holdingValue.toFixed(2)})
                      </Text>
                    </Box>
                    <Input 
                      type="number" 
                      placeholder="Amount in USD ($)" 
                      value={sellAmount} 
                      onChange={e => setSellAmount(e.target.value)} 
                    />
                    {sellAmount && tokensToSell > 0 && (
                      <Text fontSize="sm" color="gray.600">
                        You will sell: {tokensToSell.toFixed(2)} tokens
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
