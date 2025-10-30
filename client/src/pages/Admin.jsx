import React, { useEffect, useState } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Admin() {
  const { API_URL, token } = useAuth();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/admin/metrics`, { headers: { Authorization: `Bearer ${token}` } });
      setMetrics(await res.json());
    }
    load();
  }, []);

  return (
    <Box>
      <Heading mb={4}>Admin Panel</Heading>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </Box>
  );
}


