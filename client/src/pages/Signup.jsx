import React, { useState } from 'react';
import { Box, Button, Heading, Input, Stack, Text } from '@chakra-ui/react';
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

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await signup({ email, password, name, eduEmail });
      nav('/dashboard');
    } catch (err) {
      setError('Signup failed');
    }
  }

  return (
    <Box maxW="md" mx="auto">
      <Heading mb={6}>Sign Up</Heading>
      <form onSubmit={onSubmit}>
        <Stack gap={4}>
          <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <Input placeholder="Optional .edu email" value={eduEmail} onChange={e => setEduEmail(e.target.value)} />
          {error && <Text color="red.500">{error}</Text>}
          <Button type="submit">Create Account</Button>
        </Stack>
      </form>
    </Box>
  );
}


