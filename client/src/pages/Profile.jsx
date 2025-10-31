import React, { useState } from 'react';
import { Box, Heading, Card, CardBody, CardHeader, SimpleGrid, Text, Input, Button, VStack, HStack, Badge, Avatar, useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, token, API_URL } = useAuth();
  const toast = useToast();
  const [kyc, setKyc] = useState({ country: '', idType: '', idNumber: '' });
  const [loading, setLoading] = useState(false);

  async function submitKYC() {
    if (!kyc.country || !kyc.idType || !kyc.idNumber) {
      toast({ title: 'Please fill all fields', status: 'warning' });
      return;
    }
    setLoading(true);
    const res = await fetch(`${API_URL}/auth/kyc`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
      body: JSON.stringify({ ...kyc }) 
    });
    const data = await res.json();
    toast({ title: `KYC ${data.status}`, status: data.status === 'approved' ? 'success' : 'error' });
    setLoading(false);
  }

  return (
    <Box p={6}>
      <Heading mb={6}>Profile Settings</Heading>
      
      <SimpleGrid columns={[1, 2]} gap={6} mb={8}>
        <Card>
          <CardHeader>
            <HStack>
              <Avatar name={user.name} size="lg" />
              <Box>
                <Heading size="md">{user.name}</Heading>
                <Text color="gray.600">{user.email}</Text>
              </Box>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text>Role</Text>
                <Badge colorScheme="blue">{user.role}</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>Education Verified</Text>
                <Badge colorScheme={user.eduVerified ? 'green' : 'gray'}>
                  {user.eduVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">KYC Verification</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text mb={2} fontWeight="medium">Country</Text>
                <Input placeholder="e.g., US, UK, IN" value={kyc.country} onChange={e => setKyc({ ...kyc, country: e.target.value })} />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">ID Type</Text>
                <Input placeholder="e.g., Passport, Driver License" value={kyc.idType} onChange={e => setKyc({ ...kyc, idType: e.target.value })} />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">ID Number</Text>
                <Input placeholder="ID Number" value={kyc.idNumber} onChange={e => setKyc({ ...kyc, idNumber: e.target.value })} />
              </Box>
              <Button onClick={submitKYC} isLoading={loading} colorScheme="blue" w="full">Submit KYC</Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}

