import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from './api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));

  useEffect(() => {
    console.log('Token changed:', token);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded JWT token:', decoded);
        
        // Try different possible claim names for the user's name
        const userName = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname']
          || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] 
          || decoded.name 
          || decoded.unique_name 
          || decoded.sub 
          || decoded.email 
          || 'User';
        
        // Extract role
        const userRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
          || decoded.role
          || 'Tenant';
        
        console.log('Extracted user name:', userName);
        console.log('Extracted user role:', userRole);
        setUser({ name: userName, role: userRole });
        apiClient.setAuthToken(token);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    } else {
      console.log('No token, clearing user');
      setUser(null);
    }
  }, [token]);

  const login = (newToken, refreshToken) => {
    localStorage.setItem('authToken', newToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    setToken(newToken);
  };

  const logout = () => {
    apiClient.logout(); // Call the API to invalidate the token on the server
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
