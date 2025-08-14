import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const Logo = ({ 
  variant = 'default', 
  size = 'medium', 
  showText = true,
  type = 'logo', // 'logo' or 'icon'
  stacked = false, // For login page - icon on top, logo below
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

  // Determine which asset to use based on type and variant
  const getAssetSrc = () => {
    if (type === 'icon') {
      return '/Off Access Icon.png';
    } else {
      // Logo type
      if (variant === 'white') {
        return '/Off Access White.png';
      } else {
        return '/Off Access Black.png';
      }
    }
  };

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    ...sx
  };

  const stackedStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    ...sx
  };

  const imageStyles = {
    ...getSize(),
    objectFit: 'contain'
  };

  // For stacked layout (login page)
  if (stacked) {
    return (
      <Box sx={{ ...stackedStyles, gap: 0 }}>
        {/* Icon on top - smaller size */}
        <img 
          src="/Off Access Icon.png" 
          alt="Off Access Icon" 
          style={{ ...imageStyles, width: imageStyles.width * 0.4, height: imageStyles.height * 0.4, marginBottom: '-15px' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        {/* Logo below */}
        <img 
          src={getAssetSrc()} 
          alt="Off Access Logo" 
          style={imageStyles}
          onError={(e) => {
            // Fallback to text if logo fails to load
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'block';
            }
          }}
        />
        {/* No text fallback for stacked layout */}
      </Box>
    );
  }

  // Regular layout
  return (
    <Box sx={logoStyles}>
      <img 
        src={getAssetSrc()} 
        alt={type === 'icon' ? 'Off Access Icon' : 'Off Access Logo'} 
        style={imageStyles}
        onError={(e) => {
          // Fallback to icon if logo fails to load
          if (type === 'logo') {
            e.target.src = '/Off Access Icon.png';
            e.target.onerror = () => {
              // Final fallback to text
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'block';
              }
            };
          } else {
            // Final fallback to text for icon
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'block';
            }
          }
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
          Off Access
        </Typography>
      )}
    </Box>
  );
};

export default Logo;
