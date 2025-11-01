import React, { useState } from 'react';
import { Box, Button, Heading, Input, Text, Card, CardBody, CardHeader, SimpleGrid, VStack, HStack, Badge, useToast } from '@chakra-ui/react';

// Mock data - no API calls
const MOCK_PROPERTIES = [
  { id: '1', title: 'Nairobi Apartments', price: 250000, roi: 0.11, tokensTotal: 100000, tokensAvailable: 75000 },
  { id: '2', title: 'Lagos Co-working', price: 450000, roi: 0.13, tokensTotal: 150000, tokensAvailable: 120000 },
  { id: '3', title: 'Bangalore Retail', price: 600000, roi: 0.09, tokensTotal: 200000, tokensAvailable: 180000 }
];

const MOCK_HOLDINGS = [
  { id: '1', propertyId: '1', tokens: 5000, property: MOCK_PROPERTIES[0] },
  { id: '2', propertyId: '2', tokens: 10000, property: MOCK_PROPERTIES[1] }
];

export default function RealEstate() {
  const toast = useToast();
  const [properties, setProperties] = useState(MOCK_PROPERTIES);
  const [holdings, setHoldings] = useState(MOCK_HOLDINGS);
  const [selected, setSelected] = useState('');
  const [tokens, setTokens] = useState(100);

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
    const existingHolding = holdings.find(h => h.propertyId === selected);
    if (existingHolding) {
      setHoldings(holdings.map(h => 
        h.propertyId === selected ? { ...h, tokens: h.tokens + tokens } : h
      ));
    } else {
      setHoldings([...holdings, {
        id: Date.now().toString(),
        propertyId: selected,
        tokens: tokens,
        property: property
      }]);
    }

    toast({ title: 'Purchase successful!', status: 'success', description: `Purchased ${tokens} tokens` });
    setTokens(100);
    setSelected('');
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
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader>
            <Heading size="md">My Real Estate Holdings</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              {holdings.map((holding) => (
                <Card key={holding.id}>
                  <CardBody>
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="bold" fontSize="lg">{holding.property?.title || 'Property'}</Text>
                        <Text fontSize="sm" color="gray.600">Tokens Owned: {holding.tokens.toLocaleString()}</Text>
                      </Box>
                      {holding.property && (
                        <Badge colorScheme="green" fontSize="md" px={4} py={2}>
                          {Math.round(holding.property.roi * 100)}% ROI
                        </Badge>
                      )}
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
