import React, { useState } from 'react';
import { Box, Button, Heading, Input, Stack, Text, Card, CardBody } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [eduEmail, setEduEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup({ email, password, name, eduEmail });
      nav('/dashboard');
    } catch (err) {
      setError('Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <Card>
        <CardBody>
          <Heading mb={6}>Create Account</Heading>
          <form onSubmit={onSubmit}>
            <Stack gap={4}>
              <Box>
                <Text mb={2} fontWeight="medium">Full Name</Text>
                <Input placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">Email</Text>
                <Input placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">Password</Text>
                <Input placeholder="Create a password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">Edu Email (Optional)</Text>
                <Input placeholder="student@university.edu" value={eduEmail} onChange={e => setEduEmail(e.target.value)} />
              </Box>
              {error && <Text color="red.500">{error}</Text>}
              <Button type="submit" colorScheme="blue" size="lg" isLoading={loading} w="full">Create Account</Button>
            </Stack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
}
