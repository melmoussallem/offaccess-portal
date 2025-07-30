import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      companyName: user?.companyName || '',
      companyWebsite: user?.companyWebsite || '',
      companyAddress: {
        street: user?.companyAddress?.street || '',
        city: user?.companyAddress?.city || '',
        country: user?.companyAddress?.country || ''
      },
      buyerType: user?.buyerType || 'Retail'
    }
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors }
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watchPassword('newPassword');

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: user.companyName || '',
        companyWebsite: user.companyWebsite || '',
        companyAddress: {
          street: user.companyAddress?.street || '',
          city: user.companyAddress?.city || '',
          country: user.companyAddress?.country || ''
        },
        buyerType: user.buyerType || 'Retail'
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      console.log('Sending profile data:', data);
      console.log('Auth token:', axios.defaults.headers.common['Authorization']);
      
      const result = await updateProfile(data);
      
      if (result.success) {
        console.log('Profile update response:', result.user);
        setIsEditing(false);
      } else {
        console.error('Profile update failed:', result.error);
        setError(result.error || 'Failed to update profile');
        toast.error('Failed to update profile', {
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
      }
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.response?.data?.message);
      setError(error.response?.data?.message || 'Failed to update profile');
      toast.error('Failed to update profile', {
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
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    setError('');

    try {
      console.log('🔐 Frontend: Sending password change request');
      console.log('🔐 Frontend: Current password provided:', !!data.currentPassword);
      console.log('🔐 Frontend: New password provided:', !!data.newPassword);
      
      const response = await axios.put('/api/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      console.log('🔐 Frontend: Password change response:', response.data);
      
      resetPassword();
      toast.success('Password changed successfully!', {
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
    } catch (error) {
      console.error('🔐 Frontend: Password change error:', error);
      console.error('🔐 Frontend: Error response:', error.response?.data);
      const backendMessage = error.response?.data?.message;
      if (backendMessage === 'Current password is incorrect') {
        setError('Current password is incorrect');
        toast.error('Current password is incorrect', {
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
      } else {
        setError(backendMessage || 'Failed to change password');
        toast.error(backendMessage || 'Failed to change password', {
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
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setError('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  // Fix regex pattern to remove unnecessary escape character
  const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6">Personal Information</Typography>
                  </Box>
                }
                action={
                  !isEditing ? (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                      variant="outlined"
                      size="small"
                    >
                      Edit
                    </Button>
                  ) : (
                    <Box display="flex" gap={1}>
                      <Button
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        variant="outlined"
                        size="small"
                        color="error"
                      >
                        Cancel
                      </Button>
                      <Button
                        startIcon={<SaveIcon />}
                        type="submit"
                        variant="contained"
                        size="small"
                        disabled={loading || !isDirty}
                      >
                        {loading ? <CircularProgress size={20} /> : 'Save'}
                      </Button>
                    </Box>
                  )
                }
              />
              <CardContent sx={{ flex: 1 }}>
                <Grid container spacing={3}>
                  {/* Name */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: 'Name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Full Name"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address"
                      value={user?.email || ''}
                      fullWidth
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Email cannot be changed"
                    />
                  </Grid>

                  {/* Phone */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="phone"
                      control={control}
                      rules={{
                        pattern: {
                          value: phoneRegex,
                          message: 'Invalid phone number'
                        }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Phone Number"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card sx={{ mt: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <BusinessIcon color="primary" />
                    <Typography variant="h6">Company Information</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ flex: 1 }}>
                <Grid container spacing={3}>
                  {/* Company Name */}
                  <Grid item xs={12}>
                    <Controller
                      name="companyName"
                      control={control}
                      rules={{ required: 'Company name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Company Name"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.companyName}
                          helperText={errors.companyName?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BusinessIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Business Type */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="buyerType"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth disabled={!isEditing}>
                          <InputLabel>Business Type</InputLabel>
                          <Select {...field} label="Business Type">
                            <MenuItem value="Wholesale">Wholesale</MenuItem>
                            <MenuItem value="Retail">Retail</MenuItem>
                            <MenuItem value="Online">Online</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {/* Company Website */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="companyWebsite"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Company Website"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.companyWebsite}
                          helperText={errors.companyWebsite?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LanguageIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Street Address */}
                  <Grid item xs={12}>
                    <Controller
                      name="companyAddress.street"
                      control={control}
                      rules={{ required: 'Street address is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Street Address"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.companyAddress?.street}
                          helperText={errors.companyAddress?.street?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* City and Country */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="companyAddress.city"
                      control={control}
                      rules={{ required: 'City is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="City"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.companyAddress?.city}
                          helperText={errors.companyAddress?.city?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="companyAddress.country"
                      control={control}
                      rules={{ required: 'Country is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Country"
                          fullWidth
                          disabled={!isEditing}
                          error={!!errors.companyAddress?.country}
                          helperText={errors.companyAddress?.country?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Account Status */}
            <Card sx={{ 
              mb: 3, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <LockIcon color="primary" />
                    <Typography variant="h6">Account Status</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ flex: 1 }}>
                <Box display="flex" flexDirection="column" gap={2} sx={{ height: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <Chip
                      label={getStatusText(user?.status)}
                      color={getStatusColor(user?.status)}
                      size="small"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Role:
                    </Typography>
                    <Chip
                      label={user?.role === 'admin' ? 'Administrator' : 'Buyer'}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Member Since:
                    </Typography>
                    <Typography variant="body2">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                  {user?.lastLogin && (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Last Login:
                      </Typography>
                      <Typography variant="body2">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                  {/* Flexible space to match Personal Information card height */}
                  <Box sx={{ flex: 1 }} />
                </Box>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 'fit-content'
            }}>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <LockIcon color="primary" />
                    <Typography variant="h6">Change Password</Typography>
                  </Box>
                }
              />
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Grid container spacing={2} sx={{ flex: 1 }}>
                    <Grid item xs={12}>
                      <Controller
                        name="currentPassword"
                        control={passwordControl}
                        rules={{ required: 'Current password is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Current Password"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            error={!!passwordErrors.currentPassword || error === 'Current password is incorrect'}
                            helperText={passwordErrors.currentPassword?.message || (error === 'Current password is incorrect' ? error : '')}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                  >
                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            autoComplete="current-password"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="newPassword"
                        control={passwordControl}
                        rules={{
                          required: 'New password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="New Password"
                            type={showNewPassword ? 'text' : 'password'}
                            fullWidth
                            error={!!passwordErrors.newPassword}
                            helperText={passwordErrors.newPassword?.message}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    edge="end"
                                  >
                                    {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            autoComplete="new-password"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="confirmPassword"
                        control={passwordControl}
                        rules={{
                          required: 'Please confirm your password',
                          validate: value =>
                            value === newPassword || 'Passwords do not match'
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Confirm New Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            fullWidth
                            error={!!passwordErrors.confirmPassword}
                            helperText={passwordErrors.confirmPassword?.message}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                  >
                                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            autoComplete="new-password"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={passwordLoading}
                        startIcon={passwordLoading ? <CircularProgress size={20} /> : <LockIcon />}
                      >
                        {passwordLoading ? 'Changing Password...' : 'Change Password'}
                      </Button>
                    </Grid>
                    
                    {/* Add flexible space to match Company Information card height */}
                    <Grid item xs={12} sx={{ flex: 1, minHeight: '40px' }} />
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 