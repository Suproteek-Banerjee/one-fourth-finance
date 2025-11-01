import React, { useState } from 'react';
import { Box, Button, Heading, Text, Card, CardBody, CardHeader, SimpleGrid, Badge, HStack, Icon, VStack, useToast } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';

// Mock data - no API calls
const MOCK_ALERTS = [
  {
    id: '1',
    message: 'Unusual transaction pattern detected',
    txId: 'TX-12345',
    level: 'medium',
    ts: Date.now() - 3600000
  }
];

export default function Fraud() {
  const toast = useToast();
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  function simulate() {
    // Generate random suspicious transactions
    const suspiciousTransactions = [
      { amount: 15000, country: 'abroad', retries: 0, type: 'large_amount' },
      { amount: 2500, country: 'abroad', retries: 3, type: 'multiple_retries' },
      { amount: 50000, country: 'home', retries: 0, type: 'very_large_amount' },
      { amount: 100, country: 'home', retries: 8, type: 'excessive_retries' },
      { amount: 8500, country: 'abroad', retries: 2, type: 'foreign_large' }
    ];

    const newAlerts = suspiciousTransactions.map((tx, idx) => {
      let level = 'low';
      let message = '';

      if (tx.type === 'very_large_amount') {
        level = 'high';
        message = `Very large transaction detected: $${tx.amount.toLocaleString()}`;
      } else if (tx.type === 'excessive_retries') {
        level = 'high';
        message = `Excessive retry attempts detected: ${tx.retries} retries for $${tx.amount}`;
      } else if (tx.type === 'large_amount' && tx.country === 'abroad') {
        level = 'high';
        message = `Large foreign transaction: $${tx.amount.toLocaleString()} from ${tx.country}`;
      } else if (tx.type === 'multiple_retries') {
        level = 'medium';
        message = `Multiple retry attempts: ${tx.retries} retries for transaction`;
      } else {
        level = 'medium';
        message = `Suspicious transaction pattern: $${tx.amount.toLocaleString()}`;
      }

      return {
        id: Date.now().toString() + idx,
        message: message,
        txId: `TX-${Math.floor(Math.random() * 100000)}`,
        level: level,
        ts: Date.now() - (idx * 60000) // Stagger timestamps
      };
    });

    setAlerts([...newAlerts, ...alerts]);
    toast({ 
      title: 'Simulation complete!', 
      status: 'success', 
      description: `Generated ${newAlerts.length} fraud alerts` 
    });
  }

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
          <VStack align="stretch" spacing={4}>
            <Text>Test the fraud detection system with simulated transactions. This will generate various suspicious transaction patterns.</Text>
            <Button onClick={simulate} colorScheme="blue" size="lg">Simulate Suspicious Transactions</Button>
          </VStack>
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
