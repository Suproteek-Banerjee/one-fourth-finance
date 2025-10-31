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
      <Heading mb={6} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Admin Dashboard</Heading>
      <Heading size="md" mb={4}>Platform Metrics</Heading>
      <SimpleGrid columns={[1, 2, 3, 5]} gap={6} mb={8}>
        <Card bgGradient="linear(to-br, blue.400, blue.600)" color="white" boxShadow="2xl">
          <CardBody>
            <Stat>
              <StatLabel opacity={0.9}>Total Users</StatLabel>
              <StatNumber fontSize="3xl">{metrics?.users || 0}</StatNumber>
              <StatHelpText opacity={0.8}>Registered</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bgGradient="linear(to-br, green.400, green.600)" color="white" boxShadow="2xl">
          <CardBody>
            <Stat>
              <StatLabel opacity={0.9}>Active Loans</StatLabel>
              <StatNumber fontSize="3xl">{metrics?.loans || 0}</StatNumber>
              <StatHelpText opacity={0.8}>Microfinance</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bgGradient="linear(to-br, purple.400, purple.600)" color="white" boxShadow="2xl">
          <CardBody>
            <Stat>
              <StatLabel opacity={0.9}>Insurance Policies</StatLabel>
              <StatNumber fontSize="3xl">{metrics?.policies || 0}</StatNumber>
              <StatHelpText opacity={0.8}>Active</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bgGradient="linear(to-br, orange.400, orange.600)" color="white" boxShadow="2xl">
          <CardBody>
            <Stat>
              <StatLabel opacity={0.9}>Properties</StatLabel>
              <StatNumber fontSize="3xl">{metrics?.properties || 0}</StatNumber>
              <StatHelpText opacity={0.8}>Tokenized</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bgGradient="linear(to-br, red.400, red.600)" color="white" boxShadow="2xl">
          <CardBody>
            <Stat>
              <StatLabel opacity={0.9}>Fraud Alerts</StatLabel>
              <StatNumber fontSize="3xl">{metrics?.alerts || 0}</StatNumber>
              <StatHelpText opacity={0.8}>Total</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
