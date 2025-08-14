import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const Logo = ({ 
  variant = 'default', 
  size = 'medium', 
  showText = true,
  type = 'logo', // 'logo' or 'icon'
  sx = {} 
}) => {
  const theme = useTheme();
  
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

  // Determine which asset to use based on type and variant
  const getAssetSrc = () => {
    if (type === 'icon') {
      return '/Off Access Icon.png';
    } else {
      // Logo type
      if (variant === 'white') {
        return '/Off Access White.svg';
      } else {
        return '/Off Access Black.svg';
      }
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
        src={getAssetSrc()} 
        alt={type === 'icon' ? 'Off Access Icon' : 'Off Access Logo'} 
        style={imageStyles}
      />
    </Box>
  );
};

export default Logo;
