import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));

  // Fetch user profile when token exists
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken) {
        try {
          // Try to use cached user info first
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            setLoading(false);
          }
          
          // Then fetch fresh user info from API
          const response = await api.get('/api/customers/me');
          const userData = response.data || response;
          setUser(userData);
          setToken(storedToken);
          
          // Update cached user info
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to fetch user:', error);
          // If token is invalid, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 [Auth] Attempting login with:', credentials.tenDangNhap);
      const response = await api.post('/api/v1/auth/authenticate', credentials);
      const authToken = response.data?.token || response.token;
      
      console.log('✅ [Auth] Login successful, token received:', authToken ? 'Yes' : 'No');
      
      if (authToken) {
        localStorage.setItem('authToken', authToken);
        setToken(authToken);
        console.log('💾 [Auth] Token saved to localStorage');
        
        // Fetch user profile after login
        try {
          console.log('👤 [Auth] Fetching user profile...');
          const userResponse = await api.get('/api/customers/me');
          const userData = userResponse.data || userResponse;
          console.log('✅ [Auth] User data received:', userData);
          
          setUser(userData);
          
          // Store user info in localStorage for easy access across components
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('💾 [Auth] User data saved to localStorage:', {
            maKhachHang: userData.maKhachHang,
            hoTen: userData.hoTen,
            email: userData.email
          });
        } catch (err) {
          console.error('❌ [Auth] Failed to fetch user after login:', err);
        }
      }
      
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error('❌ [Auth] Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Đăng nhập thất bại' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/v1/auth/register', userData);
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Đăng ký thất bại' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/customers/profile', profileData);
      const userData = response.data || response;
      setUser(userData);
      
      // Update cached user info
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, data: userData };
    } catch (error) {
      console.error('Update profile failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Cập nhật thất bại' 
      };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/api/customers/me');
      const userData = response.data || response;
      setUser(userData);
      
      // Update cached user info
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, data: userData };
    } catch (error) {
      console.error('Refresh user failed:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateProfile,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      login: async () => ({ success: false, error: 'AuthContext not found' }),
      register: async () => ({ success: false, error: 'AuthContext not found' }),
      logout: () => {},
      updateProfile: async () => ({ success: false, error: 'AuthContext not found' }),
      refreshUser: async () => ({ success: false, error: 'AuthContext not found' })
    };
  }
  return context;
};

export default AuthContext;
