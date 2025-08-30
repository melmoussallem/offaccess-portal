import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Global login tracking to prevent multiple simultaneous attempts
let loginInProgress = false;

// Configure axios with proper base URL and timeout
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://offaccess-portal-production.up.railway.app' 
  : 'http://localhost:5000';
console.log('🔍 AuthContext - API_BASE_URL:', API_BASE_URL);

// Create a dedicated axios instance for auth requests
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for Railway
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configure global axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 30000;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Improved logout function - async and smoother
  const logout = useCallback(async () => {
    try {
      setLogoutLoading(true);
      
      // Call backend logout endpoint if we have a token
      if (token) {
        try {
          await authApi.post('/api/auth/logout');
        } catch (error) {
          // Don't fail logout if backend call fails
          console.warn('Backend logout failed:', error.message);
        }
      }
      
      // Clear user state first
      setUser(null);
      setToken(null);
      
      // Clear localStorage
      localStorage.removeItem('token');
      
      // Clear auth API headers
      delete authApi.defaults.headers.common['Authorization'];
      
      // Show success message
      toast.success('Logged out successfully', {
        style: {
          background: '#ffffff',
          color: '#2e7d32',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)',
          minWidth: '280px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }
      });
      
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed', {
        style: {
          background: '#ffffff',
          color: '#d32f2f',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)',
          minWidth: '280px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }
      });
    } finally {
      setLogoutLoading(false);
    }
  }, [token]);

  // Configure auth API defaults and global axios
  useEffect(() => {
    if (token) {
      authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete authApi.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authApi.get('/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Only logout if it's an authentication error, not a network error
          if (error.response?.status === 401 || error.response?.status === 403) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, logout]);

  // On app load, force logout if buyer is not approved
  useEffect(() => {
    if (user && user.role === 'buyer' && user.status !== 'approved') {
      logout();
    }
  }, [user, logout]);

  // Login function
  const login = async (email, password) => {
    // Prevent multiple simultaneous login attempts
    if (loginInProgress) {
      return { success: false, error: 'Login already in progress' };
    }
    
    loginInProgress = true;
    
    // Clear any existing login toasts
    toast.dismiss('login-success');
    toast.dismiss('login-error');
    
    try {
      const response = await authApi.post('/api/auth/login', {
        email,
        password
      });

      const { token: newToken, user: userData, message } = response.data;
      // Only set token/user if buyer is approved or admin
      if (userData.role === 'buyer' && userData.status !== 'approved') {
        // Do not store token/user for pending/rejected buyers
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete authApi.defaults.headers.common['Authorization'];
        toast.error('Your account is not approved yet.', {
          id: 'login-error',
          duration: 2000,
          style: {
            background: '#ffffff',
            color: '#d32f2f',
            borderRadius: '6px',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)',
            minWidth: '280px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }
        });
        return { success: false, error: 'Your account is not approved yet.' };
      }
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      // Show success toast for 1 second
      toast.success(message || 'Login successful', {
        id: 'login-success',
        duration: 1000,
        style: {
          background: '#ffffff',
          color: '#2e7d32',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)',
          minWidth: '280px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }
      });
      
      // Add a small delay before navigation
      setTimeout(() => {
        // Auto-navigate based on user role and status
        if (userData.role === 'buyer') {
          if (userData.status === 'pending') {
            // Stay on current page - App.js will handle showing pending message
            window.location.href = '/';
          } else if (userData.status === 'approved') {
            window.location.href = '/dashboard';
          } else {
            // Rejected buyers stay on login page
            window.location.href = '/login';
          }
        } else if (userData.role === 'admin') {
          window.location.href = '/dashboard';
        }
      }, 1000); // 1 second delay
      
      return { success: true, user: userData, message: message || 'Login successful' };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      
      // Show error toast for 1 second
      toast.error(message, {
        id: 'login-error',
        duration: 1000,
        style: {
          background: '#ffffff',
          color: '#d32f2f',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)',
          minWidth: '280px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }
      });
      
      return { success: false, error: message };
    } finally {
      loginInProgress = false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('=== AUTH CONTEXT REGISTER START ===');
      console.log('Registration data:', userData);
      
      // Ensure we're sending JSON
      const response = await authApi.post('/api/auth/register', userData, {
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Registration response:', response.data);
      
      const { token: newToken, user: newUser, message } = response.data;
      
      // Only set token and user if they are provided (for approved users)
      if (newToken) {
        setToken(newToken);
        localStorage.setItem('token', newToken);
      }
      
      if (newUser) {
        setUser(newUser);
      }
      
      console.log('=== AUTH CONTEXT REGISTER END ===');
      
      // Don't auto-navigate - let the user stay on the confirmation page
      // The user will manually navigate when ready using the "Return to Login" button
      
      return { success: true, user: newUser, message };
    } catch (error) {
      console.error('=== AUTH CONTEXT REGISTER ERROR ===');
      console.error('Error details:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authApi.put('/api/auth/me', profileData);
      setUser(response.data.user);
      toast.success('Profile updated successfully', {
        style: {
          background: '#ffffff',
          color: '#2e7d32',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)',
          minWidth: '280px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }
      });
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message, {
        style: {
          background: '#ffffff',
          color: '#d32f2f',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)',
          minWidth: '280px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }
      });
      return { success: false, error: message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authApi.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      toast.success('Password changed successfully', {
        style: {
          background: '#ffffff',
          color: '#2e7d32',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)',
          minWidth: '280px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message, {
        style: {
          background: '#ffffff',
          color: '#d32f2f',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)',
          minWidth: '280px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }
      });
      return { success: false, error: message };
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Check if user is buyer
  const isBuyer = () => {
    return user?.role === 'buyer';
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      console.log('AuthContext: Sending forgot password request for email:', email);
      const response = await authApi.post('/api/auth/forgot-password', { email });
      console.log('AuthContext: Forgot password response:', response.data);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('AuthContext: Forgot password error:', error);
      console.error('AuthContext: Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to send reset email';
      return { success: false, error: message };
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await authApi.post('/api/auth/reset-password', {
        token,
        newPassword
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    logoutLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    isAdmin,
    isBuyer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 