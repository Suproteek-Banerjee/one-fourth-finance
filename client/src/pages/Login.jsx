import React, { useState } from 'react';
import { Box, Button, Heading, Input, Stack, Text, Card, CardBody } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('investor@off.demo');
  const [password, setPassword] = useState('Investor123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      nav('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <Card>
        <CardBody>
          <Heading mb={6}>Login to One-Fourth Finance</Heading>
          <form onSubmit={onSubmit}>
            <Stack gap={4}>
              <Box>
                <Text mb={2} fontWeight="medium">Email</Text>
                <Input placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">Password</Text>
                <Input placeholder="Enter your password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </Box>
              {error && <Text color="red.500">{error}</Text>}
              <Button type="submit" colorScheme="blue" size="lg" isLoading={loading} w="full">Login</Button>
            </Stack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
}
