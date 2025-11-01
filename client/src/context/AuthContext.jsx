import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AuthProvider({ children }) {
  // Default user - auto-login without authentication
  const defaultUser = { id: 'default-user', email: 'investor@off.demo', role: 'investor', name: 'Default User', eduVerified: false };
  const defaultToken = 'default-token-no-auth';

  const [user, setUser] = useState(defaultUser);
  const [token, setToken] = useState(defaultToken);

  useEffect(() => {
    // Auto-set default user on mount (no login required)
    setUser(defaultUser);
    setToken(defaultToken);
  }, []);

  function saveAuth(u, t) {
    setUser(u);
    setToken(t);
    localStorage.setItem('off_auth', JSON.stringify({ user: u, token: t }));
  }

  async function login(email, password) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, password }) 
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Network error - cannot reach server' }));
        throw new Error(errorData.error || `Login failed: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      saveAuth(data.user, data.token);
    } catch (err) {
      // Check if it's a network error (likely mobile device trying to reach localhost)
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        if (API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
          throw new Error('Cannot connect to server. On mobile devices, make sure you are using your computer\'s IP address instead of localhost (e.g., http://192.168.1.100:4000)');
        }
        throw new Error('Network error - cannot reach server. Please check your connection and that the server is running.');
      }
      throw err;
    }
  }

  async function signup(payload) {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Network error - cannot reach server' }));
        throw new Error(errorData.error || `Signup failed: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      saveAuth(data.user, data.token);
    } catch (err) {
      // Check if it's a network error (likely mobile device trying to reach localhost)
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        if (API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
          throw new Error('Cannot connect to server. On mobile devices, make sure you are using your computer\'s IP address instead of localhost (e.g., http://192.168.1.100:4000)');
        }
        throw new Error('Network error - cannot reach server. Please check your connection and that the server is running.');
      }
      throw err;
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('off_auth');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


