import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  ShoppingCart as OrderIcon,
  Person as PersonIcon,
  Description as FileIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, loadMoreNotifications, pagination } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Mark all visible notifications as read when opening dropdown
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    // Smart routing based on notification type
    handleSmartRouting(notification);
    handleClose();
  };

  const handleSmartRouting = (notification) => {
    switch (notification.type) {
      case 'new_buyer_registration':
        navigate('/admin/buyers');
        break;
      case 'new_order_submission':
      case 'order_cancellation':
      case 'order_status_update':
      case 'payment_complete':
        navigate('/orders');
        break;
      case 'new_collection_available':
      case 'new_file_upload':
        // Navigate to catalogue with the specific brand if data is available
        if (notification.emailData?.collection?.brand) {
          navigate(`/catalogue?brand=${notification.emailData.collection.brand}`);
        } else {
          navigate('/catalogue');
        }
        break;
      case 'registration_confirmation':
      case 'registration_status_update':
        navigate('/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    handleClose();
  };

  const handleDeleteNotification = async (event, notificationId) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_buyer_registration':
        return <PersonIcon color="primary" />;
      case 'new_order_submission':
        return <OrderIcon color="success" />;
      case 'order_cancellation':
        return <CancelIcon color="error" />;
      case 'new_file_upload':
      case 'new_collection_available':
        return <FileIcon color="info" />;
      case 'order_status_update':
        return <OrderIcon color="warning" />;
      case 'payment_complete':
        return <PaymentIcon color="success" />;
      case 'registration_confirmation':
      case 'registration_status_update':
        return <PersonIcon color="primary" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Debug logging
  console.log('NotificationDropdown render:', { unreadCount, notificationsCount: notifications.length });

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleClick} sx={{ mr: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 450,
            maxHeight: 600,
            mt: 1,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 2
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="600">Notifications</Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAllRead}
                disabled={loading}
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              >
                Mark all read
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <MenuItem
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 2,
                      px: 2,
                      backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                        transform: 'translateX(4px)',
                        transition: 'all 0.2s ease'
                      },
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      alignItems: 'flex-start',
                      minHeight: 'auto'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 48, mr: 1 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="subtitle2" 
                          component="span" 
                          fontWeight="600"
                          sx={{ mb: 0.5 }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              lineHeight: 1.5,
                              mb: 0.5,
                              wordWrap: 'break-word',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              whiteSpace: 'pre-wrap',
                              maxWidth: '100%',
                              display: 'block'
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                      sx={{ 
                        flex: 1,
                        minWidth: 0,
                        mr: 1
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteNotification(e, notification._id)}
                      sx={{ ml: 1, opacity: 0.6, '&:hover': { opacity: 1 } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </MenuItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {/* Load more button if more pages */}
              {pagination.current < pagination.total && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Button
                    onClick={loadMoreNotifications}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                  >
                    {loading ? <CircularProgress size={18} /> : 'Load more'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Menu>
    </>
  );
};

export default NotificationDropdown; 