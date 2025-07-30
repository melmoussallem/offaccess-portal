import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  InputAdornment,
  IconButton,
  LinearProgress,
  Chip,
  Divider
} from '@mui/material';
import { 
  Lock, 
  Visibility, 
  VisibilityOff, 
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    color: '#e0e0e0'
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onChange'
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) {
      return { score: 0, feedback: '', color: '#e0e0e0' };
    }

    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
      feedback.push('✓ Minimum 8 characters');
    } else {
      feedback.push('• Minimum 8 characters required');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
      feedback.push('✓ Uppercase letter included');
    } else {
      feedback.push('• Include at least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
      feedback.push('✓ Lowercase letter included');
    } else {
      feedback.push('• Include at least one lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
      feedback.push('✓ Number included');
    } else {
      feedback.push('• Include at least one number');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
      feedback.push('✓ Special character included');
    } else {
      feedback.push('• Include at least one special character (!@#$%^&*)');
    }

    let color = '#e0e0e0';
    if (score >= 4) color = '#28a745';
    else if (score >= 2) color = '#ffc107';
    else if (score >= 1) color = '#fd7e14';
    else color = '#dc3545';

    return {
      score,
      feedback: feedback.join('\n'),
      color
    };
  };

  // Update password strength when password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, feedback: '', color: '#e0e0e0' });
    }
  }, [password]);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axios.get(`/api/auth/verify-reset-token/${token}`);
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        setError('Invalid or expired reset token');
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
      setTokenValid(false);
      setError('No reset token provided');
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(token, data.password);
      
      if (result.success) {
        toast.success('Password has been reset successfully');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error);
        toast.error(result.error);
      }
      
    } catch (error) {
      const message = 'Failed to reset password';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ 
            padding: 3, 
            width: '100%',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={50} sx={{ color: '#1976d2', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Verifying Reset Link
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please wait while we verify your password reset link...
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ 
            padding: 3, 
            width: '100%',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 32px rgba(220, 53, 69, 0.3)'
                }}
              >
                <Lock sx={{ fontSize: 35, color: 'white' }} />
              </Box>
              
              <Typography component="h1" variant="h4" gutterBottom sx={{
                background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}>
                Password Reset Link Expired
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              The password reset link expired and is no longer valid.
            </Typography>

            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Button
                component={RouterLink}
                to="/forgot-password"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #c82333 0%, #e55a00 100%)',
                    boxShadow: '0 6px 20px rgba(220, 53, 69, 0.4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Request Reset Password Link
              </Button>
              
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textTransform: 'none',
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  mt: 2,
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)'
                  }
                }}
              >
                Back to Login
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          justifyContent: 'center'
        }}
      >
        <Paper elevation={3} sx={{ 
          padding: 3, 
          width: '100%',
          borderRadius: '20px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          animation: 'slideIn 0.6s ease-out'
        }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 12px 40px rgba(40, 167, 69, 0.4)',
                animation: 'pulse 2s infinite'
              }}
            >
              <Lock sx={{ fontSize: 35, color: 'white' }} />
            </Box>
            
            <Typography component="h1" variant="h4" gutterBottom sx={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              mb: 0.5
            }}>
              Reset Password
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
              Create a strong new password for your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* New Password Field */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
                New Password
              </Typography>
              
              <TextField
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                fullWidth
                label="Enter your new password"
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={0}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: '#f8f9fa',
                    '&:hover': {
                      background: '#ffffff',
                      boxShadow: '0 0 0 2px rgba(40, 167, 69, 0.1)'
                    },
                    '&.Mui-focused': {
                      background: '#ffffff',
                      boxShadow: '0 0 0 2px rgba(40, 167, 69, 0.2)'
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
                    borderColor: '#28a745'
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#28a745'
                  }
                }}
              />

              {/* Password Strength Indicator */}
              {password && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 2, fontWeight: 600 }}>
                      Password Strength:
                    </Typography>
                    <Chip
                      icon={
                        passwordStrength.score >= 4 ? <CheckCircle /> :
                        passwordStrength.score >= 2 ? <Warning /> : <Error />
                      }
                      label={
                        passwordStrength.score >= 4 ? 'Strong' :
                        passwordStrength.score >= 2 ? 'Medium' : 'Weak'
                      }
                      size="small"
                      sx={{
                        backgroundColor: passwordStrength.color,
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: 'white'
                        }
                      }}
                    />
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={(passwordStrength.score / 5) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: passwordStrength.color,
                        borderRadius: 3
                      }
                    }}
                  />
                  
                  {/* Enhanced Password Requirements */}
                  <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#495057' }}>
                      Password Suggestions:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 0.3,
                      fontSize: '0.8rem',
                      lineHeight: 1.3
                    }}>
                      {passwordStrength.feedback.split('\n').map((requirement, index) => (
                        <Typography 
                          key={index} 
                          variant="body2" 
                          sx={{ 
                            color: requirement.startsWith('✓') ? '#28a745' : '#6c757d',
                            fontWeight: requirement.startsWith('✓') ? 600 : 400,
                            fontSize: '0.8rem'
                          }}
                        >
                          {requirement}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Confirm Password Field */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
                Confirm New Password
              </Typography>
              
              <TextField
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => {
                    if (!value) return 'Please confirm your password';
                    if (value !== password) return 'Passwords do not match';
                    return true;
                  }
                })}
                fullWidth
                label="Confirm your new password"
                type={showConfirmPassword ? 'text' : 'password'}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        tabIndex={0}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: '#f8f9fa',
                    '&:hover': {
                      background: '#ffffff',
                      boxShadow: '0 0 0 2px rgba(40, 167, 69, 0.1)'
                    },
                    '&.Mui-focused': {
                      background: '#ffffff',
                      boxShadow: '0 0 0 2px rgba(40, 167, 69, 0.2)'
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
                    borderColor: '#28a745'
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#28a745'
                  }
                }}
              />

              {/* Real-time password matching indicator */}
              {confirmPassword && password && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  {confirmPassword === password ? (
                    <Chip
                      icon={<CheckCircle />}
                      label="Passwords match"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  ) : (
                    <Chip
                      icon={<Error />}
                      label="Passwords don't match"
                      color="error"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>
              )}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || confirmPassword !== password}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: '#ffffff',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #218838 0%, #1ea085 100%)',
                  boxShadow: '0 6px 20px rgba(40, 167, 69, 0.4)',
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

            <Box textAlign="center" mt={2}>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                Remember your password?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{ 
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: '#28a745',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#218838',
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
          `}
        </style>
      </Box>
    </Container>
  );
};

export default ResetPassword; 