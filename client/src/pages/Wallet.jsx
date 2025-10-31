import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Card, CardBody, CardHeader, SimpleGrid, Text, Input, Select, VStack, HStack, Badge, Table, Thead, Tbody, Tr, Th, Td, Stat, StatLabel, StatNumber, StatHelpText, useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Wallet() {
  const { API_URL, token } = useAuth();
  const toast = useToast();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch(`${API_URL}/wallet`, { headers: { Authorization: `Bearer ${token}` } });
    setWallet(await res.json());
    const txs = await fetch(`${API_URL}/wallet/transactions`, { headers: { Authorization: `Bearer ${token}` } });
    setTransactions(await txs.json());
  }

  async function deposit() {
    if (!amount || amount <= 0) {
      toast({ title: 'Please enter a valid amount', status: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/wallet/deposit`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currency, amount: Number(amount) }) });
      if (!res.ok) throw new Error('Deposit failed');
      toast({ title: 'Deposit successful', status: 'success' });
      await load();
      setAmount('');
    } catch (err) {
      toast({ title: 'Deposit failed', status: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function withdraw() {
    if (!amount || amount <= 0) {
      toast({ title: 'Please enter a valid amount', status: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/wallet/withdraw`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currency, amount: Number(amount) }) });
      if (!res.ok) throw new Error('Withdrawal failed');
      toast({ title: 'Withdrawal successful', status: 'success' });
      await load();
      setAmount('');
    } catch (err) {
      toast({ title: 'Withdrawal failed - insufficient balance', status: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function transfer() {
    if (!amount || amount <= 0) {
      toast({ title: 'Please enter a valid amount', status: 'warning' });
      return;
    }
    if (!toAddress) {
      toast({ title: 'Please enter a recipient address', status: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/wallet/transfer`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currency, amount: Number(amount), toAddress }) });
      if (!res.ok) throw new Error('Transfer failed');
      toast({ title: 'Transfer successful', status: 'success' });
      await load();
      setAmount('');
      setToAddress('');
    } catch (err) {
      toast({ title: 'Transfer failed - insufficient balance', status: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (!wallet) return <Box p={8}><Text>Loading...</Text></Box>;

  const totalValue = (wallet.balances?.USDC || 0) * 1 + 
                     (wallet.balances?.BTC || 0) * 45000 + 
                     (wallet.balances?.ETH || 0) * 2500;

  return (
    <Box p={6}>
      <Heading mb={6}>Crypto Wallet</Heading>
      
      <SimpleGrid columns={[1, 2, 3]} gap={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Total Value</StatLabel>
              <StatNumber color="green.500" fontSize="2xl">${totalValue.toLocaleString()}</StatNumber>
              <StatHelpText>All Assets</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        {Object.entries(wallet.balances || {}).map(([curr, bal]) => (
          <Card key={curr}>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600">{curr}</StatLabel>
                <StatNumber fontSize="2xl">{typeof bal === 'number' ? bal.toFixed(curr === 'USDC' ? 2 : 6) : 0}</StatNumber>
                <StatHelpText>{curr === 'USDC' ? '$' : curr === 'BTC' ? 'Bitcoin' : 'Ethereum'}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={[1, 3]} gap={6} mb={8}>
        <Card>
          <CardHeader>
            <Heading size="sm">Deposit</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </Select>
              <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
              <Button onClick={deposit} isLoading={loading} colorScheme="blue" w="full">Deposit</Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="sm">Withdraw</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </Select>
              <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
              <Button onClick={withdraw} isLoading={loading} colorScheme="orange" w="full">Withdraw</Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="sm">Transfer</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </Select>
              <Input placeholder="To Address" value={toAddress} onChange={e => setToAddress(e.target.value)} />
              <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
              <Button onClick={transfer} isLoading={loading} colorScheme="green" w="full">Transfer</Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardHeader>
          <Heading size="md">Transaction History</Heading>
        </CardHeader>
        <CardBody>
          {transactions.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Type</Th>
                  <Th>Currency</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.reverse().map((tx) => (
                  <Tr key={tx.id}>
                    <Td><Badge colorScheme={tx.type === 'deposit' ? 'green' : tx.type === 'withdrawal' ? 'orange' : 'blue'}>{tx.type}</Badge></Td>
                    <Td>{tx.currency}</Td>
                    <Td>{tx.amount}</Td>
                    <Td><Badge colorScheme={tx.status === 'completed' ? 'green' : 'yellow'}>{tx.status}</Badge></Td>
                    <Td>{new Date(tx.ts).toLocaleString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text color="gray.500" textAlign="center" py={8}>No transactions yet</Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}

