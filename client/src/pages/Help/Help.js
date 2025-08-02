import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import Slide from '@mui/material/Slide';
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Help as HelpIcon,
  Support as SupportIcon,
  AccountBalance as BankIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Error as ErrorIcon,
  Euro as EuroIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const aedIconUrl = process.env.PUBLIC_URL + '/UAE_Dirham_Symbol.svg';

const Help = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeCurrencyTab, setActiveCurrencyTab] = useState(0);
  const [showDetails, setShowDetails] = useState(true);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCurrencyTabChange = (event, newValue) => {
    setShowDetails(false);
    setTimeout(() => {
      setActiveCurrencyTab(newValue);
      setShowDetails(true);
    }, 200); // 0.2s delay before showing details
  };

  const orderSteps = [
    {
      label: 'Browse the Catalogue',
      description: 'Go to the Catalogue tab and download the Excel files for the brands you\'re interested in',
      icon: <DownloadIcon sx={{ color: 'white', fontSize: 32 }} />
    },
    {
      label: 'Fill in Your Order Details',
      description: 'Open the Excel file, enter the lot quantity for each SKU, click the "Save Order" button to generate a copy, and save it to your device',
      icon: <EditIcon sx={{ color: 'white', fontSize: 32 }} />
    },
    {
      label: 'Create Your Order',
      description: 'Go to the Orders tab, click "Create New Order," select the relevant brand and file, upload the completed Excel file, and submit your order',
      icon: <ShoppingCartIcon sx={{ color: 'white', fontSize: 32 }} />
    },
    {
      label: 'Order Review',
      description: 'Your order will be reviewed by our team, and you\'ll be notified of the approval status directly through the platform',
      icon: <VisibilityIcon sx={{ color: 'white', fontSize: 32 }} />
    },
    {
      label: 'Invoice & Coordination',
      description: 'If approved, an invoice will appear in the Orders tab, and payment and logistics will be coordinated via the platform or directly with our team',
      icon: <PaymentIcon sx={{ color: 'white', fontSize: 32 }} />
    }
  ];

  const helpSection = {
    title: 'Need help?',
    description: 'Contact us via the in-platform chat or call our support team'
  };

  const renderOrderGuide = () => (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#000000' }}>
        🧾 Step-by-Step Guide
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {orderSteps.map((step, index) => (
          <Grow 
            key={index} 
            in={true} 
            timeout={500 + (index * 200)}
            style={{ transformOrigin: '0 0 0' }}
          >
            <Card 
              sx={{ 
                bgcolor: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  borderColor: '#1976d2'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {/* Step Icon Circle */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#1976d2',
                    color: 'white',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                  }}>
                    {step.icon}
                  </Box>

                  {/* Step Content */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h5" fontWeight="bold" color="#1976d2">
                        {index + 1}.
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="#1976d2">
                        {step.label}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        ))}
      </Box>

      {/* Support Note */}
      <Fade in={true} timeout={1000}>
        <Alert 
          severity="info" 
          icon={<SupportIcon />}
          sx={{ 
            mt: 4,
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            {helpSection.title}
          </Typography>
          <Typography variant="body2">
            {helpSection.description}
          </Typography>
        </Alert>
      </Fade>
    </Box>
  );

  const renderBankDetails = () => {
    const bankDetails = {
      accountNumber: 'AED 1014295349401',
      accountName: 'CODE DESIGN APPAREL LLC',
      iban: 'AE 510260001014295349401',
      registeredAddress: 'WAREHOUS1, JAFZA, AL KHABAISI DEIRA, DUBAI, SATARI OUTLET, DUBAI, DUBAI, 88109, UNITED ARAB EMIRATES',
      bankName: 'Emirates NBD',
      branchName: 'DEIRA CITY CENTRE',
      swiftCode: 'EBILAEAD'
    };

    const eurBankDetails = {
      accountNumber: 'EUR 1024295349403',
      accountName: 'CODE DESIGN APPAREL LLC',
      iban: 'AE 320260001024295349403',
      registeredAddress: 'WAREHOUS1, JAFZA, AL KHABAISI DEIRA, DUBAI, SATARI OUTLET, DUBAI, DUBAI, 88109, UNITED ARAB EMIRATES',
      bankName: 'Emirates NBD',
      branchName: 'DEIRA CITY CENTRE',
      swiftCode: 'EBILAEAD'
    };

    const usdBankDetails = {
      accountNumber: 'USD 1014295349401',
      accountName: 'CODE DESIGN APPAREL LLC',
      iban: 'AE 510260001014295349401',
      registeredAddress: 'WAREHOUS1, JAFZA, AL KHABAISI DEIRA, DUBAI, SATARI OUTLET, DUBAI, DUBAI, 88109, UNITED ARAB EMIRATES',
      bankName: 'Emirates NBD',
      branchName: 'DEIRA CITY CENTRE',
      swiftCode: 'EBILAEAD'
    };

    const currencies = [
      { label: 'AED Bank Account', value: 'AED', icon: <img src={aedIconUrl} alt="AED" style={{ width: 20, height: 20, filter: 'invert(32%) sepia(92%) saturate(2097%) hue-rotate(186deg) brightness(92%) contrast(92%)', verticalAlign: 'middle' }} /> },
      { label: 'EUR Bank Account', value: 'EUR', icon: <EuroIcon sx={{ color: '#1976d2', fontSize: 24 }} /> },
      { label: 'USD Bank Account', value: 'USD', icon: <AttachMoneyIcon sx={{ color: '#1976d2', fontSize: 24 }} /> }
    ];

    const renderCurrencyTab = (currency) => {
      // Select the appropriate bank details based on currency
      let selectedBankDetails;
      switch (currency) {
        case 'AED':
          selectedBankDetails = bankDetails;
          break;
        case 'EUR':
          selectedBankDetails = eurBankDetails;
          break;
        case 'USD':
          selectedBankDetails = usdBankDetails;
          break;
        default:
          selectedBankDetails = bankDetails;
      }

      return (
        <Box sx={{ mt: 0 }}>
          <Card sx={{ mb: 3, bgcolor: '#f5f7fa', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <BankIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                <Typography variant="h6" fontWeight="bold">
                  {currency} Bank Account Details
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1976d2" gutterBottom>
                    Account Number:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ textAlign: 'left' }}>
                    {selectedBankDetails.accountNumber}
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1976d2" gutterBottom>
                    Account Name:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ textAlign: 'left' }}>
                    {selectedBankDetails.accountName}
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1976d2" gutterBottom>
                    IBAN:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ textAlign: 'left' }}>
                    {selectedBankDetails.iban}
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1976d2" gutterBottom>
                    Registered Address:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ textAlign: 'left' }}>
                    {selectedBankDetails.registeredAddress}
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1976d2" gutterBottom>
                    Bank Name:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ textAlign: 'left' }}>
                    {selectedBankDetails.bankName}
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1976d2" gutterBottom>
                    Branch Name:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ textAlign: 'left' }}>
                    {selectedBankDetails.branchName}
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="#1976d2" gutterBottom>
                    Swift Code:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ textAlign: 'left' }}>
                    {selectedBankDetails.swiftCode}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

        <Box sx={{
          mt: 3,
          p: 2.5,
          borderRadius: 2,
          bgcolor: '#fff3cd',
          color: '#b26a00',
          border: '1.5px solid #ffeeba',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          fontWeight: 500,
          fontSize: '1rem',
        }}>
          <WarningIcon sx={{ color: '#ffa000', fontSize: 22, flexShrink: 0 }} />
          <Box>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#b26a00' }}>
              Important
            </Typography>
            <Typography variant="body2" sx={{ color: '#b26a00' }}>
              Please wait for order approval before making any payment
            </Typography>
          </Box>
        </Box>
      </Box>
    );

    return (
      <Box>
        {/* Currency Tab Navigation - Appears Instantly */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs 
            value={activeCurrencyTab} 
            onChange={handleCurrencyTabChange}
            sx={{
              '& .MuiTab-root': {
                minHeight: 56,
                fontSize: '0.9rem',
                fontWeight: 500
              }
            }}
          >
            {currencies.map((currency, index) => (
              <Tab 
                key={currency.value}
                label={currency.label} 
                icon={currency.icon} 
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Paper>

        {/* Currency Tab Content - Appears with Animation */}
        <Fade in={showDetails} timeout={200} key={activeCurrencyTab}>
          <Box sx={{ mt: 3 }}>
            {activeCurrencyTab === 0 && renderCurrencyTab('AED')}
            {activeCurrencyTab === 1 && renderCurrencyTab('EUR')}
            {activeCurrencyTab === 2 && renderCurrencyTab('USD')}
          </Box>
        </Fade>
      </Box>
    );
  };

  const renderOrderStatusDefinitions = () => {
    const statusDefinitions = [
      {
        status: 'Pending Review',
        definition: 'Your order has been submitted and is currently under review by our team',
        icon: <ScheduleIcon sx={{ color: '#FFD700', fontSize: 24 }} />,
        color: '#FFD700',
        bgColor: '#FFF8E1'
      },
      {
        status: 'Awaiting Payment',
        definition: 'Your order has been approved and is being processed for shipment; please send payment as soon as possible',
        icon: <PaymentIcon sx={{ color: '#FF8C00', fontSize: 24 }} />,
        color: '#FF8C00',
        bgColor: '#FFF3E0'
      },
      {
        status: 'Completed',
        definition: 'Your order has been fully processed, payment received, and fulfillment finalized',
        icon: <CheckCircleOutlineIcon sx={{ color: '#4CAF50', fontSize: 24 }} />,
        color: '#4CAF50',
        bgColor: '#E8F5E8'
      },
      {
        status: 'Rejected',
        definition: 'Your order was not approved, and a reason for rejection has been provided',
        icon: <ErrorIcon sx={{ color: '#F44336', fontSize: 24 }} />,
        color: '#F44336',
        bgColor: '#FFEBEE'
      },
      {
        status: 'Cancelled',
        definition: 'This order was cancelled by you or the admin and will not be processed further',
        icon: <CancelIcon sx={{ color: '#D3D3D3', fontSize: 24 }} />,
        color: '#D3D3D3',
        bgColor: '#F5F5F5'
      }
    ];

    return (
      <Box>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#000000' }}>
          📌 Definitions
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {statusDefinitions.map((item, index) => (
            <Grow 
              key={index} 
              in={true} 
              timeout={500 + (index * 200)}
              style={{ transformOrigin: '0 0 0' }}
            >
              <Card 
                sx={{ 
                  bgcolor: item.bgColor,
                  border: `2px solid ${item.color}`,
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Status Icon */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      color: item.color,
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: `2px solid ${item.color}`
                    }}>
                      {item.icon}
                    </Box>

                    {/* Status Content */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: '#000000', mb: 1 }}>
                        {item.status}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#000000', lineHeight: 1.6 }}>
                        {item.definition}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Fade in={true} timeout={300}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#000000', mb: 2 }}>
            Help Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find answers to common questions and learn how to use our platform effectively
          </Typography>
        </Box>
      </Fade>

      {/* Tab Navigation */}
      <Slide direction="down" in={true} timeout={500}>
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          >
            <Tab 
              label="How to Place an Order" 
              icon={<ShoppingCartIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Order Status Definitions" 
              icon={<HelpIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Bank Transfer Details" 
              icon={<BankIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Paper>
      </Slide>

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && renderOrderGuide()}
        {activeTab === 1 && renderOrderStatusDefinitions()}
        {activeTab === 2 && renderBankDetails()}
      </Box>
    </Container>
  );
};

export default Help; 