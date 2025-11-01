import React, { useState } from 'react';
import { Box, Button, Heading, Input, Text, Card, CardBody, CardHeader, SimpleGrid, VStack, HStack, Badge, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, useToast } from '@chakra-ui/react';

// Mock data - no API calls
const MOCK_LOANS = [
  { id: '1', borrowerId: 'user1', amount: 1500, rate: 0.18, termMonths: 12, status: 'active', funded: 900, needed: 600, purpose: 'Small Business' }
];

const MOCK_MY_LOANS = {
  borrower: [
    { id: '2', amount: 1000, rate: 0.15, termMonths: 12, status: 'active', funded: 1000, paid: 0, remaining: 1000, purpose: 'Education' }
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
  const { isOpen: isPayOpen, onOpen: onPayOpen, onClose: onPayClose } = useDisclosure();
  const [payLoanId, setPayLoanId] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  function apply() {
    if (!amount || !income || !creditScore) {
      toast({ title: 'Please fill in all fields', status: 'warning' });
      return;
    }

    const loanAmount = Number(amount);
    const monthlyIncome = Number(income);
    const score = Number(creditScore);

    // Check loan amount cap
    const MAX_LOAN_AMOUNT = 6500;
    if (loanAmount > MAX_LOAN_AMOUNT) {
      toast({ 
        title: 'Loan Amount Too High', 
        status: 'error', 
        description: `Maximum loan amount is $${MAX_LOAN_AMOUNT.toLocaleString()}` 
      });
      setResult({
        approved: false,
        approvalProbability: 0,
        rejectionReasons: [`Loan amount exceeds maximum of $${MAX_LOAN_AMOUNT.toLocaleString()}`],
        suggestedRate: 0.25,
        suggestedAmount: MAX_LOAN_AMOUNT
      });
      return;
    }

    // Calculate approval criteria
    const debtToIncomeRatio = (loanAmount / monthlyIncome) * 12; // Annual debt-to-income
    const maxDebtToIncome = 0.5; // 50% maximum
    const minCreditScore = 600;

    // Determine rejection reasons
    const rejectionReasons = [];
    let approved = true;

    if (score < minCreditScore) {
      approved = false;
      rejectionReasons.push(`Credit score too low (${score} < ${minCreditScore} minimum)`);
    }

    if (debtToIncomeRatio >= maxDebtToIncome) {
      approved = false;
      rejectionReasons.push(`Debt-to-income ratio too high (${(debtToIncomeRatio * 100).toFixed(1)}% >= ${(maxDebtToIncome * 100)}% maximum)`);
    }

    // Calculate probability based on credit score
    const probability = score >= 700 ? 0.9 : score >= 650 ? 0.7 : score >= 600 ? 0.5 : 0.3;

    setResult({
      approved,
      approvalProbability: probability,
      rejectionReasons: approved ? [] : rejectionReasons,
      suggestedRate: approved ? 0.15 : 0.25,
      suggestedAmount: approved ? loanAmount : Math.min(loanAmount * 0.8, MAX_LOAN_AMOUNT),
      debtToIncomeRatio: (debtToIncomeRatio * 100).toFixed(1) + '%'
    });

    if (approved) {
      const updatedLoans = {
        ...myLoans,
        borrower: [...myLoans.borrower, {
          id: Date.now().toString(),
          amount: loanAmount,
          rate: 0.15,
          termMonths: 12,
          status: 'active',
          funded: 0,
          paid: 0,
          remaining: loanAmount,
          purpose: 'New Loan'
        }]
      };
      setMyLoans(updatedLoans);
      localStorage.setItem('off_loans', JSON.stringify(updatedLoans));
      // Dispatch event to notify Profile page
      window.dispatchEvent(new Event('loansUpdated'));
      toast({ 
        title: 'Loan Approved!', 
        status: 'success', 
        description: `Your loan application has been approved. Rate: 15%` 
      });
    } else {
      const reasonsText = rejectionReasons.join('. ');
      toast({ 
        title: 'Loan Rejected', 
        status: 'error', 
        description: reasonsText,
        duration: 6000
      });
    }
  }

  function fund(loanId) {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const newFunded = Math.min(loan.funded + 200, loan.amount);
    setLoans(loans.map(l => l.id === loanId ? { ...l, funded: newFunded } : l));

    const updatedLoans = {
      ...myLoans,
      lender: [...myLoans.lender, {
        id: Date.now().toString(),
        loanId: loanId,
        amount: 200,
        status: 'active',
        fundedAt: Date.now()
      }]
    };
    
    setMyLoans(updatedLoans);
    localStorage.setItem('off_loans', JSON.stringify(updatedLoans));
    window.dispatchEvent(new Event('loansUpdated'));

    toast({ title: 'Successfully funded $200!', status: 'success' });
  }

  function openPayModal(loanId) {
    setPayLoanId(loanId);
    onPayOpen();
  }

  function payLoan() {
    if (!payAmount || !payLoanId) {
      toast({ title: 'Please enter payment amount', status: 'warning' });
      return;
    }

    const loan = myLoans.borrower.find(l => l.id === payLoanId);
    if (!loan) {
      toast({ title: 'Loan not found', status: 'error' });
      return;
    }

    const paymentAmount = Number(payAmount);
    const remainingBalance = loan.remaining || (loan.amount - (loan.paid || 0));

    if (paymentAmount <= 0) {
      toast({ title: 'Payment amount must be greater than 0', status: 'warning' });
      return;
    }

    if (paymentAmount > remainingBalance) {
      toast({ 
        title: 'Payment exceeds remaining balance', 
        status: 'error', 
        description: `You only have $${remainingBalance.toFixed(2)} remaining` 
      });
      return;
    }

    const newPaid = (loan.paid || 0) + paymentAmount;
    const newRemaining = remainingBalance - paymentAmount;
    const newStatus = newRemaining <= 0 ? 'paid' : 'active';

    const updatedLoans = {
      ...myLoans,
      borrower: myLoans.borrower.map(l => 
        l.id === payLoanId 
          ? { ...l, paid: newPaid, remaining: newRemaining, status: newStatus }
          : l
      )
    };

    setMyLoans(updatedLoans);
    localStorage.setItem('off_loans', JSON.stringify(updatedLoans));
    window.dispatchEvent(new Event('loansUpdated'));

    toast({ 
      title: 'Payment successful!', 
      status: 'success', 
      description: newStatus === 'paid' 
        ? 'Loan fully paid off!' 
        : `Paid $${paymentAmount.toFixed(2)}. Remaining: $${newRemaining.toFixed(2)}` 
    });

    onPayClose();
    setPayAmount('');
    setPayLoanId(null);
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
                <Text mb={2} fontWeight="medium">Loan Amount ($) - Max: $6,500</Text>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} max={6500} min={100} />
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
                  <Text fontWeight="bold" mb={2} fontSize="lg">{result.approved ? '✓ Approved' : '✗ Rejected'}</Text>
                  <Text fontSize="sm" mb={2}>Approval Probability: {Math.round(result.approvalProbability * 100)}%</Text>
                  
                  {result.approved ? (
                    <VStack align="stretch" mt={2} spacing={1}>
                      <Text fontSize="sm">Suggested Rate: {(result.suggestedRate * 100).toFixed(1)}%</Text>
                      <Text fontSize="sm">Suggested Amount: ${result.suggestedAmount.toLocaleString()}</Text>
                    </VStack>
                  ) : (
                    <Box mt={3}>
                      <Text fontSize="sm" fontWeight="bold" mb={2} color="red.700">Rejection Reasons:</Text>
                      {result.rejectionReasons && result.rejectionReasons.length > 0 ? (
                        <VStack align="stretch" spacing={1}>
                          {result.rejectionReasons.map((reason, idx) => (
                            <Text key={idx} fontSize="sm" color="red.600">
                              • {reason}
                            </Text>
                          ))}
                        </VStack>
                      ) : (
                        <Text fontSize="sm" color="red.600">Loan application does not meet approval criteria</Text>
                      )}
                      {result.debtToIncomeRatio && (
                        <Text fontSize="sm" mt={2} color="gray.600">
                          Debt-to-Income Ratio: {result.debtToIncomeRatio}
                        </Text>
                      )}
                      {result.suggestedAmount && result.suggestedAmount < Number(amount) && (
                        <Text fontSize="sm" mt={2} color="blue.600" fontWeight="medium">
                          Suggested Amount: ${result.suggestedAmount.toLocaleString()}
                        </Text>
                      )}
                    </Box>
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
                      {myLoans.borrower.map(loan => {
                        const remaining = loan.remaining || (loan.amount - (loan.paid || 0));
                        return (
                          <Tr key={loan.id}>
                            <Td>${loan.amount.toLocaleString()}</Td>
                            <Td>{(loan.rate * 100).toFixed(1)}%</Td>
                            <Td>{loan.termMonths} months</Td>
                            <Td>${loan.funded} / ${loan.amount}</Td>
                            <Td>
                              <VStack spacing={1} align="start">
                                <Badge colorScheme={loan.status === 'paid' ? 'gray' : 'green'}>{loan.status}</Badge>
                                <Text fontSize="xs" color="gray.600">
                                  Remaining: ${remaining.toFixed(2)}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Button 
                                  size="sm" 
                                  onClick={() => viewSchedule(loan.id)} 
                                  variant="outline"
                                  isDisabled={loan.status === 'paid'}
                                >
                                  View Schedule
                                </Button>
                                {loan.status !== 'paid' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => openPayModal(loan.id)} 
                                    colorScheme="blue"
                                  >
                                    Pay
                                  </Button>
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })}
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

      <Modal isOpen={isPayOpen} onClose={onPayClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pay Loan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              {(() => {
                const loan = myLoans.borrower.find(l => l.id === payLoanId);
                if (!loan) return null;
                
                const remaining = loan.remaining || (loan.amount - (loan.paid || 0));
                const paymentPreview = payAmount ? Number(payAmount) : 0;
                const newRemaining = remaining - paymentPreview;
                
                return (
                  <>
                    <Box>
                      <Text mb={2} fontWeight="medium">Loan Details:</Text>
                      <Text fontSize="sm" color="gray.600">Original Amount: ${loan.amount.toLocaleString()}</Text>
                      <Text fontSize="sm" color="gray.600">Paid: ${(loan.paid || 0).toFixed(2)}</Text>
                      <Text fontSize="sm" color="gray.600" fontWeight="bold">Remaining: ${remaining.toFixed(2)}</Text>
                    </Box>
                    <Input 
                      type="number" 
                      placeholder="Payment amount in USD ($)" 
                      value={payAmount} 
                      onChange={e => setPayAmount(e.target.value)} 
                    />
                    {payAmount && paymentPreview > 0 && (
                      <Box p={3} bg="blue.50" borderRadius="md">
                        <Text fontSize="sm" color="gray.700">
                          After payment: ${Math.max(0, newRemaining).toFixed(2)} remaining
                        </Text>
                        {newRemaining <= 0 && (
                          <Text fontSize="sm" color="green.600" fontWeight="bold" mt={1}>
                            This will fully pay off the loan!
                          </Text>
                        )}
                      </Box>
                    )}
                  </>
                );
              })()}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPayClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={payLoan}>Pay</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
