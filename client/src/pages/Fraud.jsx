import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Text, Card, CardBody, CardHeader, SimpleGrid, Badge, HStack, Icon, VStack } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';
import { WarningIcon } from '@chakra-ui/icons';

export default function Fraud() {
  const { API_URL, token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  async function simulate() {
    setLoading(true);
    const sample = [
      { id: 'tx1', amount: 15000, country: 'home', retries: 0 },
      { id: 'tx2', amount: 2500, country: 'abroad', retries: 1 },
      { id: 'tx3', amount: 100, country: 'home', retries: 5 }
    ];
    await fetch(`${API_URL}/fraud/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ transactions: sample }) });
    await load();
    setLoading(false);
  }

  async function load() {
    const res = await fetch(`${API_URL}/fraud/alerts`, { headers: { Authorization: `Bearer ${token}` } });
    setAlerts(await res.json());
  }

  useEffect(() => { load(); }, []);

  const getColorScheme = (level) => {
    if (level === 'high') return 'red';
    if (level === 'medium') return 'orange';
    return 'yellow';
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Advanced Fraud Detection</Heading>
      
      <Card mb={6}>
        <CardBody>
          <Text mb={4}>Test the fraud detection system with simulated transactions</Text>
          <Button onClick={simulate} isLoading={loading} colorScheme="blue">Simulate Suspicious Transactions</Button>
        </CardBody>
      </Card>

      <Heading size="md" mb={4}>Recent Fraud Alerts</Heading>
      {alerts.length > 0 ? (
        <SimpleGrid columns={[1, 2, 3]} gap={6}>
          {alerts.map((alert) => (
            <Card key={alert.id} borderLeft="4px" borderLeftColor={getColorScheme(alert.level) + '.500'}>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Icon as={WarningIcon} color={`${getColorScheme(alert.level)}.500`} boxSize={6} />
                    <Badge colorScheme={getColorScheme(alert.level)} fontSize="md">
                      {alert.level.toUpperCase()}
                    </Badge>
                  </HStack>
                  <Text fontWeight="medium">{alert.message}</Text>
                  <Text fontSize="sm" color="gray.600">Transaction ID: {alert.txId}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(alert.ts).toLocaleString()}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Card>
          <CardBody>
            <Text textAlign="center" color="gray.500" py={8}>No fraud alerts detected</Text>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}
