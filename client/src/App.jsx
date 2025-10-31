import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Box, Flex, Heading, Button, Spacer, IconButton, useColorMode, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, VStack } from '@chakra-ui/react';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
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

function NavBar() {
  const { user, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
  const navLinks = user ? [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/wallet', label: 'Wallet' },
    { to: '/coaching', label: 'Coaching' },
    { to: '/microfinance', label: 'Loans' },
    { to: '/insurance', label: 'Insurance' },
    { to: '/real-estate', label: 'Real Estate' },
    { to: '/pension', label: 'Pension' },
    { to: '/fraud', label: 'Fraud' },
    ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
    { to: '/profile', label: 'Profile' }
  ] : [
    { to: '/login', label: 'Login' },
    { to: '/signup', label: 'Sign Up' }
  ];

  return (
    <>
      <Flex p={4} borderBottom="1px solid" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'} align="center" bg={colorMode === 'dark' ? 'gray.800' : 'white'} boxShadow="sm">
        <Heading size="md" bgGradient="linear(to-r, blue.500, purple.500)" bgClip="text">
          One-Fourth Finance
        </Heading>
        <Spacer />
        <IconButton icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />} onClick={toggleColorMode} variant="ghost" mr={2} />
        {user ? (
          <>
            <Box display={{ base: 'none', md: 'flex' }}>
              {navLinks.map(link => (
                <Button key={link.to} as={Link} to={link.to} variant="ghost" isActive={location.pathname === link.to} size="sm">
                  {link.label}
                </Button>
              ))}
              <Button ml={2} onClick={logout} colorScheme="blue" size="sm">Logout</Button>
            </Box>
            <IconButton display={{ base: 'flex', md: 'none' }} icon={<HamburgerIcon />} onClick={() => setMobileOpen(true)} variant="ghost" />
          </>
        ) : (
          <>
            <Button as={Link} to="/login" variant="ghost" size="sm">Login</Button>
            <Button as={Link} to="/signup" variant="solid" colorScheme="blue" size="sm" ml={2}>Sign Up</Button>
          </>
        )}
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
              <Button onClick={logout} colorScheme="red" mt={4} w="full">Logout</Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Box minH="100vh" bg="gray.50">
        <NavBar />
        <Box p={6}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/coaching" element={<ProtectedRoute><Coaching /></ProtectedRoute>} />
            <Route path="/microfinance" element={<ProtectedRoute><Microfinance /></ProtectedRoute>} />
            <Route path="/credit-risk" element={<ProtectedRoute><CreditRisk /></ProtectedRoute>} />
            <Route path="/pension" element={<ProtectedRoute><Pension /></ProtectedRoute>} />
            <Route path="/insurance" element={<ProtectedRoute><Insurance /></ProtectedRoute>} />
            <Route path="/real-estate" element={<ProtectedRoute><RealEstate /></ProtectedRoute>} />
            <Route path="/fraud" element={<ProtectedRoute><Fraud /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </Box>
      </Box>
    </AuthProvider>
  );
}


