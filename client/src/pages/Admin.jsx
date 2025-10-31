import React, { useEffect, useState } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Card, CardBody, CardHeader, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Admin() {
  const { API_URL, token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/admin/metrics`, { headers: { Authorization: `Bearer ${token}` } });
      setMetrics(await res.json());
      setLoading(false);
    }
    load();
  }, [API_URL, token]);

  if (loading) {
    return <Box p={8}><Text>Loading...</Text></Box>;
  }

  return (
    <Box p={6}>
      <Heading mb={6}>Admin Dashboard</Heading>
      <Heading size="md" mb={4}>Platform Metrics</Heading>
      <SimpleGrid columns={[1, 2, 3, 5]} gap={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Total Users</StatLabel>
              <StatNumber color="blue.500" fontSize="2xl">{metrics?.users || 0}</StatNumber>
              <StatHelpText>Registered</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Active Loans</StatLabel>
              <StatNumber color="green.500" fontSize="2xl">{metrics?.loans || 0}</StatNumber>
              <StatHelpText>Microfinance</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Insurance Policies</StatLabel>
              <StatNumber color="purple.500" fontSize="2xl">{metrics?.policies || 0}</StatNumber>
              <StatHelpText>Active</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Properties</StatLabel>
              <StatNumber color="orange.500" fontSize="2xl">{metrics?.properties || 0}</StatNumber>
              <StatHelpText>Tokenized</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Fraud Alerts</StatLabel>
              <StatNumber color="red.500" fontSize="2xl">{metrics?.alerts || 0}</StatNumber>
              <StatHelpText>Total</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
