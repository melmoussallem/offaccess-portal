import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Collections as CollectionsIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  Inventory as InventoryIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Updated color palette for sections
const SECTION_COLORS = {
  buyers: '#DCEEFF', // Soft blue
  orders: '#E5F9E7', // Soft green
  catalogue: '#FFF8E1', // Soft amber
  kpis: '#F5F5F5', // Neutral gray - clean and professional
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState({
    buyers: {},
    orders: {},
    catalogue: {},
    kpis: {},
    role: 'buyer'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://offaccess-portal-production.up.railway.app/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      console.log('DASHBOARD API RESPONSE:', data); // DEBUG LOG
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      // Set mock data for demonstration
      setDashboardData({
        buyers: {
          totalRegisteredBuyers: 45,
          activeBuyers: 23,
          pendingBuyerApprovals: 5
        },
        orders: {
          totalOrders: 156,
          ordersThisMonth: 23,
          pendingOrders: 8
        },
        catalogue: {
          totalBrands: 12,
          totalStockFiles: 89,
          newStockFilesThisMonth: 7
        },
        kpis: {
          totalRevenue: 15420.50,
          revenueThisMonth: 3240.75,
          totalUnitsSold: 456,
          unitsSoldThisMonth: 89,
          topViewedBrands: [
            { name: 'Brand A', views: 45 },
            { name: 'Brand B', views: 38 },
            { name: 'Brand C', views: 32 },
            { name: 'Brand D', views: 28 },
            { name: 'Brand E', views: 25 }
          ],
          topDownloadedStockFiles: [
            { name: 'Spring Collection 2024', downloads: 67 },
            { name: 'Summer Essentials', downloads: 54 },
            { name: 'Autumn Line', downloads: 43 },
            { name: 'Winter Collection', downloads: 38 },
            { name: 'Holiday Special', downloads: 35 }
          ]
        },
        role: 'admin'
      });
    } finally {
      setLoading(false);
    }
  };

  // New AED currency formatter with specified format
  const formatAED = (amount) => {
    // Round to nearest whole number and format with commas
    const roundedAmount = Math.round(amount);
    return `AED ${new Intl.NumberFormat('en-US').format(roundedAmount)}`;
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  // Section 1: Buyers Cards
  const renderBuyersSection = () => {
    const { buyers } = dashboardData;
    const cards = [
      {
        title: 'Total Registered Buyers',
        value: formatNumber(buyers.totalRegisteredBuyers || 0),
        icon: <PeopleIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/admin/buyers')
      },
      {
        title: 'Active Buyers (Past 7 Days)',
        value: formatNumber(buyers.activeBuyers || 0),
        icon: <TrendingUpIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/admin/buyers')
      },
      {
        title: 'Pending Buyer Approvals',
        value: formatNumber(buyers.pendingBuyerApprovals || 0),
        icon: <PendingIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/admin/buyers')
      }
    ];

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#000000' }}>
          Buyers
        </Typography>
        <Divider sx={{ mb: 3, borderColor: '#000000' }} />
        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: 2,
                  background: SECTION_COLORS.buyers,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    borderColor: card.color
                  }
                }}
                onClick={card.onClick}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#000000', mb: 1 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 14, lineHeight: 1.4, color: '#000000' }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2 }}>
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Section 2: Orders Cards
  const renderOrdersSection = () => {
    const { orders } = dashboardData;
    const cards = [
      {
        title: 'Total Approved Orders',
        value: formatNumber(orders.totalOrders || 0),
        icon: <ShoppingCartIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      },
      {
        title: 'Approved Orders This Month',
        value: formatNumber(orders.ordersThisMonth || 0),
        icon: <TrendingUpIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      },
      {
        title: 'Pending Orders',
        value: formatNumber(orders.pendingOrders || 0),
        icon: <PendingIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      }
    ];

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#000000' }}>
          Orders
        </Typography>
        <Divider sx={{ mb: 3, borderColor: '#000000' }} />
        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: 2,
                  background: SECTION_COLORS.orders,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    borderColor: card.color
                  }
                }}
                onClick={card.onClick}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#000000', mb: 1 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 14, lineHeight: 1.4, color: '#000000' }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2 }}>
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Section 3: Catalogue Cards
  const renderCatalogueSection = () => {
    const { catalogue } = dashboardData;
    const cards = [
      {
        title: 'Total Brands (Folders)',
        value: formatNumber(catalogue.totalBrands || 0),
        icon: <FolderIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/catalogue')
      },
      {
        title: 'Total Stock Files',
        value: formatNumber(catalogue.totalStockFiles || 0),
        icon: <CollectionsIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/catalogue')
      },
      {
        title: 'New Stock Files This Month',
        value: formatNumber(catalogue.newStockFilesThisMonth || 0),
        icon: <TrendingUpIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/catalogue')
      }
    ];

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#000000' }}>
          Catalogue
        </Typography>
        <Divider sx={{ mb: 3, borderColor: '#000000' }} />
        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: 2,
                  background: SECTION_COLORS.catalogue,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    borderColor: card.color
                  }
                }}
                onClick={card.onClick}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#000000', mb: 1 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 14, lineHeight: 1.4, color: '#000000' }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2 }}>
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Section 4: KPIs Cards
  const renderKPIsSection = () => {
    const { kpis } = dashboardData;
    const cards = [
      {
        title: 'Total Revenue',
        value: formatAED(kpis.totalRevenue || 0),
        icon: <MonetizationOnIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      },
      {
        title: 'Revenue This Month',
        value: formatAED(kpis.revenueThisMonth || 0),
        icon: <TrendingUpIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      },
      {
        title: 'Total Units Sold',
        value: formatNumber(kpis.totalUnitsSold || 0),
        icon: <InventoryIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      },
      {
        title: 'Units Sold This Month',
        value: formatNumber(kpis.unitsSoldThisMonth || 0),
        icon: <TrendingUpIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      }
    ];

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#000000' }}>
          KPIs
        </Typography>
        <Divider sx={{ mb: 3, borderColor: '#000000' }} />
        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: 2,
                  background: SECTION_COLORS.kpis,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    borderColor: card.color
                  }
                }}
                onClick={card.onClick}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#000000', mb: 1 }}>
                        {card.value}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 14, lineHeight: 1.4, color: '#000000' }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2 }}>
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Top 5 Lists */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: 2,
                background: SECTION_COLORS.kpis,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  borderColor: '#000000'
                }
              }}
              onClick={() => navigate('/catalogue')}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: '#000000' }}>
                    Top 5 Downloaded Stock Files This Month
                  </Typography>
                  <DownloadIcon sx={{ color: '#000000', fontSize: 24 }} />
                </Box>
                <List dense>
                  {kpis.topDownloadedStockFiles?.slice(0, 5).map((stockFile, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ color: '#000000' }}>
                                {stockFile.name}
                              </Typography>
                              <Chip 
                                label={`${stockFile.downloads} downloads`} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                                  color: '#000000',
                                  border: '1px solid rgba(0, 0, 0, 0.2)'
                                }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < 4 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Buyer Dashboard Sections
  const renderBuyerOrdersSection = () => {
    const { summary } = dashboardData || {};
    if (!summary) {
      return (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#000000' }}>
            Orders
          </Typography>
          <Divider sx={{ mb: 3, borderColor: '#000000' }} />
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </Box>
      );
    }

    // First Row Cards (3 cards) - Order counts
    const firstRowCards = [
      {
        title: 'Approved Orders',
        value: formatNumber(summary.totalApprovedOrders || 0),
        icon: <ShoppingCartIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      },
      {
        title: 'Approved Orders This Month',
        value: formatNumber(summary.approvedOrdersThisMonth || 0),
        icon: <TrendingUpIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      },
      {
        title: 'Pending Orders',
        value: formatNumber(summary.pendingOrders || 0),
        icon: <PendingIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      }
    ];

    // Second Row Cards (2 cards) - Amount metrics
    const secondRowCards = [
      {
        title: 'Total Amount Bought',
        value: formatAED(summary.totalAmountBought || 0),
        icon: <MonetizationOnIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      },
      {
        title: 'Amount Bought This Month',
        value: formatAED(summary.amountBoughtThisMonth || 0),
        icon: <TrendingUpIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      }
    ];

    // Third Row Cards (2 cards) - Quantity metrics
    const thirdRowCards = [
      {
        title: 'Quantity Bought',
        value: formatNumber(summary.quantityBought || 0),
        icon: <InventoryIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      },
      {
        title: 'Quantity Bought This Month',
        value: formatNumber(summary.quantityBoughtThisMonth || 0),
        icon: <TrendingUpIcon sx={{ fontSize: 28, color: '#000000' }} />,
        color: '#000000',
        onClick: () => navigate('/orders')
      }
    ];

    const renderCard = (card, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <Card 
          sx={{ 
            height: '100%', 
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderRadius: 2,
            background: SECTION_COLORS.orders,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              borderColor: card.color
            }
          }}
          onClick={card.onClick}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#000000', mb: 1 }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14, lineHeight: 1.4, color: '#000000' }}>
                  {card.title}
                </Typography>
              </Box>
              <Box sx={{ ml: 2 }}>
                {card.icon}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#000000' }}>
          Orders
        </Typography>
        <Divider sx={{ mb: 3, borderColor: '#000000' }} />
        
        {/* First Row - Order counts - Light neutral/blue background */}
        <Box 
          sx={{ 
            mb: 3, 
            p: 3, 
            borderRadius: 2,
            background: '#f5f7fa', // Light neutral/blue background
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Grid container spacing={3}>
            {firstRowCards.map((card, index) => renderCard(card, index))}
          </Grid>
        </Box>

        {/* Second Row - Amount metrics - Light neutral/blue background */}
        <Box 
          sx={{ 
            mb: 3, 
            p: 3, 
            borderRadius: 2,
            background: '#f5f7fa', // Light neutral/blue background
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Grid container spacing={3}>
            {secondRowCards.map((card, index) => renderCard(card, index))}
          </Grid>
        </Box>

        {/* Third Row - Quantity metrics - Light neutral/blue background */}
        <Box 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            background: '#f5f7fa', // Light neutral/blue background
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Grid container spacing={3}>
            {thirdRowCards.map((card, index) => renderCard(card, index))}
          </Grid>
        </Box>
      </Box>
    );
  };

  const renderBuyerCatalogueSection = () => {
    const { brandsAvailable, stockFilesAvailable } = dashboardData || {};
    if (brandsAvailable === undefined || stockFilesAvailable === undefined) {
      return (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#000000' }}>
            Catalogue
          </Typography>
          <Divider sx={{ mb: 3, borderColor: '#000000' }} />
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </Box>
      );
    }

    const cards = [
      {
        title: 'Brands Available',
        value: formatNumber(brandsAvailable || 0),
        icon: <FolderIcon sx={{ fontSize: 28, color: '#000000' }} />, 
        color: '#000000',
        onClick: () => navigate('/catalogue')
      },
      {
        title: 'Stock Files Available',
        value: formatNumber(stockFilesAvailable || 0),
        icon: <CollectionsIcon sx={{ fontSize: 28, color: '#000000' }} />, 
        color: '#000000',
        onClick: () => navigate('/catalogue')
      }
    ];

    const renderCard = (card, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <Card 
          sx={{ 
            height: '100%', 
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderRadius: 2,
            background: SECTION_COLORS.catalogue,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              borderColor: card.color
            }
          }}
          onClick={card.onClick}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#000000', mb: 1 }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14, lineHeight: 1.4, color: '#000000' }}>
                  {card.title}
                </Typography>
              </Box>
              <Box sx={{ ml: 2 }}>
                {card.icon}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#000000' }}>
          Catalogue
        </Typography>
        <Divider sx={{ mb: 3, borderColor: '#000000' }} />
        {/* Catalogue Row - Light neutral/blue background */}
        <Box 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            background: '#f5f7fa', // Light neutral/blue background (consistent with orders)
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Grid container spacing={3}>
            {cards.map((card, index) => renderCard(card, index))}
          </Grid>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const isAdmin = dashboardData.role === 'admin';

  if (!isAdmin) {
    // Return buyer dashboard with comprehensive buyer-specific data
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#000000' }}>
            Buyer Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            disabled={loading}
            sx={{ 
              borderColor: '#000000', 
              color: '#000000',
              '&:hover': {
                borderColor: '#000000',
                backgroundColor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Section 1: Orders */}
        {renderBuyerOrdersSection()}

        {/* Section 2: Catalogue */}
        {renderBuyerCatalogueSection()}
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#000000' }}>
          Admin Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={loading}
          sx={{ 
            borderColor: '#000000', 
            color: '#000000',
            '&:hover': {
              borderColor: '#000000',
              backgroundColor: 'rgba(0,0,0,0.04)'
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Section 1: Buyers */}
      {renderBuyersSection()}

      {/* Section 2: Orders */}
      {renderOrdersSection()}

      {/* Section 3: Catalogue */}
      {renderCatalogueSection()}

      {/* Section 4: KPIs */}
      {renderKPIsSection()}
    </Container>
  );
};

export default Dashboard; 