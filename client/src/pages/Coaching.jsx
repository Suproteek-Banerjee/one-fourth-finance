import React, { useState } from 'react';
import { Box, Button, Heading, SimpleGrid, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text, Card, CardBody, CardHeader, VStack, Progress, Badge, HStack, Icon, Alert, AlertIcon, AlertDescription } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ArrowUpIcon, InfoIcon, ChevronRightIcon } from '@chakra-ui/icons';

const questions = [
  { text: 'How comfortable are you with investment risk?', emoji: '🎲', options: ['Very Conservative', 'Conservative', 'Balanced', 'Aggressive', 'Very Aggressive'] },
  { text: 'What is your investment timeline?', emoji: '⏰', options: ['< 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'] },
  { text: 'How would you react to a 20% portfolio drop?', emoji: '📉', options: ['Panic & sell', 'Worried but hold', 'Neutral', 'Buy more', 'Stay calm'] },
  { text: 'What percentage of income do you invest?', emoji: '💼', options: ['< 5%', '5-10%', '10-20%', '20-30%', '> 30%'] },
  { text: 'Experience level with investments?', emoji: '🎓', options: ['Beginner', 'Some experience', 'Intermediate', 'Advanced', 'Expert'] }
];

export default function Coaching() {
  const { API_URL, token, loading: authLoading } = useAuth();
  const [answers, setAnswers] = useState([2, 2, 2, 2, 2]);
  const [allocation, setAllocation] = useState(null);
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [riskScore, setRiskScore] = useState(null);

  function setAnswer(i, v) {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
  }

  async function assess() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/coaching/assess`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ answers }) });
      if (res.ok) {
        const data = await res.json();
        setAllocation(data.allocation);
        setRiskScore(data.score);
      }
    } catch (err) {
      console.error('Assessment failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function simulate() {
    if (!allocation || !token) return;
    try {
      const res = await fetch(`${API_URL}/coaching/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ startValue: 10000, months: 24, allocation }) });
      if (res.ok) {
        const data = await res.json();
        setSim(data);
      }
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  }

  const allocationData = allocation ? [
    { name: 'Stocks', value: (allocation.stocks * 100).toFixed(0), color: '#0088FE' },
    { name: 'Bonds', value: (allocation.bonds * 100).toFixed(0), color: '#00C49F' },
    { name: 'Real Estate', value: (allocation.realEstate * 100).toFixed(0), color: '#FFBB28' },
    { name: 'Crypto', value: (allocation.crypto * 100).toFixed(0), color: '#FF8042' }
  ] : [];

  const simData = sim ? sim.history.map((h, idx) => ({ month: h.month, value: h.value })) : [];
  
  const avgRisk = Math.round(answers.reduce((a, b) => a + b, 0) * 10);

  return (
    <Box p={6}>
      <Heading mb={2} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Personalized Investment Coaching</Heading>
      <Text color="gray.600" mb={6}>Complete the assessment to get AI-powered portfolio recommendations</Text>
      
      <SimpleGrid columns={[1, 2]} gap={6}>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader>
            <Heading size="md">Risk Assessment Questionnaire</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={6}>
              {questions.map((q, i) => (
                <Box key={i} p={4} border="1px solid" borderColor="gray.200" borderRadius="md" bg="white" backdropFilter="blur(10px)" bgColor="rgba(255,255,255,0.6)">
                  <HStack mb={3}>
                    <Text fontSize="2xl">{q.emoji}</Text>
                    <Text fontWeight="medium" flex={1}>{q.text}</Text>
                  </HStack>
                  <Slider 
                    min={0} 
                    max={4} 
                    step={1} 
                    value={answers[i]} 
                    onChange={val => setAnswer(i, val)}
                    colorScheme={answers[i] === 0 ? 'blue' : answers[i] === 4 ? 'red' : 'purple'}
                  >
                    <SliderTrack bg="gray.200" height="8px" borderRadius="4px">
                      <SliderFilledTrack bg={`${answers[i] === 0 ? 'blue' : answers[i] === 4 ? 'red' : 'purple'}.500`} />
                    </SliderTrack>
                    <SliderThumb boxSize={6} borderWidth="3px" borderColor="white" />
                  </Slider>
                  <HStack justify="space-between" mt={2}>
                    <Text fontSize="xs" color="gray.600">{q.options[0]}</Text>
                    <Badge colorScheme={answers[i] === 0 ? 'blue' : answers[i] === 4 ? 'red' : 'purple'} fontSize="sm">
                      {q.options[answers[i]]}
                    </Badge>
                    <Text fontSize="xs" color="gray.600">{q.options[4]}</Text>
                  </HStack>
                </Box>
              ))}
              
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  Your current risk score: <strong>{avgRisk}</strong> / 100
                </AlertDescription>
              </Alert>
              
              <Button onClick={assess} isLoading={loading} colorScheme="blue" size="lg" w="full" leftIcon={<ArrowUpIcon />}>
                Get AI Recommendation
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader>
            <Heading size="md">AI-Powered Recommendations</Heading>
          </CardHeader>
          <CardBody>
            {allocation ? (
              <VStack align="stretch" spacing={6}>
                <Box textAlign="center" p={4} bgGradient={`linear(to-r, ${riskScore >= 50 ? 'red' : 'blue'}.400, ${riskScore >= 50 ? 'red' : 'blue'}.600)`} color="white" borderRadius="md" boxShadow="lg">
                  <Text fontSize="xs" opacity={0.9} mb={1}>Your Risk Profile</Text>
                  <Badge fontSize="lg" px={4} py={2} bg="white" color={riskScore >= 50 ? 'red' : 'blue'}>
                    {riskScore >= 75 ? 'Very Aggressive' : riskScore >= 50 ? 'Aggressive' : riskScore >= 25 ? 'Balanced' : 'Conservative'}
                  </Badge>
                </Box>
                
                <Text fontWeight="bold" color="gray.700">Recommended Portfolio Allocation</Text>
                {allocationData.map((item, idx) => (
                  <Box key={idx}>
                    <HStack mb={2}>
                      <Icon as={InfoIcon} color={item.color} />
                      <Text fontWeight="medium" flex={1}>{item.name}</Text>
                      <Badge fontSize="md" px={3} py={1} colorScheme={item.color === '#0088FE' ? 'blue' : item.color === '#00C49F' ? 'green' : item.color === '#FFBB28' ? 'yellow' : 'orange'}>
                        {item.value}%
                      </Badge>
                    </HStack>
                    <Progress 
                      value={item.value} 
                      colorScheme={item.color === '#0088FE' ? 'blue' : item.color === '#00C49F' ? 'green' : item.color === '#FFBB28' ? 'yellow' : 'orange'} 
                      size="lg" 
                      borderRadius="full"
                    />
                  </Box>
                ))}
                
                <Box mt={4}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie 
                        data={allocationData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60}
                        outerRadius={80} 
                        fill="#8884d8" 
                        dataKey="value"
                        paddingAngle={5}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                
                <Button onClick={simulate} colorScheme="green" mt={4} leftIcon={<ChevronRightIcon />}>
                  Simulate Growth (24 months)
                </Button>
                
                {sim && (
                  <Box mt={4}>
                    <Box textAlign="center" p={4} bgGradient="linear(to-r, green.400, green.600)" color="white" borderRadius="md" mb={4} boxShadow="lg">
                      <Text fontSize="xs" opacity={0.9} mb={1}>Projected Final Value</Text>
                      <Text fontSize="3xl" fontWeight="bold">
                        ${sim.finalValue.toLocaleString()}
                      </Text>
                      <Text fontSize="sm" opacity={0.9}>
                        Starting from $10,000
                      </Text>
                    </Box>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={simData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#48BB78" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#48BB78" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Area type="monotone" dataKey="value" stroke="#48BB78" fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </VStack>
            ) : (
              <Box textAlign="center" py={12}>
                <Icon as={InfoIcon} fontSize="4xl" color="gray.300" mb={4} />
                <Text color="gray.500" fontSize="lg">Complete the questionnaire to get personalized recommendations</Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
