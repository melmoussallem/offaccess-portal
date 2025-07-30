import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Paper,
  Alert,
  Container,
  Chip,
  Divider
} from '@mui/material';
import { 
  Email, 
  CheckCircle, 
  AccessTime, 
  ArrowBack,
  Refresh
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
  const [resendAttempts, setResendAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [lastEmail, setLastEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit'
  });

  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (emailSent && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailSent, countdown]);

  // Resend cooldown timer effect
  useEffect(() => {
    let interval;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data) => {
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      console.log('Attempting to send password reset email to:', data.email);
      const result = await forgotPassword(data.email);
      console.log('Password reset result:', result);
      
      if (result.success) {
        setEmailSent(true);
        setCountdown(900); // Reset countdown
        setLastEmail(data.email);
        setResendAttempts(0); // Reset resend attempts for new email
        toast.success('Password reset email sent successfully');
      } else {
        setError(result.error);
        toast.error(result.error);
      }
      
    } catch (error) {
      console.error('Password reset error:', error);
      const message = 'Failed to send reset email';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendAttempts >= 3) {
      toast.error('Maximum resend attempts reached. Please contact support for assistance.');
      return;
    }

    if (resendCooldown > 0) {
      toast.error(`Please wait ${formatTime(resendCooldown)} before trying again.`);
      return;
    }

    if (!lastEmail) {
      toast.error('No email address available for resend.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting to resend password reset email to:', lastEmail);
      const result = await forgotPassword(lastEmail);
      console.log('Resend result:', result);
      
      if (result.success) {
        setResendAttempts(prev => prev + 1);
        setResendCooldown(180); // 3 minutes cooldown
        setCountdown(900); // Reset countdown
        toast.success('Resend email sent successfully!');
      } else {
        setError(result.error);
        toast.error(result.error);
      }
      
    } catch (error) {
      console.error('Resend error:', error);
      const message = 'Failed to resend email';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const canResendEmail = resendAttempts < 3 && resendCooldown === 0 && lastEmail;

  if (emailSent) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh'
          }}
        >
          <Paper elevation={3} sx={{ 
            padding: 4, 
            width: '100%',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            animation: 'slideIn 0.6s ease-out'
          }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              {/* Success Icon with Animation */}
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 12px 40px rgba(40, 167, 69, 0.4)',
                  animation: 'pulse 2s infinite',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '120%',
                    height: '120%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    opacity: 0.3,
                    animation: 'ripple 2s infinite'
                  }
                }}
              >
                <CheckCircle sx={{ fontSize: 50, color: 'white' }} />
              </Box>
              
              <Typography component="h1" variant="h3" gutterBottom sx={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                mb: 2
              }}>
                Check Your Email
              </Typography>

              {/* Countdown Timer */}
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={countdown > 0 ? <AccessTime /> : null}
                  label={countdown > 0 ? `Link expires in ${formatTime(countdown)}` : 'Link Expired'}
                  color={countdown > 0 ? "warning" : "error"}
                  variant="outlined"
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderColor: countdown === 0 ? '#dc3545' : countdown < 300 ? '#dc3545' : '#ffc107',
                    color: countdown === 0 ? '#dc3545' : countdown < 300 ? '#dc3545' : '#856404',
                    '& .MuiChip-icon': {
                      color: countdown === 0 ? '#dc3545' : countdown < 300 ? '#dc3545' : '#ffc107'
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Success Alert with Enhanced Styling */}
            <Alert 
              severity="success" 
              sx={{ 
                mb: 4,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                border: '1px solid #c3e6cb',
                '& .MuiAlert-icon': {
                  color: '#28a745'
                }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Password Reset Email Sent
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A secure password reset link has been sent to your email address. Please check your inbox and follow the instructions to update your password.
              </Typography>
            </Alert>

            <Divider sx={{ my: 3 }} />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
                startIcon={<ArrowBack />}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #218838 0%, #1ea085 100%)',
                    boxShadow: '0 6px 20px rgba(40, 167, 69, 0.4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Back to Login
              </Button>

              <Button
                onClick={handleResendEmail}
                variant="outlined"
                size="large"
                startIcon={<Refresh />}
                disabled={!canResendEmail || loading}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: '600',
                  textTransform: 'none',
                  borderColor: canResendEmail ? '#6c757d' : '#e0e0e0',
                  color: canResendEmail ? '#6c757d' : '#b0b0b0',
                  '&:hover': canResendEmail ? {
                    borderColor: '#495057',
                    backgroundColor: 'rgba(108, 117, 125, 0.1)'
                  } : {},
                  '&:disabled': {
                    borderColor: '#e0e0e0',
                    color: '#b0b0b0'
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : resendAttempts >= 3 ? (
                  'Contact Support'
                ) : resendCooldown > 0 ? (
                  `Resend link in ${formatTime(resendCooldown)}`
                ) : (
                  'Resend link'
                )}
              </Button>
            </Box>

            {/* Additional Help Text */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                Didn't receive the email? Be sure to check your spam or junk folder.<br />
                If you still need help, contact our support team.
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* CSS Animations */}
        <style>
          {`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes pulse {
              0% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.05);
              }
              100% {
                transform: scale(1);
              }
            }
            
            @keyframes ripple {
              0% {
                transform: scale(1);
                opacity: 0.3;
              }
              100% {
                transform: scale(1.5);
                opacity: 0;
              }
            }
          `}
        </style>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ 
          padding: 4, 
          width: '100%',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 32px rgba(220, 53, 69, 0.3)'
              }}
            >
              <Email sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            
            <Typography component="h1" variant="h4" gutterBottom sx={{
              background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              Forgot Password
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '80%', margin: '0 auto' }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <TextField
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              label="Email Address"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                width: '70%',
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: '#f8f9fa',
                  '&:hover': {
                    background: '#ffffff',
                    boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.1)'
                  },
                  '&.Mui-focused': {
                    background: '#ffffff',
                    boxShadow: '0 0 0 2px rgba(220, 53, 69, 0.2)'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#666666',
                  fontSize: '1rem',
                  fontWeight: 500
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0'
                },
                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#dc3545'
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#dc3545'
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
                              sx={{
                  py: 1.5,
                  mt: 2,
                  width: '70%',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
                color: '#ffffff',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #c82333 0%, #e55a00 100%)',
                  boxShadow: '0 6px 20px rgba(220, 53, 69, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:active': {
                  transform: 'translateY(0px)'
                },
                '&:disabled': {
                  background: '#cccccc',
                  color: '#666666',
                  boxShadow: 'none',
                  transform: 'none'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Reset Password'
              )}
            </Button>

            <Box textAlign="center" mt={3}>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                Remember your password?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{ 
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: '#dc3545',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#c82333',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 