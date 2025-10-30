import React, { useState } from 'react';
import { Box, Button, Heading, SimpleGrid, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Coaching() {
  const { API_URL, token } = useAuth();
  const [answers, setAnswers] = useState([2, 2, 2, 2, 2]);
  const [allocation, setAllocation] = useState(null);
  const [sim, setSim] = useState(null);

  function setAnswer(i, v) {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
  }

  async function assess() {
    const res = await fetch(`${API_URL}/coaching/assess`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ answers }) });
    const data = await res.json();
    setAllocation(data.allocation);
  }

  async function simulate() {
    const res = await fetch(`${API_URL}/coaching/simulate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ startValue: 10000, months: 24, allocation }) });
    const data = await res.json();
    setSim(data);
  }

  return (
    <Box>
      <Heading mb={4}>Personalized Investment Coaching</Heading>
      <SimpleGrid columns={[1, 2]} gap={6}>
        <Box>
          {answers.map((v, i) => (
            <Box key={i} mb={4}>
              <Text mb={2}>Question {i + 1}</Text>
              <Slider min={0} max={4} step={1} value={v} onChange={val => setAnswer(i, val)}>
                <SliderTrack><SliderFilledTrack /></SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          ))}
          <Button onClick={assess} mr={2}>Get Recommendation</Button>
          {allocation && <Button onClick={simulate}>Simulate Growth</Button>}
        </Box>
        <Box>
          {allocation && (
            <Box mb={4}>
              <Text>Recommended Allocation:</Text>
              <pre>{JSON.stringify(allocation, null, 2)}</pre>
            </Box>
          )}
          {sim && (
            <Box>
              <Text>Simulation (24 months): final ${sim.finalValue}</Text>
            </Box>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
}


