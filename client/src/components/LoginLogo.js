import React from 'react';
import { Box } from '@mui/material';

const LoginLogo = ({ sx = {} }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2,
        mb: 3,
        ...sx 
      }}
    >
      {/* Icon on top */}
      <img 
        src="/Off Access Icon.png" 
        alt="Off Access Icon" 
        style={{ 
          width: 80, 
          height: 80, 
          objectFit: 'contain' 
        }}
      />
      
      {/* Logo below */}
      <img 
        src="/Off Access Black.svg" 
        alt="Off Access Logo" 
        style={{ 
          width: 200, 
          height: 60, 
          objectFit: 'contain' 
        }}
      />
    </Box>
  );
};

export default LoginLogo;
