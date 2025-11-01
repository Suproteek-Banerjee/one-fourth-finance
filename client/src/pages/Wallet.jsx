import React, { useState } from 'react';
import { Box, Button, Heading, Card, CardBody, CardHeader, SimpleGrid, Text, Input, Select, VStack, HStack, Badge, Table, Thead, Tbody, Tr, Th, Td, Stat, StatLabel, StatNumber, StatHelpText, useToast, Icon } from '@chakra-ui/react';
import { ViewIcon, ArrowDownIcon, ArrowUpIcon, ArrowForwardIcon } from '@chakra-ui/icons';

// Mock data - no API calls
const MOCK_WALLET = {
  userId: 'user1',
  address: '0xINVESTOR',
  balances: { USDC: 1200, BTC: 0.05, ETH: 0.7, SOL: 5, ADA: 1000, MATIC: 500, DOT: 50 },
  history: []
};

const MOCK_TRANSACTIONS = [
  { id: '1', type: 'deposit', currency: 'USDC', amount: 500, status: 'completed', ts: Date.now() - 86400000 },
  { id: '2', type: 'transfer', currency: 'BTC', amount: 0.01, status: 'completed', ts: Date.now() - 172800000 },
  { id: '3', type: 'withdrawal', currency: 'ETH', amount: 0.2, status: 'completed', ts: Date.now() - 259200000 }
];

export default function Wallet() {
  const toast = useToast();
  const [wallet, setWallet] = useState(MOCK_WALLET);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [depositCurrency, setDepositCurrency] = useState('USDC');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDC');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferCurrency, setTransferCurrency] = useState('USDC');
  const [transferAmount, setTransferAmount] = useState('');
  const [toAddress, setToAddress] = useState('');

  function deposit() {
    if (!depositAmount || depositAmount <= 0) {
      toast({ title: 'Please enter a valid amount', status: 'warning' });
      return;
    }

    setWallet({
      ...wallet,
      balances: {
        ...wallet.balances,
        [depositCurrency]: (wallet.balances[depositCurrency] || 0) + Number(depositAmount)
      }
    });

    setTransactions([{
      id: Date.now().toString(),
      type: 'deposit',
      currency: depositCurrency,
      amount: Number(depositAmount),
      status: 'completed',
      ts: Date.now()
    }, ...transactions]);

    toast({ title: 'Deposit successful!', status: 'success', description: `Added ${depositAmount} ${depositCurrency}` });
    setDepositAmount('');
  }

  function withdraw() {
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast({ title: 'Please enter a valid amount', status: 'warning' });
      return;
    }

    if ((wallet.balances[withdrawCurrency] || 0) < Number(withdrawAmount)) {
      toast({ title: 'Insufficient balance', status: 'error' });
      return;
    }

    setWallet({
      ...wallet,
      balances: {
        ...wallet.balances,
        [withdrawCurrency]: wallet.balances[withdrawCurrency] - Number(withdrawAmount)
      }
    });

    setTransactions([{
      id: Date.now().toString(),
      type: 'withdrawal',
      currency: withdrawCurrency,
      amount: Number(withdrawAmount),
      status: 'completed',
      ts: Date.now()
    }, ...transactions]);

    toast({ title: 'Withdrawal successful!', status: 'success', description: `Withdrew ${withdrawAmount} ${withdrawCurrency}` });
    setWithdrawAmount('');
  }

  function transfer() {
    if (!transferAmount || transferAmount <= 0) {
      toast({ title: 'Please enter a valid amount', status: 'warning' });
      return;
    }
    if (!toAddress) {
      toast({ title: 'Please enter a recipient address', status: 'warning' });
      return;
    }

    if ((wallet.balances[transferCurrency] || 0) < Number(transferAmount)) {
      toast({ title: 'Insufficient balance', status: 'error' });
      return;
    }

    setWallet({
      ...wallet,
      balances: {
        ...wallet.balances,
        [transferCurrency]: wallet.balances[transferCurrency] - Number(transferAmount)
      }
    });

    setTransactions([{
      id: Date.now().toString(),
      type: 'transfer',
      currency: transferCurrency,
      amount: Number(transferAmount),
      status: 'completed',
      ts: Date.now(),
      to: toAddress
    }, ...transactions]);

    toast({ title: 'Transfer successful!', status: 'success', description: `Transferred ${transferAmount} ${transferCurrency}` });
    setTransferAmount('');
    setToAddress('');
  }

  const currencies = ['USDC', 'BTC', 'ETH', 'SOL', 'ADA', 'MATIC', 'DOT'];
  const totalValue = Object.entries(wallet.balances).reduce((sum, [currency, amount]) => {
    const prices = { USDC: 1, BTC: 45000, ETH: 2500, SOL: 100, ADA: 0.55, MATIC: 0.85, DOT: 7.2 };
    return sum + (amount * (prices[currency] || 0));
  }, 0);

  return (
    <Box p={6}>
      <HStack mb={6}>
        <Icon as={ViewIcon} fontSize="2xl" color="blue.500" />
        <Heading>Crypto Wallet</Heading>
      </HStack>

      <SimpleGrid columns={[1, 2, 3]} gap={6} mb={8}>
        <Card bgGradient="linear(to-br, blue.400, blue.600)" color="white" boxShadow="2xl">
          <CardBody>
            <Stat>
              <StatLabel opacity={0.9}>Total Portfolio Value</StatLabel>
              <StatNumber fontSize="3xl">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatNumber>
              <StatHelpText opacity={0.8}>All Assets</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bgGradient="linear(to-br, green.400, green.600)" color="white" boxShadow="2xl">
          <CardBody>
            <Stat>
              <StatLabel opacity={0.9}>Wallet Address</StatLabel>
              <StatNumber fontSize="md" fontFamily="mono">{wallet.address}</StatNumber>
              <StatHelpText opacity={0.8}>Your Address</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bgGradient="linear(to-br, purple.400, purple.600)" color="white" boxShadow="2xl">
          <CardBody>
            <Stat>
              <StatLabel opacity={0.9}>Total Transactions</StatLabel>
              <StatNumber fontSize="3xl">{transactions.length}</StatNumber>
              <StatHelpText opacity={0.8}>History</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card mb={8} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
        <CardHeader>
          <Heading size="md">Balances</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={[2, 3, 4]} gap={4}>
            {currencies.map(currency => (
              <Box key={currency} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                <Text fontSize="sm" color="gray.600" mb={1}>{currency}</Text>
                <Text fontSize="xl" fontWeight="bold">{wallet.balances[currency] || 0}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      <SimpleGrid columns={[1, 3]} gap={6} mb={8}>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader bgGradient="linear(to-r, green.500, teal.500)" color="white" borderRadius="lg">
            <Heading size="md">Deposit</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Select value={depositCurrency} onChange={e => setDepositCurrency(e.target.value)}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Input type="number" placeholder="Amount" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
              <Button onClick={deposit} colorScheme="green" leftIcon={<Icon as={ArrowUpIcon} />}>Deposit</Button>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader bgGradient="linear(to-r, red.500, pink.500)" color="white" borderRadius="lg">
            <Heading size="md">Withdraw</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Select value={withdrawCurrency} onChange={e => setWithdrawCurrency(e.target.value)}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Input type="number" placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
              <Button onClick={withdraw} colorScheme="red" leftIcon={<Icon as={ArrowDownIcon} />}>Withdraw</Button>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader bgGradient="linear(to-r, blue.500, cyan.500)" color="white" borderRadius="lg">
            <Heading size="md">Transfer</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Select value={transferCurrency} onChange={e => setTransferCurrency(e.target.value)}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Input type="text" placeholder="Recipient Address" value={toAddress} onChange={e => setToAddress(e.target.value)} />
              <Input type="number" placeholder="Amount" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} />
              <Button onClick={transfer} colorScheme="blue" leftIcon={<Icon as={ArrowForwardIcon} />}>Transfer</Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
        <CardHeader>
          <Heading size="md">Transaction History</Heading>
        </CardHeader>
        <CardBody>
          {transactions.length > 0 ? (
            <Table size="sm">
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
                {transactions.map(tx => (
                  <Tr key={tx.id}>
                    <Td><Badge colorScheme={tx.type === 'deposit' ? 'green' : tx.type === 'withdrawal' ? 'red' : 'blue'}>{tx.type}</Badge></Td>
                    <Td>{tx.currency}</Td>
                    <Td>{tx.amount}</Td>
                    <Td><Badge colorScheme="green">{tx.status}</Badge></Td>
                    <Td>{new Date(tx.ts).toLocaleDateString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text color="gray.500">No transactions yet</Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
