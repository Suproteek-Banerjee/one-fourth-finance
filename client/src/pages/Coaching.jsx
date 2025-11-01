import React, { useState } from 'react';
import { Box, Button, Heading, SimpleGrid, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text, Card, CardBody, CardHeader, VStack, Badge, HStack, Icon, useToast } from '@chakra-ui/react';
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ArrowUpIcon, InfoIcon } from '@chakra-ui/icons';

const questions = [
  { text: 'How comfortable are you with investment risk?', emoji: '🎲', options: ['Very Conservative', 'Conservative', 'Balanced', 'Aggressive', 'Very Aggressive'] },
  { text: 'What is your investment timeline?', emoji: '⏰', options: ['< 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'] },
  { text: 'How would you react to a 20% portfolio drop?', emoji: '📉', options: ['Panic & sell', 'Worried but hold', 'Neutral', 'Buy more', 'Stay calm'] },
  { text: 'What percentage of income do you invest?', emoji: '💼', options: ['< 5%', '5-10%', '10-20%', '20-30%', '> 30%'] },
  { text: 'Experience level with investments?', emoji: '🎓', options: ['Beginner', 'Some experience', 'Intermediate', 'Advanced', 'Expert'] }
];

function mapRiskToAllocation(score) {
  if (score < 30) return { stocks: 0.3, bonds: 0.5, realEstate: 0.15, crypto: 0.05 };
  if (score < 50) return { stocks: 0.45, bonds: 0.35, realEstate: 0.15, crypto: 0.05 };
  if (score < 70) return { stocks: 0.6, bonds: 0.25, realEstate: 0.1, crypto: 0.05 };
  return { stocks: 0.7, bonds: 0.15, realEstate: 0.1, crypto: 0.05 };
}

function simulateGrowth(startValue, months, allocation) {
  const history = [];
  let currentValue = startValue;
  const monthlyReturn = 0.007; // ~8.4% annual
  
  for (let i = 0; i <= months; i++) {
    history.push({ month: i, value: Math.round(currentValue) });
    if (i < months) {
      currentValue = currentValue * (1 + monthlyReturn);
    }
  }
  
  return { finalValue: Math.round(currentValue), history };
}

export default function Coaching() {
  const toast = useToast();
  const [answers, setAnswers] = useState([2, 2, 2, 2, 2]);
  const [allocation, setAllocation] = useState(null);
  const [sim, setSim] = useState(null);
  const [riskScore, setRiskScore] = useState(null);

  function setAnswer(i, v) {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
  }

  function assess() {
    const score = answers.reduce((a, b) => a + Number(b || 0), 0) * 5;
    const alloc = mapRiskToAllocation(score);
    setAllocation(alloc);
    setRiskScore(score);
    toast({ title: 'Recommendation generated!', status: 'success' });
  }

  function simulate() {
    if (!allocation) {
      toast({ title: 'Please get an AI recommendation first', status: 'warning' });
      return;
    }
    const result = simulateGrowth(10000, 24, allocation);
    setSim(result);
    toast({ title: 'Simulation complete!', status: 'success' });
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
                    onChange={v => setAnswer(i, v)}
                    colorScheme="blue"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text fontSize="xs" color="gray.500" mt={1}>{q.options[answers[i]]}</Text>
                </Box>
              ))}
              <Button onClick={assess} colorScheme="blue" size="lg" leftIcon={<ArrowUpIcon />}>
                Get AI Recommendation
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader>
            <Heading size="md">Recommended Portfolio</Heading>
          </CardHeader>
          <CardBody>
            {allocation ? (
              <VStack align="stretch" spacing={6}>
                <Box textAlign="center" p={6} bgGradient="linear(to-br, blue.50, purple.50)" borderRadius="lg">
                  <Text fontSize="sm" color="gray.600" mb={2}>Risk Score</Text>
                  <Text fontSize="4xl" fontWeight="bold" color="blue.600">{riskScore}</Text>
                  <Badge mt={2} colorScheme={riskScore < 30 ? 'green' : riskScore < 50 ? 'yellow' : riskScore < 70 ? 'orange' : 'red'}>
                    {riskScore < 30 ? 'Conservative' : riskScore < 50 ? 'Balanced' : riskScore < 70 ? 'Moderate' : 'Aggressive'}
                  </Badge>
                </Box>
                
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={allocationData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text>Stocks</Text>
                    <Badge colorScheme="blue">{(allocation.stocks * 100).toFixed(0)}%</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Bonds</Text>
                    <Badge colorScheme="green">{(allocation.bonds * 100).toFixed(0)}%</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Real Estate</Text>
                    <Badge colorScheme="yellow">{(allocation.realEstate * 100).toFixed(0)}%</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Crypto</Text>
                    <Badge colorScheme="orange">{(allocation.crypto * 100).toFixed(0)}%</Badge>
                  </HStack>
                </VStack>
              </VStack>
            ) : (
              <Box textAlign="center" py={12}>
                <Icon as={InfoIcon} fontSize="5xl" color="gray.300" mb={4} />
                <Text color="gray.600">Complete the assessment to see your recommended portfolio</Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {sim && (
        <Card mt={8} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader>
            <Heading size="md">Portfolio Growth Simulation</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={6}>
              <Box textAlign="center" p={6} bgGradient="linear(to-br, green.50, green.100)" borderRadius="lg">
                <Text fontSize="sm" color="gray.600" mb={2}>Projected Value After 24 Months</Text>
                <Text fontSize="4xl" fontWeight="bold" color="green.600">${sim.finalValue.toLocaleString()}</Text>
                <Badge mt={2} colorScheme="green">+${(sim.finalValue - 10000).toLocaleString()} growth</Badge>
              </Box>
              
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={simData}>
                  <defs>
                    <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorSim)" />
                </AreaChart>
              </ResponsiveContainer>
            </VStack>
          </CardBody>
        </Card>
      )}

      {allocation && (
        <Card mt={8} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
          <CardBody>
            <Button onClick={simulate} colorScheme="green" size="lg" w="full" leftIcon={<ArrowUpIcon />}>
              Run Growth Simulation
            </Button>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}
