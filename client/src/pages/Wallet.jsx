import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Card, CardBody, CardHeader, SimpleGrid, Text, Input, Select, VStack, HStack, Badge, Table, Thead, Tbody, Tr, Th, Td, Stat, StatLabel, StatNumber, StatHelpText, useToast, Icon } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';
import { ViewIcon, ArrowDownIcon, ArrowUpIcon, ArrowForwardIcon } from '@chakra-ui/icons';

export default function Wallet() {
  const { API_URL, token } = useAuth();
  const toast = useToast();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  // Separate state for each form
  const [depositCurrency, setDepositCurrency] = useState('USDC');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDC');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferCurrency, setTransferCurrency] = useState('USDC');
  const [transferAmount, setTransferAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch(`${API_URL}/wallet`, { headers: { Authorization: `Bearer ${token}` } });
    setWallet(await res.json());
    const txs = await fetch(`${API_URL}/wallet/transactions`, { headers: { Authorization: `Bearer ${token}` } });
    setTransactions(await txs.json());
  }

  async function deposit() {
    if (!depositAmount || depositAmount <= 0) {
      toast({ title: 'Please enter a valid amount', status: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/wallet/deposit`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currency: depositCurrency, amount: Number(depositAmount) }) });
      if (!res.ok) throw new Error('Deposit failed');
      toast({ title: 'Deposit successful', status: 'success' });
      await load();
      setDepositAmount('');
    } catch (err) {
      toast({ title: 'Deposit failed', status: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function withdraw() {
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast({ title: 'Please enter a valid amount', status: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/wallet/withdraw`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currency: withdrawCurrency, amount: Number(withdrawAmount) }) });
      if (!res.ok) throw new Error('Withdrawal failed');
      toast({ title: 'Withdrawal successful', status: 'success' });
      await load();
      setWithdrawAmount('');
    } catch (err) {
      toast({ title: 'Withdrawal failed - insufficient balance', status: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function transfer() {
    if (!transferAmount || transferAmount <= 0) {
      toast({ title: 'Please enter a valid amount', status: 'warning' });
      return;
    }
    if (!toAddress) {
      toast({ title: 'Please enter a recipient address', status: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/wallet/transfer`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currency: transferCurrency, amount: Number(transferAmount), toAddress }) });
      if (!res.ok) throw new Error('Transfer failed');
      toast({ title: 'Transfer successful', status: 'success' });
      await load();
      setTransferAmount('');
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
                     (wallet.balances?.ETH || 0) * 2500 +
                     (wallet.balances?.SOL || 0) * 100 +
                     (wallet.balances?.ADA || 0) * 0.55 +
                     (wallet.balances?.MATIC || 0) * 0.85 +
                     (wallet.balances?.DOT || 0) * 7.2;

  return (
    <Box p={6}>
      <Heading mb={2} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Crypto Wallet</Heading>
      <Text color="gray.600" mb={6}>Manage your cryptocurrency assets</Text>
      
      <SimpleGrid columns={[1, 2, 3]} gap={6} mb={8}>
        <Card bgGradient="linear(to-br, blue.400, blue.600)" color="white" boxShadow="2xl">
          <CardBody>
            <Stat>
              <HStack mb={2}>
                <Icon as={ViewIcon} />
                <StatLabel opacity={0.9}>Total Value</StatLabel>
              </HStack>
              <StatNumber fontSize="3xl">${totalValue.toLocaleString()}</StatNumber>
              <StatHelpText opacity={0.8}>All Assets</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        {Object.entries(wallet.balances || {}).map(([curr, bal]) => (
          <Card key={curr} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
            <CardBody>
              <Stat>
                <StatLabel color="gray.700">{curr}</StatLabel>
                <StatNumber fontSize="2xl" color="blue.600">{typeof bal === 'number' ? bal.toFixed(curr === 'USDC' ? 2 : 6) : 0}</StatNumber>
                <StatHelpText color="gray.600">
                  {curr === 'USDC' ? 'USD Coin' : curr === 'BTC' ? 'Bitcoin' : curr === 'ETH' ? 'Ethereum' : curr === 'SOL' ? 'Solana' : curr === 'ADA' ? 'Cardano' : curr === 'MATIC' ? 'Polygon' : 'Polkadot'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={[1, 3]} gap={6} mb={8}>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader bgGradient="linear(to-r, green.500, teal.500)" color="white" borderRadius="lg">
            <Heading size="sm">Deposit</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Select value={depositCurrency} onChange={e => setDepositCurrency(e.target.value)}>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
                <option value="ADA">ADA</option>
                <option value="MATIC">MATIC</option>
                <option value="DOT">DOT</option>
              </Select>
              <Input type="number" placeholder="Amount" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
              <Button onClick={deposit} isLoading={loading} colorScheme="green" w="full" leftIcon={<Icon as={ArrowDownIcon} />}>Deposit</Button>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader bgGradient="linear(to-r, orange.500, red.500)" color="white" borderRadius="lg">
            <Heading size="sm">Withdraw</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Select value={withdrawCurrency} onChange={e => setWithdrawCurrency(e.target.value)}>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
                <option value="ADA">ADA</option>
                <option value="MATIC">MATIC</option>
                <option value="DOT">DOT</option>
              </Select>
              <Input type="number" placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
              <Button onClick={withdraw} isLoading={loading} colorScheme="orange" w="full" leftIcon={<Icon as={ArrowUpIcon} />}>Withdraw</Button>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader bgGradient="linear(to-r, purple.500, pink.500)" color="white" borderRadius="lg">
            <Heading size="sm">Transfer</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Select value={transferCurrency} onChange={e => setTransferCurrency(e.target.value)}>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
                <option value="ADA">ADA</option>
                <option value="MATIC">MATIC</option>
                <option value="DOT">DOT</option>
              </Select>
              <Input placeholder="To Address" value={toAddress} onChange={e => setToAddress(e.target.value)} />
              <Input type="number" placeholder="Amount" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} />
              <Button onClick={transfer} isLoading={loading} colorScheme="purple" w="full" leftIcon={<Icon as={ArrowForwardIcon} />}>Transfer</Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
        <CardHeader bgGradient="linear(to-r, indigo.500, blue.500)" color="white" borderRadius="lg">
          <Heading size="md">Transaction History</Heading>
        </CardHeader>
        <CardBody>
          {transactions.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
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
                  {transactions.slice().reverse().map((tx) => (
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
            </Box>
          ) : (
            <Text color="gray.500" textAlign="center" py={8}>No transactions yet</Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
