import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Input, Select, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function RealEstate() {
  const { API_URL, token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState('');
  const [tokens, setTokens] = useState(100);
  const [holdings, setHoldings] = useState([]);

  async function load() {
    const res = await fetch(`${API_URL}/real-estate/properties`, { headers: { Authorization: `Bearer ${token}` } });
    setProperties(await res.json());
    const pf = await fetch(`${API_URL}/real-estate/portfolio`, { headers: { Authorization: `Bearer ${token}` } });
    const json = await pf.json();
    setHoldings(json.holdings || []);
  }

  async function purchase() {
    await fetch(`${API_URL}/real-estate/purchase`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ propertyId: selected, tokens: Number(tokens) }) });
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <Box>
      <Heading mb={4}>Tokenized Real Estate</Heading>
      <Select placeholder="Select property" value={selected} onChange={e => setSelected(e.target.value)} maxW="md" mb={3}>
        {properties.map(p => <option key={p.id} value={p.id}>{p.title} – ROI {Math.round(p.roi*100)}% – tokens left {p.tokensAvailable}</option>)}
      </Select>
      <Input type="number" maxW="sm" mb={2} value={tokens} onChange={e => setTokens(e.target.value)} />
      <Button onClick={purchase} isDisabled={!selected}>Purchase</Button>
      <Box mt={6}>
        <Heading size="sm">My Holdings</Heading>
        <pre>{JSON.stringify(holdings, null, 2)}</pre>
      </Box>
    </Box>
  );
}


