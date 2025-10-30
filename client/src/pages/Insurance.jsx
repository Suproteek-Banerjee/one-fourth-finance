import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Input, Select, SimpleGrid, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Insurance() {
  const { API_URL, token } = useAuth();
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
    const res = await fetch(`${API_URL}/insurance/products`, { headers: { Authorization: `Bearer ${token}` } });
    setProducts(await res.json());
    const mine = await fetch(`${API_URL}/insurance/my`, { headers: { Authorization: `Bearer ${token}` } });
    setMy(await mine.json());
    const comm = await fetch(`${API_URL}/insurance/communities`, { headers: { Authorization: `Bearer ${token}` } });
    setCommunities(await comm.json());
    const notes = await fetch(`${API_URL}/insurance/notifications`, { headers: { Authorization: `Bearer ${token}` } });
    setNotifications(await notes.json());
  }

  async function getQuote() {
    const res = await fetch(`${API_URL}/insurance/quote`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ productId: selected, age: 32, smoker: false }) });
    setQuote(await res.json());
  }

  async function purchase() {
    await fetch(`${API_URL}/insurance/purchase`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ productId: selected }) });
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <Box>
      <Heading mb={4}>Low-Cost Insurance</Heading>
      <Select placeholder="Select product" value={selected} onChange={e => setSelected(e.target.value)} maxW="md" mb={3}>
        {products.map(p => <option key={p.id} value={p.id}>{p.name} - coverage ${p.coverage}</option>)}
      </Select>
      <Button mr={2} onClick={getQuote} isDisabled={!selected}>Get Quote</Button>
      <Button onClick={purchase} isDisabled={!selected}>Purchase</Button>
      {quote && <Text mt={3}>Monthly premium: ${quote.monthlyPremium}</Text>}
      <Box mt={6}>
        <Heading size="sm">My Policies & Claims</Heading>
        <pre>{JSON.stringify(my, null, 2)}</pre>
      </Box>

      <Box mt={10}>
        <Heading size="md" mb={3}>P2P Insurance Communities</Heading>
        <SimpleGrid columns={[1,2]} gap={6}>
          <Box>
            <Heading size="sm" mb={2}>Create Community</Heading>
            <Input placeholder="Name" mb={2} value={newCommunityName} onChange={e => setNewCommunityName(e.target.value)} />
            <Input placeholder="Monthly Contribution" type="number" mb={2} value={newCommunityContribution} onChange={e => setNewCommunityContribution(e.target.value)} />
            <Button onClick={async () => {
              await fetch(`${API_URL}/insurance/communities`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: newCommunityName, contributionMonthly: Number(newCommunityContribution) }) });
              setNewCommunityName('');
              await load();
            }}>Create</Button>
          </Box>
          <Box>
            <Heading size="sm" mb={2}>Join/Contribute</Heading>
            <Select placeholder="Select community" mb={2} value={selectedCommunity} onChange={e => setSelectedCommunity(e.target.value)}>
              {communities.map(c => <option key={c.id} value={c.id}>{c.name} – ${c.contributionMonthly}/mo – {c.members} members</option>)}
            </Select>
            <Button mr={2} onClick={async () => {
              if (!selectedCommunity) return;
              await fetch(`${API_URL}/insurance/communities/join`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ communityId: selectedCommunity }) });
              await load();
            }} isDisabled={!selectedCommunity}>Join</Button>
            <Input placeholder="Contribution" type="number" mb={2} value={contributionAmount} onChange={e => setContributionAmount(e.target.value)} maxW="sm" />
            <Button onClick={async () => {
              if (!selectedCommunity) return;
              await fetch(`${API_URL}/insurance/communities/contribute`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ communityId: selectedCommunity, amount: Number(contributionAmount) }) });
              await load();
            }} isDisabled={!selectedCommunity}>Contribute</Button>
          </Box>
        </SimpleGrid>

        <Box mt={6}>
          <Heading size="sm" mb={2}>Notifications</Heading>
          <pre>{JSON.stringify(notifications, null, 2)}</pre>
        </Box>
      </Box>
    </Box>
  );
}


