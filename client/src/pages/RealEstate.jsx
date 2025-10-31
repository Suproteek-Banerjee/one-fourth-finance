import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Input, Text, Card, CardBody, CardHeader, SimpleGrid, VStack, HStack, Badge } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function RealEstate() {
  const { API_URL, token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState('');
  const [tokens, setTokens] = useState(100);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch(`${API_URL}/real-estate/properties`, { headers: { Authorization: `Bearer ${token}` } });
    setProperties(await res.json());
    const pf = await fetch(`${API_URL}/real-estate/portfolio`, { headers: { Authorization: `Bearer ${token}` } });
    const json = await pf.json();
    setHoldings(json.holdings || []);
  }

  async function purchase() {
    setLoading(true);
    await fetch(`${API_URL}/real-estate/purchase`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ propertyId: selected, tokens: Number(tokens) }) });
    await load();
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

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
              <Button onClick={purchase} isDisabled={!selected || loading} colorScheme="blue" isLoading={loading} size="lg">
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
