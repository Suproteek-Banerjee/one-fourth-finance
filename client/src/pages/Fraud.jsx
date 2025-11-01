import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Text, Card, CardBody, CardHeader, SimpleGrid, Badge, HStack, Icon, VStack } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';
import { WarningIcon } from '@chakra-ui/icons';

export default function Fraud() {
  const { API_URL, token, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  async function simulate() {
    if (!token) return;
    setLoading(true);
    try {
      const sample = [
        { id: 'tx1', amount: 15000, country: 'home', retries: 0 },
        { id: 'tx2', amount: 2500, country: 'abroad', retries: 1 },
        { id: 'tx3', amount: 100, country: 'home', retries: 5 }
      ];
      const res = await fetch(`${API_URL}/fraud/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ transactions: sample }) });
      if (res.ok) {
        await load();
      }
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function load() {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/fraud/alerts`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setAlerts(await res.json());
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  }

  useEffect(() => {
    if (!authLoading && token) {
      load();
    }
  }, [API_URL, token, authLoading]);

  const getColorScheme = (level) => {
    if (level === 'high') return 'red';
    if (level === 'medium') return 'orange';
    return 'yellow';
  };

  return (
    <Box p={6}>
      <Heading mb={6} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Advanced Fraud Detection</Heading>
      
      <Card mb={6} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
        <CardBody>
          <Text mb={4}>Test the fraud detection system with simulated transactions</Text>
          <Button onClick={simulate} isLoading={loading} colorScheme="blue">Simulate Suspicious Transactions</Button>
        </CardBody>
      </Card>

      <Heading size="md" mb={4}>Recent Fraud Alerts</Heading>
      {alerts.length > 0 ? (
        <SimpleGrid columns={[1, 2, 3]} gap={6}>
          {alerts.map((alert) => (
            <Card key={alert.id} bgGradient={`linear(to-br, ${getColorScheme(alert.level)}.50, ${getColorScheme(alert.level)}.100)`} boxShadow="xl" borderLeft={`4px solid`} borderLeftColor={`${getColorScheme(alert.level)}.500`}>
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
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl" border="1px solid rgba(255,255,255,0.5)">
          <CardBody>
            <Text textAlign="center" color="gray.500" py={8}>No fraud alerts detected</Text>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}
