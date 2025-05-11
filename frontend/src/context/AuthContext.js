'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '@/utils/axiosInstance'
import { useRouter } from 'next/navigation'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        const userData = JSON.parse(e.newValue);
        setUser(userData);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = JSON.parse(localStorage.getItem('user'));
          setUser(userData);
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);


 const login = async (email, password) => {
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });

      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token || 'token-placeholder');
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/register', { 
        username, 
        email, 
        password 
      });
      
      return { success: true, message: response.data.message };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      register,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};