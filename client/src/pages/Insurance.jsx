import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Input, Select, SimpleGrid, Text, Card, CardBody, CardHeader, VStack, HStack, Badge, Divider, Icon } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';
import { CheckCircleIcon, BellIcon } from '@chakra-ui/icons';

export default function Insurance() {
  const { API_URL, token, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState('');
  const [quote, setQuote] = useState(null);
  const [my, setMy] = useState({ policies: [], claims: [] });
  const [communities, setCommunities] = useState([]);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityContribution, setNewCommunityContribution] = useState(10);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [contributionAmount, setContributionAmount] = useState(5);
  const [notifications, setNotifications] = useState([]);

  async function load() {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/insurance/products`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setProducts(await res.json());
      }
      const mine = await fetch(`${API_URL}/insurance/my`, { headers: { Authorization: `Bearer ${token}` } });
      if (mine.ok) {
        setMy(await mine.json());
      }
      const comm = await fetch(`${API_URL}/insurance/communities`, { headers: { Authorization: `Bearer ${token}` } });
      if (comm.ok) {
        setCommunities(await comm.json());
      }
      const notes = await fetch(`${API_URL}/insurance/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      if (notes.ok) {
        setNotifications(await notes.json());
      }
    } catch (err) {
      console.error('Failed to load insurance data:', err);
    }
  }

  async function getQuote() {
    if (!token) return;
    if (!selected) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/insurance/quote`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ productId: selected, age: 32, smoker: false }) 
      });
      if (res.ok) {
        const data = await res.json();
        setQuote(data);
      } else {
        console.error('Failed to get quote');
      }
    } catch (err) {
      console.error('Quote failed:', err);
    }
  }

  async function purchase() {
    if (!token) return;
    if (!selected) return;
    try {
      const res = await fetch(`${API_URL}/insurance/purchase`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ productId: selected }) 
      });
      if (res.ok) {
        await load();
      }
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  }

  useEffect(() => {
    if (!authLoading && token) {
      load();
    }
  }, [API_URL, token, authLoading]);

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
                <Text fontSize="xl" fontWeight="bold" color="blue.600">${p.coverage.toLocaleString()}</Text>
                <Text fontSize="sm" color="gray.600">Coverage Amount</Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
        
        <Card mb={4} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
          <CardBody>
            <HStack>
              <Select placeholder="Or select from dropdown" value={selected} onChange={e => setSelected(e.target.value)} flex={1}>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} - coverage ${p.coverage}</option>)}
              </Select>
              <Button onClick={getQuote} isDisabled={!selected} colorScheme="blue">Get Quote</Button>
              <Button onClick={purchase} isDisabled={!selected} colorScheme="green">Purchase</Button>
            </HStack>
            {quote && (
              <Box mt={4} p={4} bgGradient="linear(to-r, blue.100, purple.100)" borderRadius="md">
                <Text fontWeight="bold">Your Quote:</Text>
                <Text fontSize="2xl" color="blue.600">${quote.monthlyPremium.toLocaleString()}/month</Text>
              </Box>
            )}
          </CardBody>
        </Card>

        {my.policies.length > 0 && (
          <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
            <CardHeader>
              <Heading size="sm">My Policies & Claims</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                {my.policies.map((policy) => {
                  const product = products.find(p => p.id === policy.productId);
                  return (
                    <Box key={policy.id} p={3} bgGradient="linear(to-r, blue.50, purple.50)" borderRadius="md">
                      <HStack justify="space-between">
                        <Box>
                          <Text fontWeight="bold">{product?.name || 'Policy'}</Text>
                          <Badge colorScheme="green">{policy.status}</Badge>
                        </Box>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </CardBody>
          </Card>
        )}
      </Box>

      <Divider my={8} />

      <Box>
        <Heading size="md" mb={4}>P2P Insurance Communities</Heading>
        <SimpleGrid columns={[1, 2]} gap={6} mb={6}>
          <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
            <CardHeader>
              <Heading size="sm">Create Community</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Input placeholder="Community Name" value={newCommunityName} onChange={e => setNewCommunityName(e.target.value)} />
                <Input placeholder="Monthly Contribution" type="number" value={newCommunityContribution} onChange={e => setNewCommunityContribution(e.target.value)} />
                <Button onClick={async () => {
                  await fetch(`${API_URL}/insurance/communities`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: newCommunityName, contributionMonthly: Number(newCommunityContribution) }) });
                  setNewCommunityName('');
                  await load();
                }} colorScheme="blue">Create Community</Button>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
            <CardHeader>
              <Heading size="sm">Join or Contribute</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Select placeholder="Select community" value={selectedCommunity} onChange={e => setSelectedCommunity(e.target.value)}>
                  {communities.map(c => <option key={c.id} value={c.id}>{c.name} – ${c.contributionMonthly}/mo – {c.members} members</option>)}
                </Select>
                <Button onClick={async () => {
                  if (!selectedCommunity) return;
                  await fetch(`${API_URL}/insurance/communities/join`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ communityId: selectedCommunity }) });
                  await load();
                }} isDisabled={!selectedCommunity} colorScheme="green">Join Community</Button>
                <Input placeholder="Contribution Amount" type="number" value={contributionAmount} onChange={e => setContributionAmount(e.target.value)} />
                <Button onClick={async () => {
                  if (!selectedCommunity) return;
                  await fetch(`${API_URL}/insurance/communities/contribute`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ communityId: selectedCommunity, amount: Number(contributionAmount) }) });
                  await load();
                }} isDisabled={!selectedCommunity}>Contribute</Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {notifications.length > 0 && (
          <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
            <CardHeader>
              <HStack>
                <Icon as={BellIcon} color="blue.500" />
                <Heading size="sm">Notifications</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                {notifications.map((n) => (
                  <HStack key={n.id} p={3} bgGradient="linear(to-r, blue.50, purple.50)" borderRadius="md">
                    <Icon as={CheckCircleIcon} color="green.500" />
                    <Text flex={1}>{n.message}</Text>
                    <Badge>{new Date(n.ts).toLocaleDateString()}</Badge>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </Box>
    </Box>
  );
}
