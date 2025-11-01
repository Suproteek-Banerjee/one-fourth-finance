import React, { useState } from 'react';
import { Box, Button, Heading, Select, SimpleGrid, Text, Card, CardBody, CardHeader, VStack, HStack, Badge } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

// Mock data - no API calls
const MOCK_PRODUCTS = [
  { id: '1', name: 'OFF Basic Health', premiumBase: 25, coverage: 10000, tier: 'basic' },
  { id: '2', name: 'OFF Family Shield', premiumBase: 40, coverage: 25000, tier: 'standard' },
  { id: '3', name: 'OFF Global Travel', premiumBase: 15, coverage: 5000, tier: 'travel' }
];

const MOCK_POLICIES = [
  { id: '1', productId: '1', name: 'OFF Basic Health', premium: 25, coverage: 10000, status: 'active' }
];

const MOCK_COMMUNITIES = [
  { id: '1', name: 'OFF Community Care', contributionMonthly: 10, members: 125 }
];

export default function Insurance() {
  const [products] = useState(MOCK_PRODUCTS);
  const [policies, setPolicies] = useState(MOCK_POLICIES);
  const [communities] = useState(MOCK_COMMUNITIES);
  const [selected, setSelected] = useState('');
  const [quote, setQuote] = useState(null);

  function getQuote() {
    if (!selected) return;
    const product = products.find(p => p.id === selected);
    if (product) {
      setQuote({
        premium: product.premiumBase,
        coverage: product.coverage,
        monthly: product.premiumBase
      });
    }
  }

  function purchase() {
    if (!selected) return;
    const product = products.find(p => p.id === selected);
    if (product && !policies.find(p => p.productId === selected)) {
      setPolicies([...policies, {
        id: Date.now().toString(),
        productId: selected,
        name: product.name,
        premium: product.premiumBase,
        coverage: product.coverage,
        status: 'active'
      }]);
    }
    setSelected('');
    setQuote(null);
  }

  return (
    <Box p={6}>
      <Heading mb={6} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Insurance Marketplace</Heading>
      
      <Box mb={10}>
        <Heading size="md" mb={4}>Low-Cost Insurance Products</Heading>
        <SimpleGrid columns={[1, 2, 3]} gap={6} mb={6}>
          {products.map((p) => (
            <Card key={p.id} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border={selected === p.id ? '2px solid' : '1px'} borderColor={selected === p.id ? 'blue.500' : 'rgba(255,255,255,0.5)'} transition="all 0.3s" _hover={{ transform: 'translateY(-3px)', boxShadow: '2xl' }} cursor="pointer" onClick={() => setSelected(p.id)}>
              <CardHeader>
                <Heading size="sm">{p.name}</Heading>
                <Badge colorScheme="green" mt={2}>${p.premiumBase}/mo</Badge>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm" color="gray.600">Coverage: ${p.coverage.toLocaleString()}</Text>
                <Badge mt={2} colorScheme="blue">{p.tier}</Badge>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {selected && (
          <Card mb={8} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl">
            <CardHeader>
              <Heading size="md">Get Quote</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Button onClick={getQuote} colorScheme="blue">Get Quote</Button>
                {quote && (
                  <Box p={4} bg="blue.50" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">Monthly Premium:</Text>
                      <Text fontSize="xl">${quote.monthly}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Coverage:</Text>
                      <Text>${quote.coverage.toLocaleString()}</Text>
                    </HStack>
                  </Box>
                )}
                <Button onClick={purchase} colorScheme="green">Purchase Policy</Button>
              </VStack>
            </CardBody>
          </Card>
        )}
      </Box>

      {policies.length > 0 && (
        <Box mb={10}>
          <Heading size="md" mb={4}>My Policies</Heading>
          <SimpleGrid columns={[1, 2, 3]} gap={6}>
            {policies.map((p) => (
              <Card key={p.id} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl">
                <CardHeader>
                  <HStack>
                    <CheckCircleIcon color="green.500" />
                    <Heading size="sm">{p.name}</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Premium:</Text>
                      <Text fontWeight="bold">${p.premium}/mo</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Coverage:</Text>
                      <Text>${p.coverage.toLocaleString()}</Text>
                    </HStack>
                    <Badge colorScheme="green">{p.status}</Badge>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}

      <Box>
        <Heading size="md" mb={4}>P2P Insurance Communities</Heading>
        <SimpleGrid columns={[1, 2, 3]} gap={6}>
          {communities.map((c) => (
            <Card key={c.id} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl">
              <CardHeader>
                <Heading size="sm">{c.name}</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Monthly Contribution:</Text>
                    <Text fontWeight="bold">${c.contributionMonthly}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Members:</Text>
                    <Text>{c.members}</Text>
                  </HStack>
                  <Button size="sm" colorScheme="blue" mt={2}>Join Community</Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
