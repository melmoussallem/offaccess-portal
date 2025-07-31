import React, { useState, useEffect, useCallback } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
  Payment as PaymentIcon,
  Restore as RestoreIcon,
  Info as InfoIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../../config/api';

// AED currency formatter with specified format
const formatAED = (amount) => {
  // Round to nearest whole number and format with commas
  const roundedAmount = Math.round(amount);
  return `AED ${new Intl.NumberFormat('en-US').format(roundedAmount)}`;
};

// Utility to strip file extension
const stripFileExtension = (filename) => filename ? filename.replace(/\.[^/.]+$/, '') : '';

const Orders = () => {
  console.log('🔄 Orders component initializing...');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  console.log('👤 User role:', user?.role, 'Is admin:', isAdmin);
  
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('create'); // 'create', 'approve', 'reject', 'payment'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrderForMenu, setSelectedOrderForMenu] = useState(null);
  
  // Form states
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [brands, setBrands] = useState([]);
  const [stockFiles, setStockFiles] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingStockFiles, setLoadingStockFiles] = useState(false);
  
  // Admin create order states
  const [selectedBuyer, setSelectedBuyer] = useState('');
  const [buyers, setBuyers] = useState([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Custom status color mapping with specific hex colors
  const getStatusChipProps = (status) => {
    switch (status) {
      case 'Pending Review':
      case 'Order Pending Approval': // legacy fallback
        return {
          sx: {
            backgroundColor: '#FFD700', // Yellow
            color: '#000000',
            fontWeight: 'bold'
          }
        };
      case 'Awaiting Payment':
      case 'Approved - Awaiting Payment': // legacy fallback
        return {
          sx: {
            backgroundColor: '#FF8C00', // Orange
            color: '#FFFFFF',
            fontWeight: 'bold'
          }
        };
      case 'Completed':
      case 'Order Completed - Payment Received': // legacy fallback
        return {
          sx: {
            backgroundColor: '#4CAF50', // Green
            color: '#FFFFFF',
            fontWeight: 'bold'
          }
        };
      case 'Cancelled':
        return {
          sx: {
            backgroundColor: '#D3D3D3', // Light Grey
            color: '#000000',
            fontWeight: 'bold'
          }
        };
      case 'Rejected':
        return {
          sx: {
            backgroundColor: '#F44336', // Red
            color: '#FFFFFF',
            fontWeight: 'bold'
          }
        };
      default:
        return {
          sx: {
            backgroundColor: '#E0E0E0', // Default grey
            color: '#000000'
          }
        };
    }
  };

  // Load orders
  const loadOrders = useCallback(async () => {
    try {
      console.log('📋 Loading orders...');
      setLoading(true);
      const response = await fetch(getApiUrl('api/orders'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load orders');
      
      const data = await response.json();
      console.log('📋 Orders loaded:', data.length, 'orders');
      console.log('📋 First order status:', data[0]?.status);
      setOrders(data);
    } catch (err) {
      console.error('❌ Error loading orders:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load brands and collections
  const loadBrandsAndStockFiles = useCallback(async () => {
    try {
      setLoadingBrands(true);
      if (user?.role === 'admin') {
        // For admins, fetch all brands
        const brandsResponse = await fetch(getApiUrl('api/brands'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (brandsResponse.ok) {
          const brandsData = await brandsResponse.json();
          setBrands(brandsData.brands || []);
        } else {
          console.error('Failed to fetch brands:', brandsResponse.status);
          setBrands([]);
        }
      } else {
        // For buyers, fetch accessible brands using the same endpoint as Catalogue
        const brandsResponse = await fetch(getApiUrl('api/catalogue/brands/accessible'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (brandsResponse.ok) {
          const brandsData = await brandsResponse.json();
          setBrands(brandsData || []);
        } else {
          console.error('Failed to fetch accessible brands:', brandsResponse.status);
          setBrands([]);
        }
      }

      // Collections will be loaded when a brand is selected
      setStockFiles([]);
    } catch (error) {
      console.error('Error loading brands and collections:', error);
      setBrands([]);
      setStockFiles([]);
    } finally {
      setLoadingBrands(false);
    }
  }, [user?.role]);

  // Load approved buyers for admin create order
  const loadApprovedBuyers = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      setLoadingBuyers(true);
      const response = await fetch(getApiUrl('api/buyers?status=approved&limit=1000'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBuyers(data.buyers || []);
      } else {
        console.error('Failed to fetch approved buyers:', response.status);
        setBuyers([]);
      }
    } catch (error) {
      console.error('Error loading approved buyers:', error);
      setBuyers([]);
    } finally {
      setLoadingBuyers(false);
    }
  }, [isAdmin]);

  // Load inventory status for an order
  const loadInventoryStatus = useCallback(async (orderId) => {
    if (!isAdmin) return;
    
    try {
      const response = await fetch(getApiUrl(`api/orders/${orderId}/inventory-status`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // eslint-disable-next-line no-unused-vars
        const data = await response.json();
        // This state is no longer used, but keeping it for now as per instructions
        // setInventoryStatus(prev => ({
        //   ...prev,
        //   [orderId]: data
        // }));
      }
    } catch (error) {
      console.error('Error loading inventory status:', error);
    }
  }, [isAdmin]);

  // Reverse inventory deduction
  const handleReverseInventory = async (orderId) => {
    try {
      const response = await fetch(getApiUrl(`api/orders/${orderId}/reverse-inventory`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reverse inventory');
      }

      const result = await response.json();
      console.log('Inventory reversed:', result);
      
      // Reload inventory status
      await loadInventoryStatus(orderId);
      
      // Show success message
      setError(null);
      // You might want to add a success notification here
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadOrders();
    loadBrandsAndStockFiles();
    if (isAdmin) {
      loadApprovedBuyers();
    }
  }, [loadOrders, loadBrandsAndStockFiles, loadApprovedBuyers, isAdmin]);

  // Load inventory status when orders change
  useEffect(() => {
    if (isAdmin && orders.length > 0) {
      orders.forEach(order => {
        if (order.inventoryDeducted) {
          loadInventoryStatus(order._id);
        }
      });
    }
  }, [orders, isAdmin, loadInventoryStatus]);

  // Handle brand selection
  const handleBrandChange = async (brandId) => {
    setSelectedBrand(brandId);
    setSelectedFile(''); // Reset file selection when brand changes
    
    if (!brandId) {
      setStockFiles([]);
      return;
    }
    
    // Load collections (Excel files) for the selected brand
    try {
      setLoadingStockFiles(true);
      const response = await fetch(getApiUrl(`api/catalogue/${brandId}/stock-files`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          // Buyer doesn't have access to this brand
          setStockFiles([]);
          setError('You do not have access to this brand');
          return;
        } else if (response.status === 404) {
          // Brand not found
          setStockFiles([]);
          setError('Brand not found');
          return;
        } else {
          throw new Error('Failed to fetch stock files');
        }
      }
      
      const data = await response.json();
      const stockFiles = data.stockFiles || [];
      setStockFiles(stockFiles);
      
      // Clear any previous errors
      setError(null);
    } catch (error) {
      console.error('Error loading stock files:', error);
      setStockFiles([]);
      setError('Failed to load stock files');
    } finally {
      setLoadingStockFiles(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
        setInvoiceFile(file);
  };

  // Create new order
  const handleCreateOrder = async () => {
    try {
      // For admin, validate buyer selection
      if (isAdmin && !selectedBuyer) {
        setError('Please select a buyer for this order');
        return;
      }

      if (!selectedBrand || !selectedFile || !invoiceFile) {
        setError('Please fill in all required fields and upload your Excel file');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.ms-excel.sheet.macroEnabled.12'
      ];
      
      if (!allowedTypes.includes(invoiceFile.type)) {
        setError('Please upload a valid Excel file (.xlsx, .xls, or .xlsm)');
        return;
      }

      const formData = new FormData();
      formData.append('brand', selectedBrand);
      formData.append('file', selectedFile);
      formData.append('excelFile', invoiceFile);
      
      // Add buyer ID for admin order creation
      if (isAdmin) {
        formData.append('buyerId', selectedBuyer);
      }

      const response = await fetch(getApiUrl('api/orders'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create order';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // fallback to default message
        }
        throw new Error(errorMessage);
      }

      await loadOrders();
      handleCloseDialog();
      setError(null);
      setSnackbar({ 
        open: true, 
        message: isAdmin ? 'Order created successfully for selected buyer' : 'Order created successfully', 
        severity: 'success' 
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Approve order
  const handleApproveOrder = async () => {
    console.log('🎯 handleApproveOrder function called!');
    try {
      console.log('🔄 Starting order approval process...');
      console.log('Selected order:', selectedOrder);
      console.log('Invoice file:', invoiceFile);
      
      if (!invoiceFile) {
        setError('Please upload an invoice');
        return;
      }

      const formData = new FormData();
      formData.append('invoiceFile', invoiceFile);

      console.log('📤 Sending approval request to:', getApiUrl(`api/orders/${selectedOrder._id}/approve`));
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await fetch(getApiUrl(`api/orders/${selectedOrder._id}/approve`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        console.log('❌ Approval request failed');
        const errorData = await response.json();
        console.log('Error data:', errorData);
        
        // Handle inventory-specific errors
        if (errorData.inventoryError) {
          let errorMessage = `Order cannot be approved: ${errorData.inventoryError}`;
          
          // Add details about insufficient items if available
          if (errorData.insufficientItems && errorData.insufficientItems.length > 0) {
            errorMessage += '\n\nInsufficient inventory for:';
            errorData.insufficientItems.forEach(item => {
              errorMessage += `\n• Reference ID ${item.referenceId}: Requested ${item.quantityRequested}, Available ${item.availableQuantity}`;
            });
          }
          
          console.log('Setting inventory error:', errorMessage);
          setError(errorMessage);
          return;
        }
        
        console.log('Setting general error:', errorData.error || 'Failed to approve order');
        throw new Error(errorData.error || 'Failed to approve order');
      }

      console.log('✅ Approval request successful');
      const responseData = await response.json();
      console.log('Response data:', responseData);
      console.log('📊 Approved order status:', responseData.status);
      console.log('📊 Approved order inventory status:', responseData.inventoryStatus);

      await loadOrders();
      handleCloseDialog();
      setError(null);
      setSnackbar({ open: true, message: 'Order approved successfully', severity: 'success' });
    } catch (err) {
      setError(err.message);
    }
  };

  // Reject order
  const handleRejectOrder = async () => {
    try {
      const response = await fetch(getApiUrl(`api/orders/${selectedOrder._id}/reject`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Order rejected successfully', severity: 'success' });
      handleCloseDialog();
        loadOrders();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to reject order');
      }
    } catch (error) {
      setError('Failed to reject order');
    }
  };

  // Confirm payment
  const handleConfirmPayment = async () => {
    try {
      const response = await fetch(getApiUrl(`api/orders/${selectedOrder._id}/payment`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ note: paymentNote })
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Payment confirmed successfully', severity: 'success' });
      handleCloseDialog();
        loadOrders();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to confirm payment');
      }
    } catch (error) {
      setError('Failed to confirm payment');
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(getApiUrl(`api/orders/${orderId}/cancel`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to cancel order');

      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  // Download file
  const handleDownloadFile = async (orderId, fileType) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find the order to get the brand and collection information
      const order = orders.find(o => o._id === orderId);
      if (!order) {
        setError('Order not found');
        return;
      }

      console.log('Order for download:', order); // Debug log

      // Use the orders download endpoint
      const response = await fetch(getApiUrl(`api/orders/${orderId}/download/${fileType}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || 'Failed to download file');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${fileType}_${order.orderNumber}.xlsx`; // fallback
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSnackbar({
        open: true,
        message: `${fileType === 'invoice' ? 'Invoice' : 'Order'} downloaded successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Download error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download file. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Dialog handlers
  const handleOpenDialog = (type, order = null) => {
    console.log('📋 Opening dialog:', type, 'Order:', order);
    setDialogType(type);
    setSelectedOrder(order);
    setDialogOpen(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    console.log('🚪 Closing dialog...');
    setDialogOpen(false);
    setSelectedOrder(null);
    setSelectedBrand('');
    setSelectedFile('');
    setInvoiceFile(null);
    setRejectionReason('');
    setPaymentNote('');
    setCancellationReason('');
    setSelectedBuyer('');
    setError(null);
    setStockFiles([]); // Reset collections when dialog closes
  };

  // Menu handlers
  const handleMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderForMenu(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderForMenu(null);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Check if invoice column should be shown for buyers
  const shouldShowInvoiceColumn = () => {
    return true;
  };

  // Render dialog content
  const renderDialogContent = () => {
    // Ensure brands is always an array
    const safeBrands = Array.isArray(brands) ? brands : [];
    
    switch (dialogType) {
      case 'create':
    return (
      <Box sx={{ py: 1 }}>
        {/* Show error message inside the dialog for create orders */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Admin-only buyer selection dropdown */}
        {isAdmin && (
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth required>
              <InputLabel>Select Buyer</InputLabel>
              <Select
                value={selectedBuyer}
                onChange={(e) => setSelectedBuyer(e.target.value)}
                label="Select Buyer"
                disabled={loadingBuyers}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              >
                {loadingBuyers ? (
                  <MenuItem disabled>Loading buyers...</MenuItem>
                ) : buyers.length === 0 ? (
                  <MenuItem disabled>No approved buyers found</MenuItem>
                ) : (
                  buyers.map((buyer) => (
                    <MenuItem key={buyer._id} value={buyer._id}>
                      {buyer.name} - {buyer.companyName}
                    </MenuItem>
                  ))
                )}
              </Select>
              {buyers.length === 0 && !loadingBuyers && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  No approved buyers found. Please approve some buyers first.
                </Typography>
              )}
            </FormControl>
          </Box>
        )}
        
        {/* Brand Selection */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth required>
            <InputLabel>Choose Brand</InputLabel>
            <Select
              value={selectedBrand}
              onChange={(e) => handleBrandChange(e.target.value)}
              label="Choose Brand"
              disabled={loadingBrands}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            >
              {loadingBrands ? (
                <MenuItem disabled>Loading brands...</MenuItem>
              ) : safeBrands.length === 0 ? (
                <MenuItem disabled>No available brands found</MenuItem>
              ) : (
                safeBrands.map((brand) => (
                  <MenuItem key={brand._id} value={brand._id}>
                    {brand.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {safeBrands.length === 0 && !loadingBrands && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                No available brands found. Please contact support or your account manager.
              </Typography>
            )}
          </FormControl>
        </Box>
        
        {/* Collection Selection */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth required>
            <InputLabel>Choose Stock File</InputLabel>
            <Select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              label="Choose Stock File"
              disabled={!selectedBrand || loadingStockFiles}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            >
              {loadingStockFiles ? (
                <MenuItem disabled>Loading stock files...</MenuItem>
              ) : stockFiles.length === 0 ? (
                <MenuItem disabled>
                  {selectedBrand ? 'No stock files available for this brand' : 'Please select a brand first'}
                </MenuItem>
              ) : (
                stockFiles.map((stockFile) => (
                  <MenuItem key={stockFile._id} value={stockFile._id}>
                    {(() => {
                      const name = stockFile.originalName || stockFile.fileName;
                      return name.replace(/\.(xlsx|xlsm|xls)$/i, '');
                    })()}
                  </MenuItem>
                ))
              )}
            </Select>
            {stockFiles.length === 0 && selectedBrand && !loadingStockFiles && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                No stock files available for this brand. Please check the Catalogue for available stock files.
              </Typography>
            )}
          </FormControl>
        </Box>
        
        {/* File Upload Section */}
        <Box sx={{ mb: 3 }}>
          <input
            accept=".xlsx,.xls,.xlsm"
            style={{ display: 'none' }}
            id="excel-file-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="excel-file-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              startIcon={<UploadIcon />}
              sx={{ 
                borderStyle: 'dashed',
                borderWidth: 2,
                py: 3,
                borderRadius: 2,
                borderColor: '#1976d2',
                color: '#1976d2',
                backgroundColor: '#f8f9fa',
                '&:hover': {
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: '#1565c0',
                  backgroundColor: '#e3f2fd',
                  color: '#1565c0'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {invoiceFile ? invoiceFile.name : 'Choose Excel file (.xlsx, .xls, .xlsm)'}
            </Button>
          </label>
          {invoiceFile && (
            <Box sx={{ 
              mt: 1, 
              p: 1.5, 
              bgcolor: '#e8f5e8', 
              borderRadius: 1, 
              border: '1px solid #4caf50',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 16 }} />
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                File selected: {invoiceFile.name}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Help Link */}
        <Box sx={{ 
          mt: 2, // slightly less margin top
          p: 1, // reduce padding from 2 to 1
          bgcolor: '#f0f8ff', 
          borderRadius: 2, 
          border: '1px solid #e3f2fd',
          textAlign: 'center',
          minHeight: 0 // ensure no extra height
        }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
            Need help placing an order?
          </Typography>
          <Link 
            to="/help" 
            style={{ 
              color: '#1976d2', 
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            📖 View the step-by-step guide
          </Link>
        </Box>
      </Box>
    );

      case 'approve':
        return (
          <div>
            {/* Show error message inside the dialog for approve orders */}
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {(() => {
                  // Format insufficient inventory errors with bullets only, no repeated main text
                  if (typeof error === 'string' && error.includes('Insufficient inventory for:')) {
                    const details = error.split('Insufficient inventory for:')[1];
                    return (
                      <>
                        <span style={{ fontWeight: 500 }}>Insufficient inventory for:</span>
                        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                          {details.split('•').map(line => line.trim()).filter(line => line.length > 0).map((line, idx) => (
                            <li key={idx} style={{ marginBottom: 2 }}>{line}</li>
                          ))}
                        </ul>
                      </>
                    );
                  }
                  // Format Google Sheet not found errors
                  if (typeof error === 'string' && error.includes('Failed to find Google Sheet file')) {
                    const match = error.match(/No Google Sheet file found with name: "([^"]+)"/);
                    const sheetName = match ? match[1] : 'the required collection';
                    return (
                      <>
                        <span style={{ fontWeight: 500 }}>Inventory deduction failed:</span><br/>
                        No Google Sheet file found for "{sheetName}".<br/>
                        Please check the inventory setup for this brand/collection.
                      </>
                    );
                  }
                  return error;
                })()}
              </Alert>
            )}
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please upload the invoice for this order. The order will be approved and inventory will be deducted.
            </Typography>
            <FormControl fullWidth margin="normal" required>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Upload Invoice File
              </Typography>
              <input
                accept=".pdf,.xlsx,.xls,.xlsm"
                style={{ display: 'none' }}
                id="invoice-file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="invoice-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<UploadIcon />}
                  sx={{ 
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    py: 2,
                    '&:hover': {
                      borderStyle: 'dashed',
                      borderWidth: 2
                    }
                  }}
                >
                  {invoiceFile ? invoiceFile.name : 'Choose invoice file (.pdf, .xlsx, .xls, .xlsm)'}
                </Button>
              </label>
              {invoiceFile && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  ✓ File selected: {invoiceFile.name}
                </Typography>
              )}
            </FormControl>
            <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
              <strong>Note:</strong> Upon approval, the order status will be changed to "Awaiting Payment" 
            </Typography>
          </div>
        );

      case 'reject':
        return (
          <div>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please provide a reason for rejecting this order (optional).
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason for Rejection"
              placeholder="Enter reason for rejection (optional)"
              value={rejectionReason || ''}
              onChange={(e) => setRejectionReason(e.target.value)}
              margin="normal"
            />
            
            <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
              <strong>Note:</strong> The order status will be changed to "Rejected". 
              No changes will be made to inventory.
            </Typography>
          </div>
        );

      case 'payment':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Confirm that payment has been received for this order.
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              This action will mark the order as completed.
            </Typography>
          </Box>
        );

      case 'delete':
        return (
          <div>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Warning</AlertTitle>
              This action will permanently delete the order and cannot be undone.
            </Alert>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to permanently delete this order?
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              <strong>Order Details:</strong>
              <br />
              Order Number: {selectedOrder?.orderNumber}
              <br />
              Buyer: {selectedOrder?.buyerName} ({selectedOrder?.companyName})
              <br />
              Brand: {selectedOrder?.brand}
              <br />
              Stock File: {selectedOrder?.stockFile}
              <br />
              Status: {selectedOrder?.status}
            </Typography>
            
            <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold' }}>
              This action cannot be undone. The order and all associated files will be permanently removed from the system.
            </Typography>
          </div>
        );

      case 'admin-cancel':
        return (
          <div>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please provide a reason for cancelling this order (optional).
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason for Cancellation"
              placeholder="Enter reason for cancellation (optional)"
              value={cancellationReason || ''}
              onChange={(e) => setCancellationReason(e.target.value)}
              margin="normal"
            />
            
            <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
              <strong>Note:</strong> The order status will be changed to "Cancelled". 
              {selectedOrder?.inventoryDeducted && (
                <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
                  {' '}Inventory that was deducted for this order will be automatically restored.
                </span>
              )}
            </Typography>
          </div>
        );

      case 'replace-attachment':
        return (
          <div>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Replace the attachment for your pending order. The new file will update the order totals.
            </Typography>
            
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Order Details:
              </Typography>
              <Typography variant="body2">
                <strong>Order:</strong> {selectedOrder?.orderNumber}<br />
                <strong>Brand:</strong> {selectedOrder?.brand}<br />
                <strong>Stock File:</strong> {selectedOrder?.stockFile}<br />
                <strong>Current Total Quantity:</strong> {selectedOrder?.totalQuantity}<br />
                <strong>Current Total Amount:</strong> {formatAED(selectedOrder?.totalAmount)}
              </Typography>
            </Box>
            
            <FormControl fullWidth margin="normal" required>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Upload New Excel File
              </Typography>
              <input
                accept=".xlsx,.xls,.xlsm"
                style={{ display: 'none' }}
                id="replace-excel-file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="replace-excel-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<UploadIcon />}
                  sx={{ 
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    py: 2,
                    '&:hover': {
                      borderStyle: 'dashed',
                      borderWidth: 2
                    }
                  }}
                >
                  {invoiceFile ? invoiceFile.name : 'Choose Excel file (.xlsx, .xls, .xlsm)'}
                </Button>
              </label>
              {invoiceFile && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  ✓ File selected: {invoiceFile.name}
                </Typography>
              )}
            </FormControl>
            
            <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
              <strong>Note:</strong> The new file will replace the current attachment and update the order totals. 
              The order status will remain "Pending Review".
            </Typography>
          </div>
        );

      case 'admin-replace-attachment':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Replace the attachment for your pending order. The new file will update the order totals.
            </Typography>
            
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Order Details:
              </Typography>
              <Typography variant="body2">
                <strong>Order:</strong> {selectedOrder?.orderNumber}<br />
                <strong>Brand:</strong> {selectedOrder?.brand}<br />
                <strong>Stock File:</strong> {selectedOrder?.stockFile}<br />
                <strong>Current Total Quantity:</strong> {selectedOrder?.totalQuantity}<br />
                <strong>Current Total Amount:</strong> {formatAED(selectedOrder?.totalAmount)}
              </Typography>
            </Box>
            
            <FormControl fullWidth margin="normal" required>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Upload New Excel File
              </Typography>
              <input
                accept=".xlsx,.xls,.xlsm"
                style={{ display: 'none' }}
                id="replace-attachment-file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="replace-attachment-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<EditIcon />}
                  sx={{ 
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    py: 2,
                    '&:hover': {
                      borderStyle: 'dashed',
                      borderWidth: 2
                    }
                  }}
                >
                  {invoiceFile ? invoiceFile.name : 'Choose Excel file (.xlsx, .xls, .xlsm)'}
                </Button>
              </label>
              {invoiceFile && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  ✓ File selected: {invoiceFile.name}
                </Typography>
              )}
            </FormControl>
          </Box>
        );

      default:
        return null;
    }
  };

  // Render action buttons for dialog
  const renderDialogActions = () => {
    switch (dialogType) {
      case 'create':
        const canSubmit = selectedBrand && selectedFile && invoiceFile;
        return (
          <>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateOrder} 
              variant="contained" 
              color="primary"
              disabled={!canSubmit}
              startIcon={<AddIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
                }
              }}
            >
              Submit Order
            </Button>
          </>
        );
      case 'approve':
        const canApprove = invoiceFile;
        return (
          <>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                console.log('🔘 Approve button clicked!');
                console.log('Invoice file:', invoiceFile);
                console.log('Selected order:', selectedOrder);
                handleApproveOrder();
              }} 
              variant="contained" 
              color="success"
              startIcon={<CheckCircleIcon />}
              disabled={!canApprove}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
                }
              }}
            >
              Approve Order
            </Button>
          </>
        );
      case 'reject':
        return (
          <>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRejectOrder} 
              variant="contained" 
              color="error"
              startIcon={<CancelIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
                }
              }}
            >
              Reject Order
            </Button>
          </>
        );
      case 'payment':
        return (
          <>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmPayment} 
              variant="contained" 
              color="success"
              startIcon={<PaymentIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
                }
              }}
            >
              Confirm Payment
            </Button>
          </>
        );
      case 'admin-cancel':
        return (
          <>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAdminCancelOrder} 
              variant="contained" 
              color="error"
              startIcon={<CancelIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
                }
              }}
            >
              Confirm Cancellation
            </Button>
          </>
        );
      case 'replace-attachment':
        return (
          <>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleUpdateOrderAttachment(selectedOrder)} 
              variant="contained" 
              color="primary"
              disabled={!invoiceFile}
              startIcon={<EditIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
                }
              }}
            >
              Replace Attachment
            </Button>
          </>
        );
      case 'admin-replace-attachment':
        return (
          <>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAdminReplaceAttachment} 
              variant="contained" 
              color="primary"
              disabled={!invoiceFile}
              startIcon={<EditIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
                }
              }}
            >
              Replace Attachment
            </Button>
          </>
        );
      case 'delete':
        return (
          <>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteOrder} 
              variant="contained" 
              color="error"
              disabled={loading}
              startIcon={<DeleteIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
                }
              }}
            >
              {loading ? 'Deleting...' : 'Confirm Deletion'}
            </Button>
          </>
        );
      default:
        return (
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Close
          </Button>
        );
    }
  };

  // Get inventory status display
  const getInventoryStatusDisplay = (order, isHeader = true) => {
    if (!isAdmin) return null;
    
    // Check if order has been approved (has invoice file)
    if (!order.invoiceFile) {
      return (
        <Chip
          icon={<InfoIcon sx={{ color: '#FFFFFF' }} />}
          label="Not Deducted"
          sx={{
            backgroundColor: '#D3D3D3', // Light Grey (same as Cancelled)
            color: '#000000',
            fontWeight: isHeader ? 'bold' : 'normal'
          }}
          size="small"
        />
      );
    }
    
    // Check inventory status based on the new status field
    switch (order.inventoryStatus) {
      case 'success':
        // Only show reverse inventory button if order is cancelled and inventory hasn't been restored
        const canReverseInventory = order.status === 'Cancelled' && !order.inventoryRestored;
        
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={<CheckCircleIcon sx={{ color: '#FFFFFF' }} />}
              label={order.inventoryRestored ? "Restored" : "Deducted"}
              sx={order.inventoryRestored ? {
                backgroundColor: '#2196F3', // Blue
                color: '#FFFFFF',
                fontWeight: 'normal' // not bold for Restored
              } : {
                backgroundColor: '#4CAF50', // Green (same as Completed)
                color: '#FFFFFF',
                fontWeight: 'bold'
              }}
              size="small"
            />
            {canReverseInventory && (
              <Tooltip title="Reverse inventory deduction">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReverseInventory(order._id);
                  }}
                >
                  <RestoreIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
        
      case 'error':
        const errorMessage = order.inventoryError || 'Unknown error occurred';
        const errorDetails = order.inventoryErrorDetails;
        let tooltipContent = `Error: ${errorMessage}`;
        
        if (errorDetails?.insufficientItems?.length > 0) {
          tooltipContent += '\n\nInsufficient inventory for:';
          errorDetails.insufficientItems.forEach(item => {
            tooltipContent += `\n• Reference ID ${item.referenceId}: Requested ${item.quantityRequested}, Available ${item.availableQuantity}`;
          });
        }
        
        return (
          <Tooltip title={tooltipContent} arrow placement="top">
            <Chip
              icon={<CancelIcon />}
              label="Error Deducting Inventory"
              color="error"
              size="small"
              sx={{ cursor: 'help' }}
            />
          </Tooltip>
        );
        
      case 'pending':
        return (
          <Chip
            icon={<LinearProgress size={16} />}
            label="Processing Inventory"
            color="warning"
            size="small"
          />
        );
        
      case 'not_applicable':
      default:
        return (
          <Chip
            icon={<InfoIcon sx={{ color: '#FFFFFF' }} />}
            label="Not Deducted"
            sx={{
              backgroundColor: '#D3D3D3', // Light Grey (same as Cancelled)
              color: '#000000',
              fontWeight: isHeader ? 'bold' : 'normal'
            }}
            size="small"
          />
        );
    }
  };

  // Add a new handleUpdateOrderAttachment function
  const handleUpdateOrderAttachment = async (order) => {
    try {
      if (!invoiceFile) {
        setError('Please upload a new Excel file');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.ms-excel.sheet.macroEnabled.12'
      ];
      
      if (!allowedTypes.includes(invoiceFile.type)) {
        setError('Please upload a valid Excel file (.xlsx, .xls, or .xlsm)');
        return;
      }

      const formData = new FormData();
      formData.append('excelFile', invoiceFile);

      const response = await fetch(getApiUrl(`api/orders/${order._id}/replace-attachment`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order attachment');
      }

      await loadOrders();
      handleCloseDialog();
      setError(null);
      setSnackbar({ open: true, message: 'Order attachment updated successfully', severity: 'success' });
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle admin cancel order
  const handleAdminCancelOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl(`api/orders/${selectedOrder._id}/admin-cancel`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: cancellationReason })
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Order cancelled successfully', severity: 'success' });
        handleCloseDialog();
        loadOrders();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete order
  const handleDeleteOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Selected order for deletion:', selectedOrder);
      console.log('Attempting to delete order:', selectedOrder._id);
      console.log('Token:', localStorage.getItem('token'));

      const response = await fetch(getApiUrl(`api/orders/${selectedOrder._id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (response.ok) {
        console.log('Order deleted successfully');
        setSnackbar({ open: true, message: 'Order deleted successfully', severity: 'success' });
        handleCloseDialog();
        loadOrders();
      } else {
        const errorData = await response.json();
        console.error('Delete failed with error:', errorData);
        setError(errorData.error || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  // Admin replace order attachment
  const handleAdminReplaceAttachment = async () => {
    try {
      if (!invoiceFile) {
        setError('Please upload an Excel file');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.ms-excel.sheet.macroEnabled.12'
      ];
      
      if (!allowedTypes.includes(invoiceFile.type)) {
        setError('Please upload a valid Excel file (.xlsx, .xls, or .xlsm)');
        return;
      }

      const formData = new FormData();
      formData.append('excelFile', invoiceFile);

      const response = await fetch(getApiUrl(`api/orders/${selectedOrder._id}/admin-replace-attachment`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to replace attachment');
      }

      const result = await response.json();
      
      await loadOrders();
      handleCloseDialog();
      setError(null);
      setSnackbar({ 
        open: true, 
        message: `Attachment replaced successfully. New totals: Quantity=${result.newTotals.totalQuantity}, Amount=${formatAED(result.newTotals.totalAmount)}`, 
        severity: 'success' 
      });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading orders...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Orders
        </Typography>
        
        {/* Only show error above table when dialog is not open */}
        {error && !dialogOpen && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Header with Create Order button and filters */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('create')}
              sx={{ mr: 2 }}
            >
              {isAdmin ? 'Create Order' : 'Create New Order'}
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="Pending Review">Pending Review</MenuItem>
                                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                    <MenuItem value="Awaiting Payment">Awaiting Payment</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Orders Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={isAdmin ? { fontSize: '0.85rem', fontWeight: 600 } : {}}>Order Number</TableCell>
                  {isAdmin && <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Buyer Name</TableCell>}
                  <TableCell sx={isAdmin ? { fontSize: '0.85rem', fontWeight: 600 } : {}}>Brand</TableCell>
                  <TableCell sx={isAdmin ? { fontSize: '0.85rem', fontWeight: 600 } : {}}>Stock File</TableCell>
                  <TableCell sx={isAdmin ? { fontSize: '0.85rem', fontWeight: 600 } : {}}>Submission Date</TableCell>
                  <TableCell sx={isAdmin ? { fontSize: '0.85rem', fontWeight: 600 } : {}}>Order Status</TableCell>
                  <TableCell sx={isAdmin ? { fontSize: '0.85rem', fontWeight: 600 } : {}}>Total Amount</TableCell>
                  <TableCell sx={isAdmin ? { fontSize: '0.85rem', fontWeight: 600 } : {}}>Total Quantity</TableCell>
                  <TableCell sx={isAdmin ? { fontSize: '0.85rem', fontWeight: 600 } : {}}>Submitted Order</TableCell>
                  {(isAdmin || shouldShowInvoiceColumn()) && (
                    <TableCell sx={isAdmin ? { fontSize: '0.85rem', fontWeight: 600 } : {}}>Invoice</TableCell>
                  )}
                  {isAdmin && <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Inventory Status</TableCell>}
                  <TableCell sx={isAdmin ? { fontSize: '0.85rem', fontWeight: 600 } : {}}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell sx={isAdmin ? { fontSize: '0.82rem', fontWeight: 'normal' } : {}}>{order.orderNumber}</TableCell>
                    {isAdmin && <TableCell sx={{ fontSize: '0.82rem', fontWeight: 'normal' }}>{order.buyerName}</TableCell>}
                    <TableCell sx={isAdmin ? { fontSize: '0.82rem', fontWeight: 'normal' } : {}}>{order.brand}</TableCell>
                    <TableCell sx={isAdmin ? { fontSize: '0.82rem', fontWeight: 'normal' } : {}}>{stripFileExtension(order.stockFile)}</TableCell>
                    <TableCell sx={isAdmin ? { fontSize: '0.82rem', fontWeight: 'normal' } : {}}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={isAdmin ? { fontSize: '0.82rem', fontWeight: 'normal' } : {}}>
                      {(order.status === 'Rejected' || order.status === 'Cancelled') ? (
                        <Tooltip 
                          title={(() => {
                            if (order.status === 'Rejected') {
                              const reason = (order.rejectionReason || '').trim();
                              return reason
                                ? reason
                                : 'No rejection reason provided';
                            } else {
                              const reason = (order.cancellationReason || '').trim();
                              // Treat 'Cancelled by admin' as if no reason was provided
                              const isDefaultReason = reason === 'Cancelled by admin';
                              return (reason && !isDefaultReason)
                                ? reason
                                : 'No cancellation reason provided';
                            }
                          })()}
                          arrow
                          placement="top"
                          enterTouchDelay={0}
                          enterDelay={0}
                          leaveDelay={200}
                          componentsProps={{ tooltip: { style: { pointerEvents: 'auto' } } }}
                        >
                          <Chip
                            label={order.status}
                            size="small"
                            {...getStatusChipProps(order.status)}
                            sx={{ ...getStatusChipProps(order.status).sx, cursor: 'help', fontWeight: 'normal' }}
                          />
                        </Tooltip>
                      ) : (
                        <Chip
                          label={order.status}
                          size="small"
                          {...getStatusChipProps(order.status)}
                          sx={{ ...getStatusChipProps(order.status).sx, fontWeight: 'normal' }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={isAdmin ? { fontSize: '0.82rem', fontWeight: 'normal' } : {}}>{formatAED(order.totalAmount)}</TableCell>
                    <TableCell sx={isAdmin ? { fontSize: '0.82rem', fontWeight: 'normal' } : {}}>{order.totalQuantity}</TableCell>
                    <TableCell sx={isAdmin ? { fontSize: '0.82rem', fontWeight: 'normal' } : {}}>
                      <Tooltip title="Download Order">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadFile(order._id, 'order')}
                        >
                          <FileDownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    {(isAdmin || shouldShowInvoiceColumn()) && (
                      <TableCell sx={isAdmin ? { fontSize: '0.82rem', fontWeight: 'normal' } : {}}>
                        {isAdmin ? (
                          order.invoiceFile ? (
                          <Tooltip title="Download Invoice">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadFile(order._id, 'invoice')}
                            >
                              <ReceiptIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                              Pending
                          </Typography>
                          )
                        ) : (
                          // Buyer view logic
                          order.status === 'Pending Review' ? (
                            <Typography variant="caption" color="textSecondary">
                              Pending
                            </Typography>
                          ) : (order.status === 'Awaiting Payment' || order.status === 'Completed') && order.invoiceFile ? (
                            <Tooltip title="Download Invoice">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadFile(order._id, 'invoice')}
                              >
                                <ReceiptIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (order.status === 'Cancelled' || order.status === 'Rejected') ? (
                            <Typography variant="caption" color="textSecondary">
                              N/A
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              Pending
                            </Typography>
                          )
                        )}
                      </TableCell>
                    )}
                    {isAdmin && <TableCell sx={{ fontSize: '0.82rem', fontWeight: 'normal' }}>{getInventoryStatusDisplay(order, false)}</TableCell>}
                    <TableCell sx={isAdmin ? { fontSize: '0.82rem', fontWeight: 'normal' } : {}}>
                      {/* Admin actions - use three-dot dropdown menu */}
                      {isAdmin && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <IconButton
                            size="small"
                            onClick={(event) => handleMenuOpen(event, order)}
                            sx={{ 
                              color: 'primary.main',
                              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      )}
                      
                      {/* Buyer actions - use three-dot dropdown menu for all orders */}
                      {!isAdmin && (
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuOpen(event, order)}
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {filteredOrders.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="textSecondary">
              No orders found
            </Typography>
          </Box>
        )}
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {isAdmin && selectedOrderForMenu?.status === 'Pending Review' && (
          <>
            <MenuItem onClick={() => {
              console.log('🍽️ Approve menu item clicked!');
              console.log('Selected order for menu:', selectedOrderForMenu);
              handleMenuClose();
              handleOpenDialog('approve', selectedOrderForMenu);
            }}
            sx={{ fontSize: '0.875rem' }}
            >
              <CheckCircleIcon sx={{ mr: 1, color: '#4caf50' }} />
              <span style={{ color: '#4caf50' }}>Approve Order</span>
            </MenuItem>
            <MenuItem onClick={() => {
              handleMenuClose();
              handleOpenDialog('reject', selectedOrderForMenu);
            }}
            sx={{ fontSize: '0.875rem' }}
            >
              <CancelIcon sx={{ mr: 1, color: '#f44336' }} />
              <span style={{ color: '#f44336' }}>Reject Order</span>
            </MenuItem>
            <MenuItem onClick={() => {
              handleMenuClose();
              handleOpenDialog('admin-replace-attachment', selectedOrderForMenu);
            }}
            sx={{ fontSize: '0.875rem' }}
            >
              <EditIcon sx={{ mr: 1 }} />
              Replace Attachment
            </MenuItem>
          </>
        )}

        {isAdmin && selectedOrderForMenu?.status === 'Awaiting Payment' && (
          <>
          <MenuItem onClick={() => {
            handleMenuClose();
            handleOpenDialog('payment', selectedOrderForMenu);
          }}
          sx={{ fontSize: '0.875rem' }}
          >
              <CheckCircleIcon sx={{ mr: 1, color: '#4caf50' }} />
              Completed
          </MenuItem>
            <MenuItem onClick={() => {
              handleMenuClose();
              handleOpenDialog('admin-cancel', selectedOrderForMenu);
            }}
            sx={{ fontSize: '0.875rem' }}
            >
              <CancelIcon sx={{ mr: 1 }} />
              Cancel Order
            </MenuItem>
          </>
        )}

        {isAdmin && selectedOrderForMenu?.status !== 'Pending Review' && 
         selectedOrderForMenu?.status !== 'Awaiting Payment' && 
                         selectedOrderForMenu?.status !== 'Cancelled' &&
                selectedOrderForMenu?.status !== 'Rejected' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            handleOpenDialog('admin-cancel', selectedOrderForMenu);
          }}
          sx={{ fontSize: '0.875rem' }}
          >
            <CancelIcon sx={{ mr: 1 }} />
            Cancel Order
          </MenuItem>
        )}

        {/* Delete Order option for admins - always available */}
        {isAdmin && (
          <MenuItem onClick={() => {
            handleMenuClose();
            handleOpenDialog('delete', selectedOrderForMenu);
          }}
          sx={{ color: 'error.main', fontSize: '0.875rem' }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            Delete Order
          </MenuItem>
        )}

        {/* Buyer menu items - always show download options */}
        {!isAdmin && (
          <>
            {/* Download Order - always available */}
            <MenuItem onClick={() => {
              handleMenuClose();
              handleDownloadFile(selectedOrderForMenu._id, 'order');
            }}
            sx={{ fontSize: '0.875rem' }}
            >
              <FileDownloadIcon sx={{ mr: 1 }} />
              Download Order
            </MenuItem>
            
            {/* Download Invoice - only if invoice exists */}
            {selectedOrderForMenu?.invoiceFile && (
              <MenuItem onClick={() => {
                handleMenuClose();
                handleDownloadFile(selectedOrderForMenu._id, 'invoice');
              }}
              sx={{ fontSize: '0.875rem' }}
              >
                <ReceiptIcon sx={{ mr: 1 }} />
                Download Invoice
              </MenuItem>
            )}
            
            {/* Replace Attachment and Cancel Order - only for Pending Review */}
            {selectedOrderForMenu?.status === 'Pending Review' && (
              <>
                <MenuItem onClick={() => {
                  handleMenuClose();
                  handleOpenDialog('replace-attachment', selectedOrderForMenu);
                }}
                sx={{ fontSize: '0.875rem' }}
                >
                  <EditIcon sx={{ mr: 1 }} />
                  Replace Attachment
                </MenuItem>
                <MenuItem onClick={() => {
                  handleMenuClose();
                  handleCancelOrder(selectedOrderForMenu._id);
                }}
                sx={{ fontSize: '0.875rem' }}
                >
                  <CancelIcon sx={{ mr: 1 }} />
                  Cancel Order
                </MenuItem>
              </>
            )}
          </>
        )}
      </Menu>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#fafafa'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {dialogType === 'create' && (
              <Typography variant="h6" fontWeight={600}>
                Create Order
              </Typography>
            )}
            {dialogType === 'approve' && (
              <>
                <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                <Typography variant="h6" fontWeight={600}>
                  Approve Order
                </Typography>
              </>
            )}
            {dialogType === 'reject' && (
              <>
                <CancelIcon sx={{ color: '#f44336', fontSize: 24 }} />
                <Typography variant="h6" fontWeight={600}>
                  Reject Order
                </Typography>
              </>
            )}
            {dialogType === 'payment' && (
              <>
                <PaymentIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                <Typography variant="h6" fontWeight={600}>
                  Confirm Payment
                </Typography>
              </>
            )}
            {dialogType === 'delete' && (
              <>
                <DeleteIcon sx={{ color: '#f44336', fontSize: 24 }} />
                <Typography variant="h6" fontWeight={600}>
                  Delete Order
                </Typography>
              </>
            )}
            {dialogType === 'replace-attachment' && (
              <>
                <EditIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                <Typography variant="h6" fontWeight={600}>
                  Replace Order Attachment
                </Typography>
              </>
            )}
            {dialogType === 'admin-replace-attachment' && (
              <>
                <EditIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                <Typography variant="h6" fontWeight={600}>
                  Replace Order Attachment
                </Typography>
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, height: dialogType === 'admin-replace-attachment' ? '400px' : dialogType === 'payment' ? '180px' : undefined }}>
          {renderDialogContent()}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
          {renderDialogActions()}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Orders; 