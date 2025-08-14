import React from 'react';
import { Box, Typography } from '@mui/material';

const Logo = ({ 
  variant = 'default', 
  size = 'medium', 
  showText = true,
  sx = {} 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32 };
      case 'medium':
        return { width: 48, height: 48 };
      case 'large':
        return { width: 64, height: 64 };
      case 'xlarge':
        return { width: 120, height: 120 };
      default:
        return { width: 48, height: 48 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'body2';
      case 'medium':
        return 'h6';
      case 'large':
        return 'h5';
      case 'xlarge':
        return 'h4';
      default:
        return 'h6';
    }
  };

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    ...sx
  };

  const imageStyles = {
    ...getSize(),
    objectFit: 'contain'
  };

  return (
    <Box sx={logoStyles}>
      <img 
        src="/logo.svg" 
        alt="OffAccess Logo" 
        style={imageStyles}
        onError={(e) => {
          // Fallback to text if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
      {showText && (
        <Typography 
          variant={getTextSize()} 
          component="span"
          sx={{ 
            fontWeight: 600,
            color: variant === 'white' ? 'white' : 'primary.main',
            display: 'none', // Hidden by default, shown if image fails
            '&.fallback': {
              display: 'block'
            }
          }}
          className="fallback"
        >
          OffAccess
        </Typography>
      )}
    </Box>
  );
};

export default Logo;
