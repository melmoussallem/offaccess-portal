import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ChatPage = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Support Chat
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {user?.role === 'admin' ? 'Customer Support Dashboard' : 'Support Chat'}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            {user?.role === 'admin' 
              ? 'Use the chat button in the bottom right corner to manage customer conversations.'
              : 'Use the chat button in the bottom right corner to start a conversation with our support team.'
            }
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {user?.role === 'admin'
              ? 'You can view all buyer conversations and respond to their inquiries in real-time.'
              : 'Our support team is here to help you with any questions about our products or services.'
            }
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ChatPage; 