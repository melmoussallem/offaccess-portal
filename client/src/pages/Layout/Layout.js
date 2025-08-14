import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as CatalogueIcon,
  ShoppingCart as OrdersIcon,
  People as PeopleIcon,
  Person as ProfileIcon,
  Help as HelpIcon,
  Business,
  Person,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import Chat from '../Chat/Chat';
import Logo from '../../components/Logo';

const drawerWidth = 280;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const { user, logout, logoutLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Close the menu first
      handleProfileMenuClose();
      
      // Perform logout
      await logout();
      
      // Navigate to login page after successful logout
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMenuClick = (path) => {
    navigate(path);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'buyer']
    },
    {
      text: 'Catalogue',
      icon: <CatalogueIcon />,
      path: '/catalogue',
      roles: ['admin', 'buyer']
    },
    {
      text: 'Orders',
      icon: <OrdersIcon />,
      path: '/orders',
      roles: ['admin', 'buyer']
    },
    {
      text: 'Buyer Management',
      icon: <PeopleIcon />,
      path: '/admin/buyers',
      roles: ['admin']
    },
    {
      text: 'Profile',
      icon: <ProfileIcon />,
      path: '/profile',
      roles: ['admin', 'buyer']
    },
    {
      text: 'Help',
      icon: <HelpIcon />,
      path: '/help',
      roles: ['buyer']
    }
  ];

  const drawer = (
    <Box>
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          textAlign: 'center'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Logo size="xlarge" type="logo" variant="black" showText={false} />
        </Box>
        <Typography variant="h6" component="h1" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
          Digital Wholesale Catalogue
        </Typography>
        <Chip
          label={user?.role === 'admin' ? 'Administrator' : 'Buyer'}
          size="small"
          color={user?.role === 'admin' ? 'primary' : 'secondary'}
        />
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems
          .filter(item => item.roles.includes(user?.role))
          .map((item) => (
            <ListItem
              key={item.text}
              button
              onClick={() => handleMenuClick(item.path)}
              sx={{
                mb: 1,
                borderRadius: 2,
                bgcolor: isActive(item.path) ? 'primary.main' : 'transparent',
                color: isActive(item.path) ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  bgcolor: isActive(item.path) ? 'primary.dark' : 'action.hover',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'primary.contrastText' : 'inherit',
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 400
                }}
              />
            </ListItem>
          ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Icon */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Logo size="small" type="icon" showText={false} />
          </Box>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => isActive(item.path))?.text || 'Dashboard'}
          </Typography>

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Profile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {user?.name || user?.email}
            </Typography>
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: user?.role === 'admin' ? 'primary.main' : 'secondary.main'
                }}
              >
                {user?.role === 'admin' ? <Business /> : <Person />}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: 3
              }
            }}
          >
            <MenuItem onClick={() => { handleMenuClick('/profile'); handleProfileMenuClose(); }}>
              <ListItemIcon>
                <ProfileIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} disabled={logoutLoading}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              {logoutLoading ? 'Logging out...' : 'Logout'}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Chat Component */}
      <Chat />
    </Box>
  );
};

export default Layout; 