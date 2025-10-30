import React, { useEffect, useState } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatHelpText, StatLabel, StatNumber } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { API_URL, token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setData(json);
    }
    load();
  }, [API_URL, token]);

  const portfolioValue = data?.portfolio?.value || 0;
  const loansCount = data?.loans?.length || 0;
  const policiesCount = data?.policies?.length || 0;
  const pensionBalance = data?.pension?.balance || 0;

  return (
    <Box>
      <Heading mb={6}>Unified Dashboard</Heading>
      <SimpleGrid columns={[1, 2, 4]} gap={6}>
        <Stat>
          <StatLabel>Portfolio Value</StatLabel>
          <StatNumber>${portfolioValue.toLocaleString()}</StatNumber>
          <StatHelpText>Investments</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Active Loans</StatLabel>
          <StatNumber>{loansCount}</StatNumber>
          <StatHelpText>Borrower + Lender</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Policies</StatLabel>
          <StatNumber>{policiesCount}</StatNumber>
          <StatHelpText>Insurance</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Pension Balance</StatLabel>
          <StatNumber>${pensionBalance.toLocaleString()}</StatNumber>
          <StatHelpText>Crypto-Pension</StatHelpText>
        </Stat>
      </SimpleGrid>
    </Box>
  );
}


