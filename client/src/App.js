import React from 'react';
import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { Box, CircularProgress, Container, Typography, Button, Paper } from '@mui/material';
import { Pending as PendingIcon } from '@mui/icons-material';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ChatProvider } from './contexts/ChatContext';
import Layout from './pages/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Catalogue from './pages/Catalogue/Catalogue';
import Orders from './pages/Orders/Orders';
import BuyerManagement from './pages/Admin/BuyerManagement';
import Profile from './pages/Profile/Profile';
import Help from './pages/Help/Help';



// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, logoutLoading } = useAuth();

  if (loading || logoutLoading) {
    return (
      <Container>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          gap={2}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            {logoutLoading ? 'Logging out...' : 'Loading...'}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check buyer status
  if (user.role === 'buyer' && user.status === 'rejected') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Pending Buyer Component
const PendingBuyer = () => {
  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        textAlign="center"
        gap={4}
      >
        <Paper
          elevation={8}
          sx={{
            p: 6,
            borderRadius: 4,
            bgcolor: 'background.paper',
            maxWidth: 800,
            width: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid #e3f2fd',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
            }
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)',
                animation: 'pulse 2s infinite'
              }}
            >
              <PendingIcon 
                sx={{ 
                  fontSize: 40, 
                  color: 'white',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }} 
              />
            </Box>
          </Box>

          {/* Title */}
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            fontWeight="bold" 
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Application Under Review
          </Typography>

          {/* Main Message */}
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: 4,
              lineHeight: 1.6,
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}
          >
            Thank you for your interest in our Digital Wholesale Catalogue. Your application is currently being reviewed by our team.
          </Typography>

          {/* Sub Message */}
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              mb: 4,
              lineHeight: 1.5,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            We will notify you via email once your application has been reviewed and approved.
          </Typography>

          {/* Back to Login Button */}
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease-in-out',
                minWidth: '200px'
              }}
            >
              Back to Login
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* CSS Animation for pulse effect */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 8px 32px rgba(255, 152, 0, 0.3);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 12px 40px rgba(255, 152, 0, 0.4);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 8px 32px rgba(255, 152, 0, 0.3);
            }
          }
        `}
      </style>
    </Container>
  );
};

// Main App Component
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      {/* Pending Buyer Route - Must come before protected routes */}
      <Route 
        path="/pending" 
        element={
          user && user.role === 'buyer' && user.status === 'pending' ? (
            <PendingBuyer />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="catalogue" element={<Catalogue />} />

        <Route path="orders" element={<Orders />} />
        <Route path="help" element={<Help />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Admin Routes */}
        <Route
          path="admin/buyers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BuyerManagement />
            </ProtectedRoute>
          }
        />
      </Route>
      
      {/* Catch all route */}
      <Route 
        path="*" 
        element={
          user && user.role === 'buyer' && user.status === 'pending' ? (
            <Navigate to="/pending" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
    </Routes>
  );
};

// App Component with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <AppContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#333333',
                borderRadius: '6px',
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                minWidth: '280px',
                maxWidth: '350px',
                lineHeight: '1.4',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#ffffff',
                  color: '#2e7d32',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)',
                },
                iconTheme: {
                  primary: '#4caf50',
                  secondary: '#ffffff',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#d32f2f',
                  boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)',
                },
                iconTheme: {
                  primary: '#f44336',
                  secondary: '#ffffff',
                },
              },
              loading: {
                style: {
                  background: '#ffffff',
                  color: '#1976d2',
                  boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)',
                },
              },
            }}
          />
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App; 