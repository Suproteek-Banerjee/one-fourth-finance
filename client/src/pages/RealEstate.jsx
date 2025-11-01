import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Input, Text, Card, CardBody, CardHeader, SimpleGrid, VStack, HStack, Badge, useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function RealEstate() {
  const { API_URL, token, loading: authLoading } = useAuth();
  const toast = useToast();
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState('');
  const [tokens, setTokens] = useState(100);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  async function load() {
    if (!token) {
      setInitialLoad(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/real-estate/properties`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setProperties(data || []);
      } else {
        console.error('Failed to load properties:', res.status);
      }
      const pf = await fetch(`${API_URL}/real-estate/portfolio`, { headers: { Authorization: `Bearer ${token}` } });
      if (pf.ok) {
        const json = await pf.json();
        setHoldings(json.holdings || []);
      }
    } catch (err) {
      console.error('Failed to load real estate data:', err);
    } finally {
      setInitialLoad(false);
    }
  }

  async function purchase() {
    if (!token) {
      toast({ title: 'Please wait for authentication', status: 'warning' });
      return;
    }
    if (!selected || !tokens || tokens <= 0) {
      toast({ title: 'Please select a property and enter token amount', status: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/real-estate/purchase`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ propertyId: selected, tokens: Number(tokens) }) 
      });
      if (res.ok) {
        const data = await res.json();
        await load();
        toast({ title: 'Purchase successful!', status: 'success', description: `Purchased ${tokens} tokens` });
        setTokens(100);
        setSelected('');
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Purchase failed' }));
        toast({ title: 'Purchase failed', status: 'error', description: errorData.error || 'Please try again' });
      }
    } catch (err) {
      toast({ title: 'Network error', status: 'error', description: 'Could not connect to server' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && token) {
      load();
    } else if (!authLoading && !token) {
      setInitialLoad(false);
    }
  }, [API_URL, token, authLoading]);

  const selectedProperty = properties.find(p => p.id === selected);

  if (authLoading || initialLoad) {
    return (
      <Box p={6}>
        <Heading mb={6} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Tokenized Real Estate Investment</Heading>
        <Box p={8}><Text>Loading properties...</Text></Box>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Tokenized Real Estate Investment</Heading>
      
      {properties.length === 0 && !initialLoad && (
        <Card mb={8}><CardBody><Text color="gray.500">No properties available</Text></CardBody></Card>
      )}
      
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
