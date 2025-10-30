import React, { useState } from 'react';
import { Box, Button, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('investor@off.demo');
  const [password, setPassword] = useState('Investor123!');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      nav('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  }

  return (
    <Box maxW="md" mx="auto">
      <Heading mb={6}>Login</Heading>
      <form onSubmit={onSubmit}>
        <Stack gap={4}>
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <Text color="red.500">{error}</Text>}
          <Button type="submit">Login</Button>
        </Stack>
      </form>
    </Box>
  );
}


