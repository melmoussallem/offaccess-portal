import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Modal,
  Button
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';

/**
 * GoogleSheetPreviewModal
 * Displays a Google Sheet preview in a modal popup with a large iframe.
 * Includes a close button and a download button for the Excel file.
 *
 * Props:
 * - open: boolean (controls modal visibility)
 * - onClose: function (called when modal is closed)
 * - googleSheetUrl: string (Google Sheet published URL)
 * - fileName: string (Excel file name for display)
 * - onDownloadClick: function (called to download Excel file)
 */
const GoogleSheetPreview = ({
  open,
  onClose,
  googleSheetUrl,
  fileName,
  onDownloadClick
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef(null);

  // Convert Google Sheet URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    // If it's already a published web URL, use it directly
    if (url.includes('/pubhtml')) {
      return url;
    }
    // Handle different Google Sheet URL formats
    let sheetId = '';
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /\/d\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        sheetId = match[1];
        break;
      }
    }
    if (!sheetId) {
      throw new Error('Invalid Google Sheet URL format');
    }
    // Try to minimize Google branding by using more parameters
    return `https://docs.google.com/spreadsheets/d/e/${sheetId}/pubhtml?widget=true&headers=false&chrome=false&rm=minimal&gid=0&ui=2&output=html&single=true&rm=minimal&chrome=false&headers=false&widget=true&single=true&gid=0&ui=2&output=html&rm=minimal&chrome=false&headers=false&widget=true&single=true&gid=0&ui=2&output=html`;
  };

  // Handle iframe load events
  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  // Prevent right-click on iframe
  const handleIframeContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  // Refresh the preview
  const handleRefresh = () => {
    setLoading(true);
    setError(false);
    setIframeKey(prev => prev + 1);
  };

  // Security: Disable iframe interactions but allow scrolling
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('contextmenu', handleIframeContextMenu);
      // Allow scrolling but prevent other interactions
      iframe.addEventListener('selectstart', (e) => e.preventDefault());
      iframe.addEventListener('dragstart', (e) => e.preventDefault());
      return () => {
        iframe.removeEventListener('contextmenu', handleIframeContextMenu);
        iframe.removeEventListener('selectstart', (e) => e.preventDefault());
        iframe.removeEventListener('dragstart', (e) => e.preventDefault());
      };
    }
  }, [iframeKey, open]);

  // Generate embed URL
  let embedUrl = null;
  try {
    embedUrl = getEmbedUrl(googleSheetUrl);
  } catch (err) {
    setError(true);
  }

  // Modal style for portal theme
  const modalStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1300
  };

  // Paper style for modal content
  const paperStyle = {
    position: 'relative',
    width: '95vw',
    maxWidth: 1800,
    height: '90vh',
    maxHeight: 1200,
    bgcolor: 'background.paper',
    borderRadius: 0,
    boxShadow: 24,
    p: 0,
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    border: '1px solid',
    borderColor: 'divider',
  };

  return (
    <Modal open={open} onClose={onClose} sx={modalStyle}>
      <Paper sx={paperStyle}>
        {/* Modal Header with file name, refresh, download, and close button */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityIcon color="primary" />
            <Typography variant="h6" component="h3" fontWeight={600}>
              {fileName} - Preview
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Refresh preview">
              <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Excel Template">
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={onDownloadClick}
                sx={{ fontWeight: 500, borderRadius: 0 }}
              >
                Download Excel Template
              </Button>
            </Tooltip>
            {/* Close button in top-right corner */}
            <Tooltip title="Close">
              <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {/* Modal Body: Large iframe preview with loading/error states */}
        <Box sx={{
          position: 'relative',
          width: '100%',
          height: 'calc(90vh - 120px)',
          minHeight: 600,
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 0,
          overflow: 'hidden',
        }}>
          {loading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'background.paper',
              zIndex: 1
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Loading preview...
                </Typography>
              </Box>
            </Box>
          )}
          {error && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'background.paper',
              zIndex: 1
            }}>
              <Alert severity="error" sx={{ maxWidth: '80%' }}>
                <Typography variant="body2">
                  Failed to load preview. Please try again.
                </Typography>
              </Alert>
            </Box>
          )}
          {/* Large, scrollable iframe for Google Sheet preview */}
          {embedUrl && !error && (
            <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'auto' }}>
              {/* Iframe for the sheet */}
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={embedUrl}
                title={`Preview of ${fileName}`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'white',
                  pointerEvents: 'auto',
                }}
                sandbox="allow-same-origin allow-scripts"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                allow="none"
                loading="lazy"
              />
              {/* Note: Google Sheets footer cannot be removed as it's part of Google's embedded content */}
            </Box>
          )}
        </Box>

      </Paper>
    </Modal>
  );
};

export default GoogleSheetPreview; 