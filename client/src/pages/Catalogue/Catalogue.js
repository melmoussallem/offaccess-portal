import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import ListItemIcon from '@mui/material/ListItemIcon';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { 
  Download as DownloadIcon, 
  Delete as DeleteIcon, 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Description as FileIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

import { getApiUrl } from '../../config/api';

const ExcelSvgIcon = (props) => (
  <svg
    width={28}
    height={28}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="40" height="40" rx="8" fill="#21A366" />
    <rect x="7" y="7" width="26" height="26" rx="3" fill="#fff" />
    <rect x="10" y="10" width="20" height="20" rx="2" fill="#21A366" />
    <text x="50%" y="62%" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="Arial">X</text>
  </svg>
);

export default function Catalogue() {
  const { isAdmin } = useAuth();
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [stockFiles, setStockFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingStockFiles, setLoadingStockFiles] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [showMessage, setShowMessage] = useState(false);
  
  // Brand menu states
  const [brandMenuAnchor, setBrandMenuAnchor] = useState(null);
  const [selectedBrandForMenu, setSelectedBrandForMenu] = useState(null);
  
  // File menu states
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);
  const [selectedFileForMenu, setSelectedFileForMenu] = useState(null);
  
  // Dialog states
  const [showRenameBrandDialog, setShowRenameBrandDialog] = useState(false);
  const [showDeleteBrandDialog, setShowDeleteBrandDialog] = useState(false);
  const [showRenameFileDialog, setShowRenameFileDialog] = useState(false);
  const [showDeleteFileDialog, setShowDeleteFileDialog] = useState(false);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [showCreateBrandDialog, setShowCreateBrandDialog] = useState(false);
  const [showUploadFileDialog, setShowUploadFileDialog] = useState(false);
  
  // Form states
  const [newBrandName, setNewBrandName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [visibility, setVisibility] = useState('all_approved');
  const [selectedBuyers, setSelectedBuyers] = useState([]);
  const [allBuyers, setAllBuyers] = useState([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Access management state - separate from menu state
  const [brandForAccess, setBrandForAccess] = useState(null);
  
  // File input ref
  const fileInputRef = React.useRef();
  const replacementFileInputRef = React.useRef();
  

  
  // Add state for replace attachment dialog
  const [showReplaceAttachmentDialog, setShowReplaceAttachmentDialog] = useState(false);
  const [selectedFileForReplace, setSelectedFileForReplace] = useState(null);
  const [replacementFile, setReplacementFile] = useState(null);
  const [replacingFile, setReplacingFile] = useState(false);

  const location = useLocation();
  const lastFocusedElement = useRef(null);

  const openDialog = (setDialogOpen) => {
    lastFocusedElement.current = document.activeElement;
    setDialogOpen(true);
  };
  const closeDialog = (setDialogOpen) => {
    setDialogOpen(false);
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus();
    }
  };

  // Load brands based on user role
  const loadBrands = useCallback(async () => {
    try {
      setLoadingBrands(true);
      const endpoint = isAdmin() ? '/brands' : '/catalogue/brands/accessible';
      const response = await fetch(getApiUrl(`api${endpoint}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch brands');
      
      const data = await response.json();
      
      const brandsToSet = isAdmin() ? data.brands : data;
      setBrands(brandsToSet);
    } catch (error) {
      console.error('Error loading brands:', error);
      setMessage('Failed to load brands');
      setSeverity('error');
      setShowMessage(true);
    } finally {
      setLoadingBrands(false);
    }
  }, [isAdmin]);

  // Load all buyers for access management
  const loadBuyers = useCallback(async () => {
    try {
      setLoadingBuyers(true);
      const response = await fetch(getApiUrl('api/buyers'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch buyers');
      
      const data = await response.json();
      setAllBuyers(data.buyers || data);
    } catch (error) {
      console.error('Error loading buyers:', error);
      setMessage('Failed to load buyers');
      setSeverity('error');
      setShowMessage(true);
    } finally {
      setLoadingBuyers(false);
    }
  }, []);

  // Load stock files for selected brand
  const loadStockFiles = useCallback(async (brand) => {
    if (!brand) return;
    
    try {
      setLoadingStockFiles(true);
      const response = await fetch(getApiUrl(`api/catalogue/${brand._id}/stock-files`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          // Buyer doesn't have access to this brand
          setStockFiles([]);
          setMessage('You do not have access to this brand');
          setSeverity('warning');
          setShowMessage(true);
          return;
        } else if (response.status === 404) {
          // Brand not found
          setStockFiles([]);
          setMessage('Brand not found');
          setSeverity('error');
          setShowMessage(true);
          return;
        } else {
          throw new Error('Failed to fetch stock files');
        }
      }
      
      const data = await response.json();
      const stockFiles = data.stockFiles || [];
      setStockFiles(stockFiles);
      
      // Show message if no stock files found
      if (stockFiles.length === 0) {
        setMessage('No stock files found in this brand');
        setSeverity('info');
        setShowMessage(true);
      }
    } catch (error) {
      console.error('Error loading stock files:', error);
      setStockFiles([]);
      setMessage('Failed to load stock files');
      setSeverity('error');
      setShowMessage(true);
    } finally {
      setLoadingStockFiles(false);
    }
  }, []);

  // Brand menu handlers
  const handleBrandMenuOpen = (event, brand) => {
    setBrandMenuAnchor(event.currentTarget);
    setSelectedBrandForMenu(brand);
  };

  const handleBrandMenuClose = () => {
    setBrandMenuAnchor(null);
  };

  const handleRenameBrand = () => {
    if (selectedBrandForMenu) {
      setNewBrandName(selectedBrandForMenu.name);
      openDialog(setShowRenameBrandDialog);
    }
    handleBrandMenuClose();
  };

  const handleDeleteBrand = () => {
    if (!selectedBrandForMenu) {
      setShowMessage(true);
      setMessage('No brand selected for deletion');
      setSeverity('error');
      return;
    }
    setShowDeleteBrandDialog(true);
    handleBrandMenuClose();
  };

  const handleManageAccess = () => {
    if (selectedBrandForMenu) {
      setBrandForAccess(selectedBrandForMenu);
      setVisibility(selectedBrandForMenu.visibility || 'all_approved');
      // Extract buyer IDs as strings
      const buyerIds = (selectedBrandForMenu.visibleToBuyers || []).map(buyer => 
        typeof buyer === 'object' ? String(buyer._id) : String(buyer)
      ).filter(id => id);
      setSelectedBuyers(buyerIds);
      setShowAccessDialog(true);
    }
    handleBrandMenuClose();
  };

  // When closing the delete brand dialog, clear selectedBrandForMenu
  const handleCloseDeleteBrandDialog = () => {
    closeDialog(setShowDeleteBrandDialog);
    setSelectedBrandForMenu(null);
  };

  // File menu handlers
  const handleFileMenuOpen = (event, file) => {
    setFileMenuAnchor(event.currentTarget);
    setSelectedFileForMenu(file);
  };

  const handleFileMenuClose = () => {
    setFileMenuAnchor(null);
  };

  const handleRenameFile = () => {
    if (selectedFileForMenu) {
      setNewFileName(selectedFileForMenu.originalName || selectedFileForMenu.fileName);
      openDialog(setShowRenameFileDialog);
    }
    handleFileMenuClose();
  };

  const handleDeleteFile = () => {
    if (!selectedFileForMenu) {
      setShowMessage(true);
      setMessage('No file selected for deletion');
      setSeverity('error');
      return;
    }
    setShowDeleteFileDialog(true);
    handleFileMenuClose();
  };

  const handleCloseDeleteFileDialog = () => {
    closeDialog(setShowDeleteFileDialog);
    setSelectedFileForMenu(null);
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(getApiUrl(`api/catalogue/${selectedBrand._id}/stock-file/${file._id}/download`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName || file.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setMessage('File downloaded successfully');
      setSeverity('success');
      setShowMessage(true);
    } catch (error) {
      console.error('Error downloading file:', error);
      setMessage('Failed to download file');
      setSeverity('error');
      setShowMessage(true);
    }
  };

  const handleReplaceAttachment = (file) => {
    setSelectedFileForReplace(file);
    setReplacementFile(null);
    setShowReplaceAttachmentDialog(true);
  };

  const handleReplaceFileSelect = (event) => {
    const file = event.target.files[0];
    setReplacementFile(file);
  };

  const handleSaveFileRename = async () => {
    if (!selectedFileForMenu || !newFileName.trim()) {
      setMessage('Please enter a valid file name');
      setSeverity('error');
      setShowMessage(true);
      return;
    }
    
    try {
      const response = await fetch(getApiUrl(`api/catalogue/${selectedBrand._id}/stock-file/${selectedFileForMenu._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ originalName: newFileName.trim() })
      });
      
      if (!response.ok) throw new Error('Failed to rename file');
      
      setMessage('File renamed successfully');
      setSeverity('success');
      setShowMessage(true);
      closeDialog(setShowRenameFileDialog);
      setNewFileName('');
      setSelectedFileForMenu(null);
      if (selectedBrand) {
        loadStockFiles(selectedBrand); // Refresh the stock files list
      }
    } catch (error) {
      console.error('Error renaming file:', error);
      setMessage('Failed to rename file');
      setSeverity('error');
      setShowMessage(true);
    }
  };

  const handleSaveAccess = async () => {
    if (!brandForAccess) {
      setShowAccessDialog(false);
      setBrandForAccess(null);
      return;
    }
    if (visibility === 'specific_buyers') {
      // Validate selectedBuyers: must be non-empty and all must be valid, approved, active buyers
      const validBuyerIds = allBuyers.map(b => String(b._id));
      const filteredBuyers = selectedBuyers.filter(id => validBuyerIds.includes(String(id)));
      if (!Array.isArray(selectedBuyers) || selectedBuyers.length === 0) {
        setMessage('Please select at least one valid buyer for specific access');
        setSeverity('error');
        setShowMessage(true);
        return;
      }
      if (filteredBuyers.length !== selectedBuyers.length) {
        setMessage('One or more selected buyers are invalid or not approved/active');
        setSeverity('error');
        setShowMessage(true);
        return;
      }
    }
    try {
      const response = await fetch(getApiUrl(`api/catalogue/brand/${brandForAccess._id}/visibility`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          visibility,
          visibleToBuyers: visibility === 'specific_buyers' ? selectedBuyers.map(String) : []
        })
      });
      if (!response.ok) throw new Error('Failed to update access settings');
      setShowAccessDialog(false);
      setBrandForAccess(null);
      loadBrands();
    } catch (error) {
      console.error('Error updating access settings:', error);
      setMessage('Failed to update access settings');
      setSeverity('error');
      setShowMessage(true);
    }
  };

  const handleDeleteBrandConfirm = async () => {
    if (!selectedBrandForMenu) {
      setMessage('No brand selected for deletion');
      setSeverity('error');
      setShowMessage(true);
      return;
    }
    
    try {
      const response = await fetch(getApiUrl(`api/brands/${selectedBrandForMenu._id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete brand');
      
      setMessage('Brand deleted successfully');
      setSeverity('success');
      setShowMessage(true);
      closeDialog(setShowDeleteBrandDialog);
      setSelectedBrandForMenu(null);
      setSelectedBrand(null);
      setStockFiles([]);
      loadBrands(); // Refresh the brands list
    } catch (error) {
      console.error('Error deleting brand:', error);
      setMessage('Failed to delete brand');
      setSeverity('error');
      setShowMessage(true);
    }
  };

  const handleDeleteFileConfirm = async () => {
    if (!selectedFileForMenu) {
      setMessage('No file selected for deletion');
      setSeverity('error');
      setShowMessage(true);
      return;
    }
    
    try {
      const response = await fetch(getApiUrl(`api/catalogue/${selectedBrand._id}/stock-file/${selectedFileForMenu._id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete file');
      
      setMessage('File deleted successfully');
      setSeverity('success');
      setShowMessage(true);
      closeDialog(setShowDeleteFileDialog);
      setSelectedFileForMenu(null);
      if (selectedBrand) {
        loadStockFiles(selectedBrand); // Refresh the stock files list
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setMessage('Failed to delete file');
      setSeverity('error');
      setShowMessage(true);
    }
  };

  const handleCreateBrand = () => {
    setNewBrandName('');
    setVisibility('all_approved');
    setSelectedBuyers([]);
    openDialog(setShowCreateBrandDialog);
  };

  const handleSaveCreateBrand = async () => {
    if (!newBrandName.trim()) {
      setMessage('Please enter a brand name');
      setSeverity('error');
      setShowMessage(true);
      return;
    }
    
    if (visibility === 'specific_buyers' && selectedBuyers.length === 0) {
      setMessage('Please select at least one buyer for specific access');
      setSeverity('error');
      setShowMessage(true);
      return;
    }
    
    try {
      const response = await fetch(getApiUrl('api/brands'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newBrandName.trim(),
          visibility,
          visibleToBuyers: visibility === 'specific_buyers' ? selectedBuyers : []
        })
      });
      
      if (!response.ok) throw new Error('Failed to create brand');
      
      setMessage('Brand created successfully');
      setSeverity('success');
      setShowMessage(true);
      closeDialog(setShowCreateBrandDialog);
      setNewBrandName('');
      setVisibility('all_approved');
      setSelectedBuyers([]);
      loadBrands(); // Refresh the brands list
    } catch (error) {
      console.error('Error creating brand:', error);
      setMessage('Failed to create brand');
      setSeverity('error');
      setShowMessage(true);
    }
  };

  const handleUploadFile = () => {
    setSelectedFile(null);
    openDialog(setShowUploadFileDialog);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleSaveUploadFile = async () => {
    if (!selectedFile || !selectedBrand) {
      setMessage('Please select a file and brand');
      setSeverity('error');
      setShowMessage(true);
      return;
    }
    
    const formData = new FormData();
    formData.append('files', selectedFile);
    
    try {
      setUploading(true);
      console.log('Uploading file:', selectedFile.name, 'to brand:', selectedBrand._id);
      
      const response = await fetch(getApiUrl(`api/catalogue/${selectedBrand._id}/upload`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status, 'Error:', errorText);
        
        let errorMessage = 'Failed to upload file';
        if (response.status === 413) {
          errorMessage = 'File is too large. Please try a smaller file.';
        } else if (response.status === 400) {
          errorMessage = 'Invalid file format. Please upload an Excel file (.xlsx, .xls, .xlsm).';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to upload files to this brand.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later or contact support.';
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('Upload successful:', result);
      
      setMessage('File uploaded successfully');
      setSeverity('success');
      setShowMessage(true);
      closeDialog(setShowUploadFileDialog);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      loadStockFiles(selectedBrand); // Refresh the stock files list
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage(error.message || 'Failed to upload file');
      setSeverity('error');
      setShowMessage(true);
    } finally {
      setUploading(false);
    }
  };



  const handleSaveBrandRename = async () => {
    if (!selectedBrandForMenu || !newBrandName.trim()) {
      setMessage('Please enter a valid brand name');
      setSeverity('error');
      setShowMessage(true);
      return;
    }

    try {
      const response = await fetch(getApiUrl(`api/catalogue/rename-brand`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          brandId: selectedBrandForMenu._id,
          newName: newBrandName.trim()
        })
      });

      if (response.ok) {
        setMessage('Brand renamed successfully');
        setSeverity('success');
        setShowMessage(true);
        closeDialog(setShowRenameBrandDialog);
        setSelectedBrandForMenu(null);
        setNewBrandName('');
        loadBrands();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to rename brand');
        setSeverity('error');
        setShowMessage(true);
      }
    } catch (error) {
      console.error('Error renaming brand:', error);
      setMessage('Failed to rename brand');
      setSeverity('error');
      setShowMessage(true);
    }
  };

  const handleSaveReplaceAttachment = async () => {
    if (!selectedFileForReplace || !replacementFile) {
      setMessage('Please select a file to replace the attachment');
      setSeverity('error');
      setShowMessage(true);
      return;
    }

    setReplacingFile(true);
    try {
      const formData = new FormData();
      formData.append('files', replacementFile);

      const response = await fetch(getApiUrl(`api/catalogue/replace-file/${selectedFileForReplace._id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        setMessage('File replaced successfully');
        setSeverity('success');
        setShowMessage(true);
        closeDialog(setShowReplaceAttachmentDialog);
        setSelectedFileForReplace(null);
        setReplacementFile(null);
        if (selectedBrand) {
          loadStockFiles(selectedBrand);
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to replace file');
        setSeverity('error');
        setShowMessage(true);
      }
    } catch (error) {
      console.error('Error replacing file:', error);
      setMessage('Failed to replace file');
      setSeverity('error');
      setShowMessage(true);
    } finally {
      setReplacingFile(false);
    }
  };



  useEffect(() => {
    loadBrands();
    if (isAdmin()) {
      loadBuyers();
    }
  }, [isAdmin, loadBrands, loadBuyers]);

  useEffect(() => {
    if (selectedBrand) {
      loadStockFiles(selectedBrand);
    }
  }, [selectedBrand, loadStockFiles]);

  useEffect(() => {
    if (location.search) {
      const params = new URLSearchParams(location.search);
      const brandId = params.get('brand');
      if (brandId) {
        setSelectedBrand(brands.find(b => b._id === brandId));
      }
    }
  }, [location.search, brands]);

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      {/* Left Panel - Brands */}
      <Paper elevation={0} sx={{ 
        width: 320, 
        borderRight: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={600} color="text.primary">
              Brands
            </Typography>
            {isAdmin() && (
              <Tooltip title="Create New Brand" placement="top">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleCreateBrand}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    minWidth: 'auto',
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  New Brand
                </Button>
              </Tooltip>
            )}
          </Box>
          
          {loadingBrands ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {brands.map(brand => (
                <ListItem 
                  button 
                  key={brand._id} 
                  selected={selectedBrand && selectedBrand._id === brand._id} 
                  onClick={() => setSelectedBrand(brand)}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    px: 2,
                    mx: 1,
                    mb: 1,
                    borderRadius: 1,
                    position: 'relative',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateX(4px)',
                    },
                    '&.Mui-selected': {
                      bgcolor: '#f5f5f5', // light grey
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: '#e0e0e0', // slightly darker grey on hover
                      }
                    },
                    transition: 'all 0.2s ease-in-out',
                    '&:hover .brand-menu': { opacity: 1 }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <FolderIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText 
                      primary={
                        <Typography variant="body1" fontWeight={500}>
                          {brand.name}
                        </Typography>
                      }
                    />
                  </Box>
                  
                  {isAdmin() && (
                    <Tooltip title="More actions" placement="top">
                      <IconButton
                        size="small"
                        onClick={(e) => handleBrandMenuOpen(e, brand)}
                        className="brand-menu"
                        sx={{ 
                          opacity: 0.7, 
                          transition: 'opacity 0.2s',
                          '&:hover': { 
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {isAdmin() && (
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 8,
                      zIndex: 2
                    }}>
                      <Chip
                        size="small"
                        label={
                          brand.visibility === 'all_approved' ? 'All Buyers' :
                          brand.visibility === 'specific_buyers' ? `${brand.visibleToBuyers?.length || 0} Selected` :
                          'Hidden'
                        }
                        sx={{
                          fontSize: '0.55rem',
                          height: 13,
                          px: 0.3,
                          bgcolor: '#f5f5f5',
                          color: '#333',
                          fontWeight: 500,
                          border: '1px solid #e0e0e0',
                          boxShadow: 'none',
                          letterSpacing: 0.2,
                          textTransform: 'none',
                        }}
                        variant="filled"
                      />
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* Right Panel - Collections */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedBrand ? (
          <>
            <Box sx={{ 
              p: 3, 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" fontWeight={600} color="text.primary">
                  {selectedBrand.name}
                </Typography>
                {isAdmin() && (
                  <Tooltip title="Upload File" placement="top">
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<CloudUploadIcon />}
                      onClick={handleUploadFile}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        bgcolor: 'secondary.main',
                        color: 'white',
                        fontWeight: 500,
                        '&:hover': {
                          bgcolor: 'secondary.dark',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      Upload File
                    </Button>
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body1" color="text.secondary">
                Stock Files
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
              {loadingStockFiles ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : stockFiles.length > 0 ? (
                <Grid container spacing={3}>
                  {stockFiles.map(stockFile => {
                    const isNew = new Date(stockFile.uploadedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return (
                      <Grid item xs={12} md={4} key={stockFile._id}>
                        <Card 
                          elevation={2}
                          sx={{ 
                            position: 'relative',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                              elevation: 8,
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                            },
                            transition: 'all 0.3s ease-in-out',
                            borderRadius: 1
                          }}
                        >
                           {/* Modern New badge at the absolute top-right edge - only for buyers */}
                           {!isAdmin() && isNew && (
                             <Box sx={{
                               position: 'absolute',
                               top: 4,
                               right: 4,
                               zIndex: 2,
                               px: 0.5,
                               py: 0.1,
                               bgcolor: '#10B981',
                               color: 'white',
                               fontWeight: 500,
                               fontSize: '0.5rem',
                               borderRadius: 0.5,
                               letterSpacing: 0.3,
                               textTransform: 'uppercase',
                               minWidth: 20,
                               textAlign: 'center',
                               lineHeight: 1,
                               opacity: 0.9
                             }}>
                               New
                             </Box>
                           )}
                           {/* Admin action menu button */}
                           {isAdmin() && (
                             <Box sx={{
                               position: 'absolute',
                               top: 12,
                               right: 12,
                               zIndex: 2
                             }}>
                               <Tooltip title="More actions" placement="top">
                                 <IconButton
                                   size="small"
                                   onClick={(e) => handleFileMenuOpen(e, stockFile)}
                                   sx={{ 
                                     bgcolor: 'rgba(255, 255, 255, 0.95)',
                                     backdropFilter: 'blur(4px)',
                                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                     '&:hover': { 
                                       bgcolor: 'rgba(255, 255, 255, 1)',
                                       transform: 'scale(1.1)',
                                       boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                     },
                                     transition: 'all 0.2s ease-in-out'
                                   }}
                                 >
                                   <MoreVertIcon fontSize="small" />
                                 </IconButton>
                               </Tooltip>
                             </Box>
                           )}
                          <CardContent sx={{ flex: 1, p: 3, pr: isAdmin() ? 6 : 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                              <ExcelSvgIcon style={{ marginRight: 16 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  variant="h6" 
                                  fontWeight={600} 
                                  sx={{
                                    minHeight: 56, // enough for 2 lines
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: 1.2,
                                    pr: isAdmin() ? 2 : 0 // Add right padding for admin to avoid overlap
                                  }}
                                >
                                  {(stockFile.originalName || stockFile.fileName).replace(/\.[^/.]+$/, '')}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                                                     {/* Last updated info below content, above actions */}
                           <Box sx={{ px: 3, pb: 0, pt: 0, mb: 1, textAlign: 'left' }}>
                             <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7em', letterSpacing: 0.2 }}>
                               Last updated: {new Date(stockFile.uploadedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                             </Typography>
                           </Box>
                          <CardActions sx={{ p: 3, pt: 0 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                              {/* Download button only */}
                              <Tooltip 
                                title="Download this file to place your order" 
                                placement="bottom"
                                componentsProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '0.75rem',
                                      bgcolor: 'rgba(0, 0, 0, 0.8)',
                                      '& .MuiTooltip-arrow': {
                                        color: 'rgba(0, 0, 0, 0.8)'
                                      }
                                    }
                                  }
                                }}
                              >
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  startIcon={<DownloadIcon />}
                                  onClick={() => handleDownload(stockFile)}
                                  sx={{ 
                                    width: '100%',
                                    fontWeight: 500,
                                    borderRadius: 2,
                                    textTransform: 'none'
                                  }}
                                >
                                  Download
                                </Button>
                              </Tooltip>
                            </Box>
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  width: '100%',
                }}>
                  <FileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                    No stock files have been uploaded for this brand yet.
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            textAlign: 'center',
            width: '100%',
            pt: 8
          }}>
            <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight={500}>
              Select a Brand
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Choose a brand from the left panel to view its stock files.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Brand Menu */}
      <Menu
        anchorEl={brandMenuAnchor}
        open={Boolean(brandMenuAnchor)}
        onClose={handleBrandMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <MenuItem onClick={handleRenameBrand}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Rename Brand
        </MenuItem>
        <MenuItem onClick={handleManageAccess}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          Manage Access
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteBrand} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete Brand
        </MenuItem>
      </Menu>

      {/* File Menu */}
      <Menu
        anchorEl={fileMenuAnchor}
        open={Boolean(fileMenuAnchor)}
        onClose={handleFileMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <MenuItem onClick={handleRenameFile}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Rename File
        </MenuItem>
        <MenuItem onClick={() => handleDownload(selectedFileForMenu)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          Download File
        </MenuItem>
        {isAdmin() && (
          <>
            <Divider />
            <MenuItem onClick={() => {
              handleSetGoogleSheetUrl(selectedFileForMenu);
              handleFileMenuClose();
            }}>
              <ListItemIcon>
                <LinkIcon fontSize="small" />
              </ListItemIcon>
              {selectedFileForMenu?.googleSheetUrl ? 'Update Google Sheet URL' : 'Set Google Sheet URL'}
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={handleDeleteFile} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete File
        </MenuItem>
      </Menu>

      {/* Rename Brand Dialog */}
      <Dialog 
        open={showRenameBrandDialog} 
        onClose={() => closeDialog(setShowRenameBrandDialog)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            minWidth: 400,
            minHeight: 220
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Rename Brand
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Brand Name"
            fullWidth
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => closeDialog(setShowRenameBrandDialog)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveBrandRename} 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Brand Dialog */}
      <Dialog 
        open={showDeleteBrandDialog} 
        onClose={handleCloseDeleteBrandDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Delete Brand
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography>
            Are you sure you want to delete "{selectedBrandForMenu?.name}"? All associated files will be deleted. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDeleteBrandDialog}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteBrandConfirm} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename File Dialog */}
      <Dialog 
        open={showRenameFileDialog} 
        onClose={() => closeDialog(setShowRenameFileDialog)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Rename File
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => closeDialog(setShowRenameFileDialog)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveFileRename} 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete File Dialog */}
      <Dialog 
        open={showDeleteFileDialog} 
        onClose={handleCloseDeleteFileDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Delete File
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography>
            Are you sure you want to delete "{selectedFileForMenu?.originalName || selectedFileForMenu?.fileName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDeleteFileDialog}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteFileConfirm} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Access Management Dialog */}
      <Dialog 
        open={showAccessDialog} 
        onClose={() => {
          closeDialog(setShowAccessDialog);
          setBrandForAccess(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            maxHeight: 500, // Set a more reasonable max height
            minHeight: 0
          }
        }}
      >
        <DialogTitle sx={{ pb: 3 }}>
          Manage Access - {brandForAccess?.name}
        </DialogTitle>
        <DialogContent sx={{ pb: 2, pt: 0, overflowY: 'auto' }}>
          {brandForAccess && brandForAccess._id && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Visibility</InputLabel>
                <Select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  label="Visibility"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all_approved">Visible to All Buyers</MenuItem>
                  <MenuItem value="specific_buyers">Visible to Selected Buyers Only</MenuItem>
                  <MenuItem value="hidden">Hidden from All Buyers</MenuItem>
                </Select>
              </FormControl>
              {visibility === 'specific_buyers' && (
                <FormControl fullWidth>
                  <InputLabel>Select Buyers</InputLabel>
                  <Select
                    multiple
                    value={selectedBuyers}
                    onChange={(e) => setSelectedBuyers(e.target.value.map(String))}
                    input={<OutlinedInput label="Select Buyers" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((buyerId) => {
                          const buyer = allBuyers.find(b => b._id === buyerId);
                          return (
                            <Chip 
                              key={buyerId} 
                              label={buyer ? `${buyer.name} (${buyer.companyName})` : buyerId}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                    sx={{ borderRadius: 2 }}
                  >
                    {loadingBuyers ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading buyers...
                      </MenuItem>
                    ) : (
                      allBuyers.map((buyer) => (
                        <MenuItem key={buyer._id} value={buyer._id}>
                          <Checkbox checked={selectedBuyers.includes(buyer._id)} />
                          <ListItemText 
                            primary={buyer.name}
                            secondary={`${buyer.companyName} - ${buyer.email}`}
                          />
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => {
              closeDialog(setShowAccessDialog);
              setBrandForAccess(null);
            }}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAccess} 
            variant="contained"
            disabled={!brandForAccess || !brandForAccess._id}
            sx={{ borderRadius: 2 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Brand Dialog */}
      <Dialog 
        open={showCreateBrandDialog} 
        onClose={() => closeDialog(setShowCreateBrandDialog)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Create New Brand
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Brand Name"
              fullWidth
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Enter brand name"
            />
            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                label="Visibility"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all_approved">Visible to All Buyers</MenuItem>
                <MenuItem value="specific_buyers">Visible to Selected Buyers Only</MenuItem>
                <MenuItem value="hidden">Hidden from All Buyers</MenuItem>
              </Select>
            </FormControl>
            {visibility === 'specific_buyers' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Select which buyers can access this brand:
                </Typography>
                {loadingBuyers ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <FormGroup>
                    {allBuyers.map((buyer) => (
                      <FormControlLabel
                        key={buyer._id}
                        control={
                          <Checkbox
                            checked={selectedBuyers.includes(buyer._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBuyers([...selectedBuyers, buyer._id]);
                              } else {
                                setSelectedBuyers(selectedBuyers.filter(id => id !== buyer._id));
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {buyer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {buyer.email} {buyer.companyName ? `• ${buyer.companyName}` : ''}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => closeDialog(setShowCreateBrandDialog)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCreateBrand} 
            variant="contained"
            disabled={!newBrandName.trim() || (visibility === 'specific_buyers' && selectedBuyers.length === 0)}
            sx={{ borderRadius: 2 }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload File Dialog */}
      <Dialog 
        open={showUploadFileDialog} 
        onClose={() => closeDialog(setShowUploadFileDialog)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            minWidth: 420,
            minHeight: 220
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Upload Stock File to {selectedBrand?.name}
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.xlsm"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ borderRadius: 2, py: 2 }}
            >
              Select File
            </Button>
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => closeDialog(setShowUploadFileDialog)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveUploadFile} 
            variant="contained"
            disabled={!selectedFile || uploading}
            sx={{ borderRadius: 2 }}
          >
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>



      {/* Replace Attachment Dialog */}
      <Dialog 
        open={showReplaceAttachmentDialog} 
        onClose={() => {
          closeDialog(setShowReplaceAttachmentDialog);
          setSelectedFileForReplace(null);
          setReplacementFile(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Replace Attachment for {selectedFileForReplace?.originalName || selectedFileForReplace?.fileName}
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Box sx={{ mt: 2 }}>
            <input
              ref={replacementFileInputRef}
              type="file"
              accept=".xlsx,.xls,.xlsm"
              onChange={handleReplaceFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              onClick={() => replacementFileInputRef.current?.click()}
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ mb: 2, borderRadius: 2, py: 2 }}
            >
              Select New File
            </Button>
            {replacementFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {replacementFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => closeDialog(setShowReplaceAttachmentDialog)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveReplaceAttachment} 
            variant="contained"
            disabled={!replacementFile || replacingFile}
            sx={{ borderRadius: 2 }}
          >
            {replacingFile ? <CircularProgress size={20} /> : 'Replace'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Menu for Admin Actions */}
      <Menu
        anchorEl={fileMenuAnchor}
        open={Boolean(fileMenuAnchor)}
        onClose={handleFileMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            minWidth: 200
          }
        }}
      >

        <MenuItem onClick={() => {
          handleReplaceAttachment(selectedFileForMenu);
          handleFileMenuClose();
        }}>
          <ListItemIcon>
            <CloudUploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Replace Attachment</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          setNewFileName(selectedFileForMenu?.originalName || selectedFileForMenu?.fileName);
          openDialog(setShowRenameFileDialog);
          handleFileMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename File</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          handleDeleteFile();
          handleFileMenuClose();
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete File</ListItemText>
        </MenuItem>
      </Menu>



      {/* Snackbar for messages */}
      <Snackbar
        open={showMessage && severity === 'error'}
        autoHideDuration={6000}
        onClose={() => setShowMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowMessage(false)} 
          severity={severity}
          sx={{ borderRadius: 2 }}
        >
          {message}
        </Alert>
      </Snackbar>


    </Box>
  );
} 