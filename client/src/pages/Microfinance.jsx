import React, { useState } from 'react';
import { Box, Button, Heading, Input, Text, Card, CardBody, CardHeader, SimpleGrid, VStack, HStack, Badge, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, useToast } from '@chakra-ui/react';

// Mock data - no API calls
const MOCK_LOANS = [
  { id: '1', borrowerId: 'user1', amount: 1500, rate: 0.18, termMonths: 12, status: 'active', funded: 900, needed: 600, purpose: 'Small Business' }
];

const MOCK_MY_LOANS = {
  borrower: [
    { id: '2', amount: 1000, rate: 0.15, termMonths: 12, status: 'active', funded: 1000, purpose: 'Education' }
  ],
  lender: []
};

// Get loans from localStorage or use default
const getStoredLoans = () => {
  try {
    const stored = localStorage.getItem('off_loans');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return { borrower: MOCK_MY_LOANS.borrower, lender: MOCK_MY_LOANS.lender };
};

export default function Microfinance() {
  const toast = useToast();
  const [amount, setAmount] = useState(1000);
  const [income, setIncome] = useState(1200);
  const [creditScore, setCreditScore] = useState(680);
  const [result, setResult] = useState(null);
  const [myLoans, setMyLoans] = useState(getStoredLoans());
  const [loans, setLoans] = useState(MOCK_LOANS);
  const [schedule, setSchedule] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  function apply() {
    if (!amount || !income || !creditScore) {
      toast({ title: 'Please fill in all fields', status: 'warning' });
      return;
    }

    // Simple approval logic
    const debtToIncome = (amount / income) * 12;
    const approved = debtToIncome < 0.5 && creditScore >= 600;
    const probability = creditScore >= 700 ? 0.9 : creditScore >= 650 ? 0.7 : creditScore >= 600 ? 0.5 : 0.3;

    setResult({
      approved,
      approvalProbability: probability,
      suggestedRate: approved ? 0.15 : 0.25,
      suggestedAmount: approved ? amount : amount * 0.8
    });

    if (approved) {
      const updatedLoans = {
        ...myLoans,
        borrower: [...myLoans.borrower, {
          id: Date.now().toString(),
          amount: amount,
          rate: 0.15,
          termMonths: 12,
          status: 'active',
          funded: 0,
          purpose: 'New Loan'
        }]
      };
      setMyLoans(updatedLoans);
      localStorage.setItem('off_loans', JSON.stringify(updatedLoans));
      // Dispatch event to notify Profile page
      window.dispatchEvent(new Event('loansUpdated'));
    }

    toast({ title: approved ? 'Loan Approved!' : 'Loan Rejected', status: approved ? 'success' : 'error', description: `Probability: ${Math.round(probability * 100)}%` });
  }

  function fund(loanId) {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const newFunded = Math.min(loan.funded + 200, loan.amount);
    setLoans(loans.map(l => l.id === loanId ? { ...l, funded: newFunded } : l));

    setMyLoans({
      ...myLoans,
      lender: [...myLoans.lender, {
        id: Date.now().toString(),
        loanId: loanId,
        amount: 200,
        status: 'active'
      }]
    });

    toast({ title: 'Successfully funded $200!', status: 'success' });
  }

  function viewSchedule(loanId) {
    const loan = loans.find(l => l.id === loanId) || myLoans.borrower.find(l => l.id === loanId);
    if (!loan) return;

    const monthlyPayment = (loan.amount * (loan.rate / 12)) / (1 - Math.pow(1 + (loan.rate / 12), -loan.termMonths));
    const scheduleData = [];
    let remaining = loan.amount;

    for (let i = 1; i <= loan.termMonths; i++) {
      const interest = remaining * (loan.rate / 12);
      const principal = monthlyPayment - interest;
      remaining -= principal;
      scheduleData.push({
        month: i,
        payment: Math.round(monthlyPayment),
        principal: Math.round(principal),
        interest: Math.round(interest),
        remaining: Math.round(remaining)
      });
    }

    setSchedule(scheduleData);
    onOpen();
  }

  return (
    <Box p={6}>
      <Heading mb={6} bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Microfinance & Peer-to-Peer Lending</Heading>
      
      <SimpleGrid columns={[1, 2]} gap={6} mb={8}>
        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader>
            <Heading size="md">Apply for a Loan</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text mb={2} fontWeight="medium">Loan Amount ($)</Text>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">Monthly Income ($)</Text>
                <Input type="number" value={income} onChange={e => setIncome(e.target.value)} />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">Credit Score</Text>
                <Input type="number" value={creditScore} onChange={e => setCreditScore(e.target.value)} />
              </Box>
              <Button onClick={apply} colorScheme="blue" size="lg">Apply for Loan</Button>
              
              {result && (
                <Box p={4} bg={result.approved ? 'green.50' : 'red.50'} borderRadius="md" border="1px solid" borderColor={result.approved ? 'green.200' : 'red.200'}>
                  <Text fontWeight="bold" mb={2}>{result.approved ? '✓ Approved' : '✗ Rejected'}</Text>
                  <Text fontSize="sm">Approval Probability: {Math.round(result.approvalProbability * 100)}%</Text>
                  {result.approved && (
                    <VStack align="stretch" mt={2} spacing={1}>
                      <Text fontSize="sm">Suggested Rate: {(result.suggestedRate * 100).toFixed(1)}%</Text>
                      <Text fontSize="sm">Suggested Amount: ${result.suggestedAmount}</Text>
                    </VStack>
                  )}
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="2xl" border="1px solid rgba(255,255,255,0.5)">
          <CardHeader>
            <Heading size="md">Available Loans to Fund</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              {loans.filter(l => l.funded < l.amount).map(loan => (
                <Card key={loan.id} size="sm">
                  <CardBody>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">${loan.amount}</Text>
                      <Badge colorScheme="blue">{(loan.rate * 100).toFixed(0)}% APR</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" mb={2}>{loan.purpose}</Text>
                    <Text fontSize="sm">Progress: ${loan.funded} / ${loan.amount}</Text>
                    <Button size="sm" onClick={() => fund(loan.id)} mt={2} w="full">Fund $200</Button>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Tabs>
        <TabList>
          <Tab>My Loans (Borrower)</Tab>
          <Tab>My Funding (Lender)</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl">
              <CardBody>
                {myLoans.borrower.length > 0 ? (
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Amount</Th>
                        <Th>Rate</Th>
                        <Th>Term</Th>
                        <Th>Funded</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {myLoans.borrower.map(loan => (
                        <Tr key={loan.id}>
                          <Td>${loan.amount}</Td>
                          <Td>{(loan.rate * 100).toFixed(1)}%</Td>
                          <Td>{loan.termMonths} months</Td>
                          <Td>${loan.funded} / ${loan.amount}</Td>
                          <Td><Badge colorScheme="green">{loan.status}</Badge></Td>
                          <Td>
                            <Button size="sm" onClick={() => viewSchedule(loan.id)} variant="outline">View Schedule</Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text color="gray.500">No loans as borrower</Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card bg="white" backdropFilter="blur(20px)" bgColor="rgba(255,255,255,0.8)" boxShadow="xl">
              <CardBody>
                {myLoans.lender.length > 0 ? (
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Loan ID</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {myLoans.lender.map(funding => (
                        <Tr key={funding.id}>
                          <Td>{funding.loanId}</Td>
                          <Td>${funding.amount}</Td>
                          <Td><Badge colorScheme="green">{funding.status}</Badge></Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text color="gray.500">No loans funded as lender</Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Repayment Schedule</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Month</Th>
                  <Th>Payment</Th>
                  <Th>Principal</Th>
                  <Th>Interest</Th>
                  <Th>Remaining</Th>
                </Tr>
              </Thead>
              <Tbody>
                {schedule.map((row, i) => (
                  <Tr key={i}>
                    <Td>{row.month}</Td>
                    <Td>${row.payment}</Td>
                    <Td>${row.principal}</Td>
                    <Td>${row.interest}</Td>
                    <Td>${row.remaining}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
