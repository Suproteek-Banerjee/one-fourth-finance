import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Box, Flex, Heading, Button, Spacer, IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, VStack } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Coaching from './pages/Coaching.jsx';
import Microfinance from './pages/Microfinance.jsx';
import CreditRisk from './pages/CreditRisk.jsx';
import Pension from './pages/Pension.jsx';
import Insurance from './pages/Insurance.jsx';
import RealEstate from './pages/RealEstate.jsx';
import Fraud from './pages/Fraud.jsx';
import Admin from './pages/Admin.jsx';
import Wallet from './pages/Wallet.jsx';
import Profile from './pages/Profile.jsx';
import Investments from './pages/Investments.jsx';

function NavBar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/investments', label: 'Investments' },
    { to: '/wallet', label: 'Wallet' },
    { to: '/coaching', label: 'Coaching' },
    { to: '/microfinance', label: 'Loans' },
    { to: '/insurance', label: 'Insurance' },
    { to: '/real-estate', label: 'Real Estate' },
    { to: '/pension', label: 'Pension' },
    { to: '/fraud', label: 'Fraud' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
    { to: '/profile', label: 'Profile' }
  ];

  return (
    <>
      <Flex p={4} borderBottom="1px solid #e2e8f0" align="center" bg="white" boxShadow="sm">
        <Heading size="md" bgGradient="linear(to-r, blue.500, purple.500)" bgClip="text">
          One-Fourth Finance
        </Heading>
        <Spacer />
        <Box display={{ base: 'none', md: 'flex' }}>
          {navLinks.map(link => (
            <Button key={link.to} as={Link} to={link.to} variant="ghost" isActive={location.pathname === link.to} size="sm">
              {link.label}
            </Button>
          ))}
        </Box>
        <IconButton display={{ base: 'flex', md: 'none' }} icon={<HamburgerIcon />} onClick={() => setMobileOpen(true)} variant="ghost" />
      </Flex>

      <Drawer isOpen={mobileOpen} placement="right" onClose={() => setMobileOpen(false)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={2}>
              {navLinks.map(link => (
                <Button key={link.to} as={Link} to={link.to} variant={location.pathname === link.to ? 'solid' : 'ghost'} w="full" justifyContent="flex-start" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Button>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Box minH="100vh" bgGradient="linear(to-br, gray.50, blue.50)">
        <NavBar />
        <Box p={6}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/coaching" element={<Coaching />} />
            <Route path="/microfinance" element={<Microfinance />} />
            <Route path="/credit-risk" element={<CreditRisk />} />
            <Route path="/pension" element={<Pension />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/real-estate" element={<RealEstate />} />
            <Route path="/fraud" element={<Fraud />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Box>
      </Box>
    </AuthProvider>
  );
}
