import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import { keyframes } from '@mui/system';
import './Login.css';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Inventory,
  ShoppingCart,
  Notifications,
  Support
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [featureBoxesVisible, setFeatureBoxesVisible] = useState([false, false, false, false]);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Login attempt tracking
  const [failedAttempts, setFailedAttempts] = useState(() => {
    const stored = sessionStorage.getItem('loginFailedAttempts');
    return stored ? parseInt(stored, 10) : 0;
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit'
  });

  const features = useMemo(() => ([
    {
      icon: <Inventory sx={{ fontSize: 32, color: '#ffffff' }} />,
      title: 'Real-Time Stock Visibility',
      description: 'View live, up-to-date inventory levels so you always know what\'s available before placing an order'
    },
    {
      icon: <ShoppingCart sx={{ fontSize: 32, color: '#ffffff' }} />,
      title: 'Streamlined Ordering',
      description: 'Use your personalized dashboard to create, track, and manage orders anytime, from anywhere'
    },
    {
      icon: <Notifications sx={{ fontSize: 32, color: '#ffffff' }} />,
      title: 'Restock Alerts & Drops',
      description: 'Stay informed with instant updates on new arrivals and limited time lots'
    },
    {
      icon: <Support sx={{ fontSize: 32, color: '#ffffff' }} />,
      title: 'Dedicated Buyer Support',
      description: 'Connect with our support team for tailored assistance on product selection, order coordination, and after-sales care'
    }
  ]), []);

  // Animate form on mount
  useEffect(() => {
    const timer = setTimeout(() => setFormVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Animate feature boxes with staggered timing
  useEffect(() => {
    const timers = [];
    features.forEach((_, index) => {
      const timer = setTimeout(() => {
        setFeatureBoxesVisible(prev => {
          const newState = [...prev];
          newState[index] = true;
          console.log(`Feature box ${index} is now visible`);
          return newState;
        });
      }, 300 + (index * 200)); // Start sooner and stagger by 200ms each
      timers.push(timer);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [features]);

  // Update sessionStorage when failed attempts change
  useEffect(() => {
    sessionStorage.setItem('loginFailedAttempts', failedAttempts.toString());
  }, [failedAttempts]);

  // Optional: Reset failed attempts when user focuses on the page (alternative to page refresh)
  useEffect(() => {
    const handleFocus = () => {
      // Uncomment the line below if you want to reset attempts on page focus
      // resetFailedAttempts();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const onSubmit = async (data) => {
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);

    try {
      const result = await login(data.email, data.password);
      
      if (!result.success) {
        // Only count attempts with invalid credentials, not empty fields
        // Check if the error is related to invalid credentials
        const isInvalidCredentials = result.error && (
          result.error.toLowerCase().includes('invalid') ||
          result.error.toLowerCase().includes('incorrect') ||
          result.error.toLowerCase().includes('wrong') ||
          result.error.toLowerCase().includes('credentials') ||
          result.error.toLowerCase().includes('email') ||
          result.error.toLowerCase().includes('password')
        );
        
        if (isInvalidCredentials) {
          // Increment failed attempts counter
          const newFailedAttempts = failedAttempts + 1;
          setFailedAttempts(newFailedAttempts);
          
          console.log(`Login failed attempt ${newFailedAttempts}/3 - Invalid credentials detected`);
          
          // Check if this is the 4th failed attempt (after 3 failed attempts)
          if (newFailedAttempts >= 3) {
            console.log('Redirecting to Forgot Password page after 3 failed attempts');
            // Clear the failed attempts counter
            setFailedAttempts(0);
            sessionStorage.removeItem('loginFailedAttempts');
            // Redirect to forgot password page
            navigate('/forgot-password');
            return;
          }
        } else {
          console.log('Login failed but not counting as invalid credentials attempt:', result.error);
        }
      } else {
        // Successful login - reset failed attempts counter
        console.log('Login successful - resetting failed attempts counter');
        setFailedAttempts(0);
        sessionStorage.removeItem('loginFailedAttempts');
      }
      
      // Don't show any error message for invalid credentials
      // The nudge alert will handle this
      if (!result.success) {
        // Silently handle the error - no UI feedback needed
        console.log('Login failed:', result.error);
      }
      // Navigation is now handled automatically by AuthContext
    } catch (err) {
      // Silently handle unexpected errors
      console.log('Unexpected login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box className="login-page">
      <Box
        className="login-container"
        sx={{
          height: '100vh',
          display: 'flex',
          background: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(25, 118, 210, 0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: `${pulse} 4s ease-in-out infinite`
        }}
      />

      {/* Left Side - Brand Section */}
      <Box
        className="brand-section"
        sx={{
          flex: '1.5', // Increased from flex: 1 to make it wider
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          p: 4,
          position: 'relative',
          zIndex: 1,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: '#ffffff',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Brand Content */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '2.5rem', lg: '3rem' }
            }}
          >
            Digital Wholesale Catalogue
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            Access the largest selection of premium wholesale fashion at your fingertips
          </Typography>
        </Box>

        {/* Feature Cards with Grid Layout for Equal Heights */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: 2, 
          maxHeight: '60vh', 
          overflow: 'hidden',
          width: '100%'
        }}>
          {features.map((feature, index) => (
            <Box
              key={index}
              className={`feature-card ${featureBoxesVisible[index] ? 'animated' : ''}`}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                p: 1.5,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                height: '90px', // Reduced height for all boxes
                '&:hover': {
                  transform: 'translateY(-2px)',
                  background: 'rgba(255, 255, 255, 0.15)'
                }
              }}
            >
              <Box sx={{ flexShrink: 0 }}>
                {feature.icon}
              </Box>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 0.3,
                    fontSize: '1rem'
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.9,
                    lineHeight: 1.4,
                    fontSize: '0.8rem'
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        className="login-form-container"
        sx={{
          flex: 1, // Keep the right side at flex: 1
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3, lg: 4 },
          position: 'relative',
          zIndex: 2,
          background: '#f8f9fa',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        <Slide direction="left" in={formVisible} timeout={800}>
          <Paper
            className="login-paper"
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3, lg: 4 },
              width: '100%',
              maxWidth: 400,
              borderRadius: 4,
              background: '#ffffff',
              border: '1px solid #e8eaed',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              animation: `${fadeInUp} 0.8s ease-out`,
              margin: 0,
              maxHeight: '95vh',
              overflow: 'visible',
              '&:focus': {
                outline: 'none'
              },
              '&:focus-within': {
                outline: 'none'
              }
            }}
          >
            {/* Header */}
            <Box textAlign="center" mb={0.5}>
              <Logo size="xlarge" sx={{ mb: 0 }} type="logo" variant="black" stacked={true} />
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  color: '#1976d2',
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.75rem', sm: '2rem' }
                }}
              >
                Welcome Back
              </Typography>

            </Box>



            {/* Login Form */}
            <Box 
              component="form" 
              onSubmit={handleSubmit(onSubmit)} 
              noValidate 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 0.5
              }}
            >
              {/* Email Field */}
              <Box className="input-field-container">
                <TextField
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  fullWidth
                  id="email"
                  label="Email Address"
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#666666' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: '#f8f9fa',
                      '&:hover': {
                        background: '#ffffff',
                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                      },
                      '&.Mui-focused': {
                        background: '#ffffff',
                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
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
                      borderColor: '#1976d2'
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    // Remove all built-in spacing
                    marginBottom: 0,
                    '& .MuiFormHelperText-root': {
                      display: 'none'
                    }
                  }}
                />
                {/* Error message container */}
                <Box className="error-message-absolute">
                  {errors.email && (
                    <Typography 
                      variant="caption" 
                      color="error" 
                      className="error-text-absolute"
                      sx={{
                        fontSize: '0.7rem',
                        margin: 0,
                        padding: 0,
                        lineHeight: 1,
                        textAlign: 'left',
                        display: 'block'
                      }}
                    >
                      {errors.email.message}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Password Field */}
              <Box className="input-field-container">
                <TextField
                  {...register('password', {
                    required: 'Password is required'
                  })}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  error={false}
                  helperText=""
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#666666' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePassword}
                          edge="end"
                          sx={{
                            color: '#666666',
                            '&:hover': {
                              color: '#1976d2'
                            }
                          }}
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
                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                      },
                      '&.Mui-focused': {
                        background: '#ffffff',
                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666666',
                      fontSize: '1rem',
                      fontWeight: 500
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: errors.password ? '#d32f2f' : '#e0e0e0'
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2'
                    },
                    marginBottom: 0,
                    '& .MuiFormHelperText-root': {
                      display: 'none'
                    }
                  }}
                />
                {/* Error message and forgot password container */}
                <Box className="error-message-absolute">
                  {errors.password && (
                    <Typography 
                      variant="caption" 
                      color="error" 
                      className="error-text-absolute"
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        fontSize: '0.7rem',
                        margin: 0,
                        padding: 0,
                        lineHeight: 1,
                        textAlign: 'left',
                        display: 'block'
                      }}
                    >
                      {errors.password.message}
                    </Typography>
                  )}
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    sx={{ 
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      fontWeight: 600,
                      textDecoration: 'none',
                      color: '#666666',
                      fontSize: '0.7rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#1976d2',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>
              </Box>

              {/* Sign In Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mt: 2,
                  borderRadius: 2,
                  background: '#1976d2',
                  color: '#ffffff',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: '#1565c0',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
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
                  'Sign In'
                )}
              </Button>

              {/* Register Link */}
              <Box textAlign="center" mt={1}>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: '#666666',
                    fontSize: '0.9rem'
                  }}
                >
                  Don't have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    sx={{ 
                      fontWeight: 600,
                      textDecoration: 'none',
                      color: '#1976d2',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#1565c0',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Register Account
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Slide>
      </Box>
    </Box>
    </Box>
  );
};

export default Login; 