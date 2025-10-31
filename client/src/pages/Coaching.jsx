import React, { useState } from 'react';
import { Box, Button, Heading, SimpleGrid, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text, Card, CardBody, CardHeader, VStack, Progress } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const questions = [
  'How comfortable are you with investment risk?',
  'What is your investment timeline?',
  'How would you react to a 20% portfolio drop?',
  'What percentage of income do you invest?',
  'Experience level with investments?'
];

export default function Coaching() {
  const { API_URL, token } = useAuth();
  const [answers, setAnswers] = useState([2, 2, 2, 2, 2]);
  const [allocation, setAllocation] = useState(null);
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(false);

  function setAnswer(i, v) {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
  }

  async function assess() {
    setLoading(true);
    const res = await fetch(`${API_URL}/coaching/assess`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ answers }) });
    const data = await res.json();
    setAllocation(data.allocation);
    setLoading(false);
  }

  async function simulate() {
    if (!allocation) return;
    const res = await fetch(`${API_URL}/coaching/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ startValue: 10000, months: 24, allocation }) });
    const data = await res.json();
    setSim(data);
  }

  const allocationData = allocation ? [
    { name: 'Stocks', value: (allocation.stocks * 100).toFixed(0) },
    { name: 'Bonds', value: (allocation.bonds * 100).toFixed(0) },
    { name: 'Real Estate', value: (allocation.realEstate * 100).toFixed(0) },
    { name: 'Crypto', value: (allocation.crypto * 100).toFixed(0) }
  ] : [];

  const simData = sim ? sim.history.map((h, idx) => ({ month: h.month, value: h.value })) : [];

  return (
    <Box p={6}>
      <Heading mb={6}>Personalized Investment Coaching</Heading>
      <SimpleGrid columns={[1, 2]} gap={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Risk Assessment Questionnaire</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={6}>
              {questions.map((q, i) => (
                <Box key={i}>
                  <Text mb={2} fontWeight="medium">{q}</Text>
                  <Slider min={0} max={4} step={1} value={answers[i]} onChange={val => setAnswer(i, val)}>
                    <SliderTrack bg="gray.200">
                      <SliderFilledTrack bg="blue.500" />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text fontSize="sm" color="gray.600">{answers[i] === 0 ? 'Very Low' : answers[i] === 4 ? 'Very High' : 'Medium'}</Text>
                </Box>
              ))}
              <Button onClick={assess} isLoading={loading} colorScheme="blue" size="lg">Get AI Recommendation</Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">AI-Powered Recommendations</Heading>
          </CardHeader>
          <CardBody>
            {allocation ? (
              <VStack align="stretch" spacing={4}>
                <Text fontWeight="bold" color="gray.700">Recommended Portfolio Allocation</Text>
                {allocationData.map((item, idx) => (
                  <Box key={idx}>
                    <Text mb={1}>{item.name}</Text>
                    <Progress value={item.value} colorScheme="blue" size="lg" />
                    <Text fontSize="sm" color="gray.600">{item.value}%</Text>
                  </Box>
                ))}
                <Button onClick={simulate} colorScheme="green" mt={4}>Simulate Growth (24 months)</Button>
                
                {sim && (
                  <Box mt={4}>
                    <Text fontWeight="bold" mb={2}>Projected Growth</Text>
                    <Text fontSize="2xl" color="green.500">${sim.finalValue.toLocaleString()}</Text>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={simData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#48BB78" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </VStack>
            ) : (
              <Text color="gray.500">Complete the questionnaire to get personalized recommendations</Text>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
