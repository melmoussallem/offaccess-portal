import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import InputAdornment from '@mui/material/InputAdornment';
import {
  Visibility,
  CheckCircle,
  Cancel,
  MoreVert,
  Close,
  Delete,
  FilterList,
  AccessTime,
  Search
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const BuyerManagement = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [brandAccessDialogOpen, setBrandAccessDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingBrandAccess, setUpdatingBrandAccess] = useState(false);
  const [deletingBuyer, setDeletingBuyer] = useState(false);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [brands, setBrands] = useState([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuBuyer, setActionMenuBuyer] = useState(null);
  
  // Rejection reason modal states
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingBuyer, setRejectingBuyer] = useState(false);
  
  // Search, filter, and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [buyerTypeFilter, setBuyerTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Add a local state for dialog selection
  const [dialogSelectedBrands, setDialogSelectedBrands] = useState([]);


  // Fetch all buyers
  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/buyers');
      setBuyers(response.data.buyers);
    } catch (error) {
      console.error('Error fetching buyers:', error);
      toast.error('Failed to load buyers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available brands
  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/brands');
      setBrands(response.data.brands);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    }
  };

  useEffect(() => {
    fetchBuyers();
    fetchBrands();
  }, []);

  // Filtered and sorted buyers
  const filteredAndSortedBuyers = useMemo(() => {
    let filtered = buyers;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(buyer => 
        buyer.name?.toLowerCase().includes(searchLower) ||
        buyer.email?.toLowerCase().includes(searchLower) ||
        buyer.companyName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply buyer type filter
    if (buyerTypeFilter !== 'all') {
      filtered = filtered.filter(buyer => buyer.buyerType === buyerTypeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(buyer => buyer.status === statusFilter);
    }
    return filtered;
  }, [buyers, searchTerm, buyerTypeFilter, statusFilter]);

  // Handle row click to open details
  const handleRowClick = (buyer) => {
    setSelectedBuyer(buyer);
    setNotes(buyer.adminNotes || '');
    setDrawerOpen(true);
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedBuyer || !newStatus) return;

    try {
      setUpdatingStatus(true);
      await axios.put(`/api/buyers/${selectedBuyer._id}/status`, {
        status: newStatus,
        notes: notes
      });

      // Update local state
      setBuyers(prevBuyers =>
        prevBuyers.map(buyer =>
          buyer._id === selectedBuyer._id
            ? { ...buyer, status: newStatus, adminNotes: notes }
            : buyer
        )
      );

      setSelectedBuyer(prev => ({ ...prev, status: newStatus, adminNotes: notes }));
      setStatusDialogOpen(false);
              toast.success(`Buyer status updated to ${newStatus}`, {
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
      console.error('Error updating status:', error);
              toast.error('Failed to update buyer status', {
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
      setUpdatingStatus(false);
    }
  };

  // Handle rejection with reason
  const handleRejectionWithReason = async () => {
    if (!selectedBuyer) return;

    try {
      setRejectingBuyer(true);
      await axios.put(`/api/buyers/${selectedBuyer._id}/status`, {
        status: 'rejected',
        notes: notes,
        rejectionReason: rejectionReason
      });

      // Update local state
      setBuyers(prevBuyers =>
        prevBuyers.map(buyer =>
          buyer._id === selectedBuyer._id
            ? { ...buyer, status: 'rejected', adminNotes: notes }
            : buyer
        )
      );

      setSelectedBuyer(prev => ({ ...prev, status: 'rejected', adminNotes: notes }));
      setRejectionDialogOpen(false);
      setRejectionReason('');
      toast.success('Buyer rejected successfully');
    } catch (error) {
      console.error('Error rejecting buyer:', error);
      toast.error('Failed to reject buyer');
    } finally {
      setRejectingBuyer(false);
    }
  };

  // Replace handleBrandAccessSave with logic that updates each brand's visibleToBuyers
  const handleBrandAccessSave = async () => {
    if (!selectedBuyer) return;
    try {
      setUpdatingBrandAccess(true);
      // For each brand, update its visibleToBuyers array and set visibility to specific_buyers
      const updatePromises = brands.map(async (brand) => {
        const shouldHaveAccess = dialogSelectedBrands.includes(brand._id);
        let newVisibleToBuyers = Array.isArray(brand.visibleToBuyers) ? [...brand.visibleToBuyers] : [];
        const buyerIdStr = String(selectedBuyer._id);
        const alreadyHasAccess = newVisibleToBuyers.map(String).includes(buyerIdStr);
        if (shouldHaveAccess && !alreadyHasAccess) {
          newVisibleToBuyers.push(selectedBuyer._id);
        } else if (!shouldHaveAccess && alreadyHasAccess) {
          newVisibleToBuyers = newVisibleToBuyers.filter(id => String(id) !== buyerIdStr);
        }
        // Always set to specific_buyers and update the list
        await axios.put(`/api/catalogue/brand/${brand._id}/visibility`, {
          visibility: 'specific_buyers',
          visibleToBuyers: newVisibleToBuyers
        });
      });
      await Promise.all(updatePromises);
      setBrandAccessDialogOpen(false);
      toast.success('Brand access updated successfully');
      fetchBuyers();
      fetchBrands();
    } catch (error) {
      console.error('Error updating brand access:', error);
      toast.error('Failed to update brand access');
    } finally {
      setUpdatingBrandAccess(false);
    }
  };

  // Handle buyer deletion
  const handleDeleteBuyer = async () => {
    if (!selectedBuyer) return;

    try {
      setDeletingBuyer(true);
      await axios.delete(`/api/buyers/${selectedBuyer._id}`);

      // Remove from local state
      setBuyers(prevBuyers =>
        prevBuyers.filter(buyer => buyer._id !== selectedBuyer._id)
      );

      setDeleteDialogOpen(false);
      setDrawerOpen(false);
      toast.success('Buyer deleted successfully');
    } catch (error) {
      console.error('Error deleting buyer:', error);
      toast.error('Failed to delete buyer');
    } finally {
      setDeletingBuyer(false);
    }
  };

  // Handle action menu
  const handleActionMenuOpen = (event, buyer) => {
    setActionMenuAnchor(event.currentTarget);
    setActionMenuBuyer(buyer);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionMenuBuyer(null);
  };

  // Get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Update formatDate to only show date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Update formatLastLogin to use formatDate
  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Never';
    return formatDate(lastLogin);
  };

  // Utility to capitalize first letter
  const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  // 1. Add useEffect to sync dialogSelectedBrands with selectedBuyer when dialog opens
  useEffect(() => {
    if (brandAccessDialogOpen && selectedBuyer) {
      setDialogSelectedBrands(selectedBuyer.brandAccess || []);
    }
  }, [brandAccessDialogOpen, selectedBuyer]);

  // 2. Add useEffect to sync selectedBuyer with buyers after update
  useEffect(() => {
    if (selectedBuyer) {
      const updated = buyers.find(b => b._id === selectedBuyer._id);
      if (updated && updated !== selectedBuyer) {
        setSelectedBuyer(updated);
      }
    }
  }, [buyers, selectedBuyer]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Buyer Management
      </Typography>
      
      {/* Search, Filter, and Sort Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Bar */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          {/* Buyer Type Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Buyer Type</InputLabel>
              <Select
                value={buyerTypeFilter}
                onChange={(e) => setBuyerTypeFilter(e.target.value)}
                label="Filter by Buyer Type"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Wholesale">Wholesale</MenuItem>
                <MenuItem value="Retail">Retail</MenuItem>
                <MenuItem value="Online">Online</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Results Summary */}
        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Showing {filteredAndSortedBuyers.length} of {buyers.length} buyers
          </Typography>
          {(searchTerm || buyerTypeFilter !== 'all' || statusFilter !== 'all') && (
            <Chip
              label={`${searchTerm ? 'Search: ' + searchTerm : ''} ${buyerTypeFilter !== 'all' ? 'Type: ' + buyerTypeFilter : ''} ${statusFilter !== 'all' ? 'Status: ' + statusFilter : ''}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      </Paper>

      {/* Buyers Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Buyer Name</TableCell>
                <TableCell>Company Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedBuyers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm || buyerTypeFilter !== 'all' || statusFilter !== 'all'
                        ? 'No buyers match your search criteria' 
                        : 'No buyers found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedBuyers.map((buyer) => (
                  <TableRow
                    key={buyer._id}
                    hover
                    onClick={() => handleRowClick(buyer)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{buyer.name}</TableCell>
                    <TableCell>{buyer.companyName}</TableCell>
                    <TableCell>{buyer.email}</TableCell>
                    <TableCell>{buyer.phone}</TableCell>
                    <TableCell>{buyer.buyerType}</TableCell>
                    <TableCell>
                      <Chip
                        label={capitalizeFirst(buyer.status)}
                        color={getStatusChipColor(buyer.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTime fontSize="small" color="action" />
                        {formatLastLogin(buyer.lastLogin)}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(buyer.createdAt)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionMenuOpen(e, buyer)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => {
          handleRowClick(actionMenuBuyer);
          handleActionMenuClose();
        }} sx={{ transition: 'background 0.2s', '&:hover': { backgroundColor: theme => theme.palette.action.hover, fontWeight: 600 } }}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {/* Only show Approve/Reject for pending buyers */}
        {actionMenuBuyer?.status === 'pending' && (
          <>
            <MenuItem onClick={async () => {
              setSelectedBuyer(actionMenuBuyer);
              setNewStatus('approved');
              handleActionMenuClose();
              // Immediately approve
              setUpdatingStatus(true);
              try {
                await axios.put(`/api/buyers/${actionMenuBuyer._id}/status`, {
                  status: 'approved',
                  notes: actionMenuBuyer.adminNotes || ''
                });
                setBuyers(prevBuyers =>
                  prevBuyers.map(buyer =>
                    buyer._id === actionMenuBuyer._id
                      ? { ...buyer, status: 'approved' }
                      : buyer
                  )
                );
                setSelectedBuyer(prev => prev && prev._id === actionMenuBuyer._id ? { ...prev, status: 'approved' } : prev);
                toast.success('Buyer approved successfully');
              } catch (error) {
                toast.error('Failed to approve buyer');
              } finally {
                setUpdatingStatus(false);
              }
            }} sx={{ transition: 'background 0.2s', '&:hover': { backgroundColor: theme => theme.palette.action.hover, fontWeight: 600 } }}>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Approve Buyer</span>
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={async () => {
              setSelectedBuyer(actionMenuBuyer);
              handleActionMenuClose();
              // Immediately reject
              setRejectingBuyer(true);
              try {
                await axios.put(`/api/buyers/${actionMenuBuyer._id}/status`, {
                  status: 'rejected',
                  notes: actionMenuBuyer.adminNotes || '',
                  rejectionReason: ''
                });
                setBuyers(prevBuyers =>
                  prevBuyers.map(buyer =>
                    buyer._id === actionMenuBuyer._id
                      ? { ...buyer, status: 'rejected' }
                      : buyer
                  )
                );
                setSelectedBuyer(prev => prev && prev._id === actionMenuBuyer._id ? { ...prev, status: 'rejected' } : prev);
              } catch (error) {
                toast.error('Failed to reject buyer');
              } finally {
                setRejectingBuyer(false);
              }
            }} sx={{ transition: 'background 0.2s', '&:hover': { backgroundColor: theme => theme.palette.action.hover, fontWeight: 600 } }}>
              <ListItemIcon>
                <Cancel fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Reject Buyer</span>
              </ListItemText>
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={() => {
          setSelectedBuyer(actionMenuBuyer);
          setDeleteDialogOpen(true);
          handleActionMenuClose();
        }} sx={{ color: 'error.main', '&:hover': { backgroundColor: theme => theme.palette.action.hover, fontWeight: 600 } }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Remove Buyer</ListItemText>
        </MenuItem>
      </Menu>

      {/* Buyer Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 500 } }}
        key={selectedBuyer?._id || 'drawer'}
      >
        {selectedBuyer && (
          <Box p={0} key={selectedBuyer._id}>
            {/* Title and Close Button */}
            <Box display="flex" alignItems="center" justifyContent="space-between" px={3} py={2} sx={{ background: '#f5f6fa', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h5" fontWeight={600} color="primary.main">
                Buyer Details
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)} size="small">
                <Close />
              </IconButton>
            </Box>
            <Divider />
            <Box p={3}>
              {/* Personal Information */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}><Typography variant="body2"><strong>Name:</strong> {selectedBuyer.name}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="body2"><strong>Email:</strong> {selectedBuyer.email}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="body2"><strong>Phone:</strong> {selectedBuyer.phone || 'N/A'}</Typography></Grid>
                  </Grid>
                </CardContent>
              </Card>
              {/* Company Information */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>
                    Company Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}><Typography variant="body2"><strong>Company:</strong> {selectedBuyer.companyName}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="body2"><strong>Website:</strong> {selectedBuyer.companyWebsite || 'N/A'}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="body2"><strong>Address:</strong> {selectedBuyer.companyAddress?.street || ''}{selectedBuyer.companyAddress?.street ? ', ' : ''}{selectedBuyer.companyAddress?.city || ''}{selectedBuyer.companyAddress?.city ? ', ' : ''}{selectedBuyer.companyAddress?.country || ''}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="body2"><strong>Buyer Type:</strong> {selectedBuyer.buyerType}</Typography></Grid>
                  </Grid>
                </CardContent>
              </Card>
              {/* Account Status */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>
                    Account Status
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Chip
                      label={capitalizeFirst(selectedBuyer.status)}
                      color={getStatusChipColor(selectedBuyer.status)}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Registered: {formatDate(selectedBuyer.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Login: {formatLastLogin(selectedBuyer.lastLogin)}
                  </Typography>
                </CardContent>
              </Card>
              {/* Brand Access */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>
                    Brand Access
                  </Typography>
                  <Box mb={2}>
                    {(() => {
                      // Only show brands where buyer has access
                      const accessibleBrands = brands.filter(brand => {
                        if (brand.visibility === 'all_approved') return true;
                        if (brand.visibility === 'specific_buyers' && Array.isArray(brand.visibleToBuyers)) {
                          return brand.visibleToBuyers.map(String).includes(String(selectedBuyer._id));
                        }
                        return false;
                      });
                      if (accessibleBrands.length === 0) {
                        return <Typography variant="body2">No brands assigned</Typography>;
                      }
                      return (
                        <>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {accessibleBrands.length} brands accessible:
                          </Typography>
                          <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc' }}>
                            {accessibleBrands.map((brand, idx) => (
                              <li key={brand._id + '-' + idx} style={{ marginBottom: 4 }}>
                                <Typography variant="body2">{brand.name}</Typography>
                              </li>
                            ))}
                          </ul>
                        </>
                      );
                    })()}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Buyer Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={updatingStatus}
          >
            {updatingStatus ? <CircularProgress size={20} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Brand Access Dialog */}
      <Dialog 
        open={brandAccessDialogOpen} 
        onClose={() => setBrandAccessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        // 6. Add key to force re-render when selectedBuyer changes
        key={selectedBuyer?._id || 'brand-access-dialog'}
      >
        <DialogTitle>Manage Brand Access</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select which brands this buyer can access:
          </Typography>
          <Box display="flex" gap={2} mb={2}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setDialogSelectedBrands(brands.map(b => b._id))}
              disabled={brands.length === 0}
            >
              Select All
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setDialogSelectedBrands([])}
              disabled={brands.length === 0}
            >
              Deselect All
            </Button>
          </Box>
          <FormGroup>
            {brands.map((brand, idx) => (
              <FormControlLabel
                key={brand._id + '-' + idx}
                control={
                  <Checkbox
                    checked={dialogSelectedBrands.includes(brand._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDialogSelectedBrands([...dialogSelectedBrands, brand._id]);
                      } else {
                        setDialogSelectedBrands(dialogSelectedBrands.filter(id => id !== brand._id));
                      }
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {brand.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {brand.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBrandAccessDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleBrandAccessSave}
            variant="contained"
            disabled={updatingBrandAccess}
          >
            {updatingBrandAccess ? <CircularProgress size={20} /> : 'Save Access'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)}>
        <DialogTitle>Reject Buyer Application</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to reject <strong>{selectedBuyer?.name}</strong>'s application.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please provide a reason for rejection (optional but recommended). This will be included in the email sent to the buyer.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason (optional)..."
            variant="outlined"
            label="Rejection Reason"
            helperText="This reason will be included in the email sent to the buyer"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRejectionWithReason}
            variant="contained"
            color="error"
            disabled={rejectingBuyer}
          >
            {rejectingBuyer ? <CircularProgress size={20} /> : 'Reject Buyer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Remove Buyer</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to remove this buyer? This action cannot be undone.
          </Typography>
          {selectedBuyer && (
            <Alert severity="warning">
              This will permanently delete <strong>{selectedBuyer.name}</strong> and all associated data.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteBuyer}
            variant="contained"
            color="error"
            disabled={deletingBuyer}
          >
            {deletingBuyer ? <CircularProgress size={20} /> : 'Remove Buyer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerManagement; 