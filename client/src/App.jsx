import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Box, Flex, Heading, Button, Spacer } from '@chakra-ui/react';
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

function NavBar() {
  const { user, logout } = useAuth();
  return (
    <Flex p={4} borderBottom="1px solid #eee" align="center">
      <Heading size="md">One-Fourth Finance</Heading>
      <Spacer />
      {user ? (
        <>
          <Button as={Link} to="/dashboard" variant="ghost">Dashboard</Button>
          <Button as={Link} to="/coaching" variant="ghost">Coaching</Button>
          <Button as={Link} to="/microfinance" variant="ghost">Microfinance</Button>
          <Button as={Link} to="/credit-risk" variant="ghost">Credit Risk</Button>
          <Button as={Link} to="/pension" variant="ghost">Pension</Button>
          <Button as={Link} to="/insurance" variant="ghost">Insurance</Button>
          <Button as={Link} to="/real-estate" variant="ghost">Real Estate</Button>
          <Button as={Link} to="/fraud" variant="ghost">Fraud</Button>
          {user.role === 'admin' && <Button as={Link} to="/admin" variant="ghost">Admin</Button>}
          <Button ml={2} onClick={logout}>Logout</Button>
        </>
      ) : (
        <>
          <Button as={Link} to="/login" variant="ghost">Login</Button>
          <Button as={Link} to="/signup" variant="solid">Sign Up</Button>
        </>
      )}
    </Flex>
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
      <Box>
        <NavBar />
        <Box p={6}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/coaching" element={<ProtectedRoute><Coaching /></ProtectedRoute>} />
            <Route path="/microfinance" element={<ProtectedRoute><Microfinance /></ProtectedRoute>} />
            <Route path="/credit-risk" element={<ProtectedRoute><CreditRisk /></ProtectedRoute>} />
            <Route path="/pension" element={<ProtectedRoute><Pension /></ProtectedRoute>} />
            <Route path="/insurance" element={<ProtectedRoute><Insurance /></ProtectedRoute>} />
            <Route path="/real-estate" element={<ProtectedRoute><RealEstate /></ProtectedRoute>} />
            <Route path="/fraud" element={<ProtectedRoute><Fraud /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          </Routes>
        </Box>
      </Box>
    </AuthProvider>
  );
}


