import React, { useState } from 'react';
import { Box, Button, Heading, Input, SimpleGrid, Stat, StatLabel, StatNumber, Text, Card, CardBody, CardHeader, VStack, Badge, CircularProgress, CircularProgressLabel } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function CreditRisk() {
  const { API_URL, token } = useAuth();
  const [income, setIncome] = useState(3000);
  const [debts, setDebts] = useState(500);
  const [assets, setAssets] = useState(10000);
  const [expenses, setExpenses] = useState(1200);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function score() {
    setLoading(true);
    const res = await fetch(`${API_URL}/credit-risk/score`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ income: Number(income), debts: Number(debts), assets: Number(assets), expenses: Number(expenses) }) });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  const riskColor = result ? (result.score >= 750 ? 'green' : result.score >= 650 ? 'yellow' : 'red') : 'gray';
  const riskLevel = result ? (result.score >= 750 ? 'Excellent' : result.score >= 650 ? 'Good' : result.score >= 550 ? 'Fair' : 'Poor') : 'N/A';

  return (
    <Box p={6}>
      <Heading mb={6}>AI-Powered Credit Risk Assessment</Heading>
      <SimpleGrid columns={[1, 2]} gap={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Financial Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text mb={2} fontWeight="medium">Monthly Income ($)</Text>
                <Input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="Enter income" />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">Total Debts ($)</Text>
                <Input type="number" value={debts} onChange={e => setDebts(e.target.value)} placeholder="Enter debts" />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">Total Assets ($)</Text>
                <Input type="number" value={assets} onChange={e => setAssets(e.target.value)} placeholder="Enter assets" />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">Monthly Expenses ($)</Text>
                <Input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} placeholder="Enter expenses" />
              </Box>
              <Button onClick={score} isLoading={loading} colorScheme="blue" size="lg" mt={2}>Calculate Risk Score</Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Risk Assessment Results</Heading>
          </CardHeader>
          <CardBody>
            {result ? (
              <VStack spacing={6} align="stretch">
                <Box textAlign="center">
                  <CircularProgress size="150px" value={(result.score / 850) * 100} color={`${riskColor}.500`}>
                    <CircularProgressLabel>
                      <Text fontSize="2xl" fontWeight="bold">{result.score}</Text>
                      <Badge colorScheme={riskColor} fontSize="sm">{riskLevel}</Badge>
                    </CircularProgressLabel>
                  </CircularProgress>
                </Box>
                
                <SimpleGrid columns={2} gap={4}>
                  <Box p={4} bg={`${result.eligible ? 'green' : 'red'}.50`} borderRadius="md">
                    <Text fontSize="sm" color="gray.600">Eligibility</Text>
                    <Text fontSize="xl" fontWeight="bold" color={result.eligible ? 'green.600' : 'red.600'}>
                      {result.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                    </Text>
                  </Box>
                  <Box p={4} bg="blue.50" borderRadius="md">
                    <Text fontSize="sm" color="gray.600">Default Probability</Text>
                    <Text fontSize="xl" fontWeight="bold" color="blue.600">
                      {(result.probabilityOfDefault * 100).toFixed(1)}%
                    </Text>
                  </Box>
                </SimpleGrid>

                <Box mt={4}>
                  <Text fontSize="sm" color="gray.600" mb={2}>Score Breakdown</Text>
                  <Progress value={(result.score / 850) * 100} colorScheme={riskColor} size="lg" />
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Scores range from 300-850. Higher is better.
                  </Text>
                </Box>
              </VStack>
            ) : (
              <Text color="gray.500" textAlign="center" py={8}>
                Enter your financial information and click "Calculate Risk Score" to see results
              </Text>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
