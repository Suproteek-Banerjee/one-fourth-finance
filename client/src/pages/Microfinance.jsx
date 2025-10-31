import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Input, Text, Card, CardBody, CardHeader, SimpleGrid, VStack, HStack, Badge, Divider, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Microfinance() {
  const { API_URL, token } = useAuth();
  const toast = useToast();
  const [amount, setAmount] = useState(1000);
  const [income, setIncome] = useState(1200);
  const [creditScore, setCreditScore] = useState(680);
  const [result, setResult] = useState(null);
  const [myLoans, setMyLoans] = useState({ borrower: [], lender: [] });
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  async function apply() {
    setLoading(true);
    const res = await fetch(`${API_URL}/microfinance/apply`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ amount: Number(amount), income: Number(income), creditScore: Number(creditScore) }) });
    const data = await res.json();
    setResult(data);
    toast({ title: data.approved ? 'Loan Approved!' : 'Loan Rejected', status: data.approved ? 'success' : 'error' });
    await loadMy();
    setLoading(false);
  }

  async function fund(loanId) {
    await fetch(`${API_URL}/microfinance/fund`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ loanId, amount: 200 }) });
    toast({ title: 'Funded $200 to loan', status: 'success' });
    await loadMy();
  }

  async function loadMy() {
    const res = await fetch(`${API_URL}/microfinance/my-loans`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMyLoans(data);
  }

  async function viewSchedule(loanId) {
    const res = await fetch(`${API_URL}/microfinance/repayment-schedule/${loanId}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setSchedule(data.schedule);
    onOpen();
  }

  useEffect(() => { loadMy(); }, []);

  return (
    <Box p={6}>
      <Heading mb={6} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Cross-Border Microfinance</Heading>
      
      <Card mb={8} bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
        <CardHeader>
          <Heading size="md">Apply for a Loan</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={[1, 3]} gap={4}>
            <Box>
              <Text mb={2} fontWeight="medium">Loan Amount ($)</Text>
              <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
            </Box>
            <Box>
              <Text mb={2} fontWeight="medium">Monthly Income ($)</Text>
              <Input type="number" placeholder="Income" value={income} onChange={e => setIncome(e.target.value)} />
            </Box>
            <Box>
              <Text mb={2} fontWeight="medium">Credit Score</Text>
              <Input type="number" placeholder="Credit Score" value={creditScore} onChange={e => setCreditScore(e.target.value)} />
            </Box>
          </SimpleGrid>
          <Button onClick={apply} isLoading={loading} colorScheme="blue" size="lg" mt={4} w="full">Apply for Loan</Button>
          
          {result && (
            <Box mt={4} p={4} bgGradient={`linear(to-r, ${result.approved ? 'green' : 'red'}.100, ${result.approved ? 'green' : 'red'}.200)`} borderRadius="md">
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="bold" fontSize="lg">{result.approved ? 'Loan Approved!' : 'Loan Rejected'}</Text>
                  <Text fontSize="sm" color="gray.600">Approval Probability: {Math.round(result.approvalProbability * 100)}%</Text>
                </Box>
                <Badge colorScheme={result.approved ? 'green' : 'red'} fontSize="md" px={4} py={2}>
                  {result.approved ? 'APPROVED' : 'REJECTED'}
                </Badge>
              </HStack>
            </Box>
          )}
        </CardBody>
      </Card>

      <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
        <CardHeader>
          <Heading size="md">My Loans</Heading>
        </CardHeader>
        <CardBody>
          <Tabs>
            <TabList>
              <Tab>As Borrower ({myLoans.borrower.length})</Tab>
              <Tab>As Lender ({myLoans.lender.length})</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {myLoans.borrower.length > 0 ? (
                  <VStack align="stretch" spacing={4}>
                    {myLoans.borrower.map((loan) => (
                      <Card key={loan.id}>
                        <CardBody>
                          <HStack justify="space-between">
                            <Box>
                              <Text fontWeight="bold">${loan.amount.toLocaleString()}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {loan.termMonths} months @ {(loan.rate * 100).toFixed(0)}%
                              </Text>
                            </Box>
                            <Badge colorScheme={loan.status === 'active' ? 'green' : loan.status === 'pending_funding' ? 'yellow' : 'red'}>
                              {loan.status}
                            </Badge>
                          </HStack>
                          <Divider my={3} />
                          <Text fontSize="sm">Funded: ${loan.funded.toLocaleString()} / ${loan.amount.toLocaleString()}</Text>
                          <HStack mt={3} spacing={2}>
                            {loan.status === 'pending_funding' && (
                              <Button size="sm" onClick={() => fund(loan.id)}>Fund $200</Button>
                            )}
                            {loan.status === 'active' && (
                              <Button size="sm" onClick={() => viewSchedule(loan.id)} variant="outline">View Schedule</Button>
                            )}
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500">No borrower loans</Text>
                )}
              </TabPanel>

              <TabPanel>
                {myLoans.lender.length > 0 ? (
                  <VStack align="stretch" spacing={4}>
                    {myLoans.lender.map((loan) => (
                      <Card key={loan.id}>
                        <CardBody>
                          <HStack justify="space-between">
                            <Box>
                              <Text fontWeight="bold">${loan.amount.toLocaleString()}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {loan.termMonths} months @ {(loan.rate * 100).toFixed(0)}%
                              </Text>
                            </Box>
                            <Badge colorScheme={loan.status === 'active' ? 'green' : 'yellow'}>
                              {loan.status}
                            </Badge>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500">No lender loans</Text>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Loan Repayment Schedule</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {schedule.length > 0 ? (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Installment</Th>
                    <Th>Payment</Th>
                    <Th>Principal</Th>
                    <Th>Interest</Th>
                    <Th>Balance</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {schedule.map((item) => (
                    <Tr key={item.installment}>
                      <Td>{item.installment}</Td>
                      <Td>${item.payment.toFixed(2)}</Td>
                      <Td>${item.principal.toFixed(2)}</Td>
                      <Td>${item.interest.toFixed(2)}</Td>
                      <Td>${item.balance.toFixed(2)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text>Loading schedule...</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
