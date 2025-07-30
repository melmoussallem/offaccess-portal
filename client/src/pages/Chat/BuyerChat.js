import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import {
  Send as SendIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import { useChat } from '../../contexts/ChatContext';

const BuyerChat = () => {
  // Add robust CSS for chat-input-container
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const permanentBorderStyle = `
        .chat-input-container {
          border: 2px solid #e0e0e0 !important;
          background-color: white !important;
          border-radius: 24px !important;
          padding: 8px 16px !important;
          display: flex !important;
          gap: 12px !important;
          align-items: center !important;
        }
        .chat-input-container:focus-within {
          border: 2px solid #1976d2 !important;
        }
        .chat-input-container:hover {
          border: 2px solid #e0e0e0 !important;
        }
        .chat-input-container:focus {
          border: 2px solid #e0e0e0 !important;
        }
        .chat-input-container:active {
          border: 2px solid #e0e0e0 !important;
        }
        .chat-input-container textarea {
          outline: none !important;
          border: none !important;
          background: transparent !important;
          width: 100% !important;
          font-size: 14px !important;
          padding: 8px 0 !important;
          line-height: 1.4 !important;
          resize: none !important;
          font-family: inherit !important;
          min-height: 20px !important;
          max-height: 80px !important;
        }
        .chat-input-container textarea:focus {
          outline: none !important;
          border: none !important;
          background: transparent !important;
        }
        .chat-input-container textarea:active {
          outline: none !important;
          border: none !important;
          background: transparent !important;
        }
        .chat-input-container * {
          outline: none !important;
        }
        .chat-input-container *:focus {
          outline: none !important;
        }
        .chat-input-container *:active {
          outline: none !important;
        }
        /* Override any Material-UI focus styles */
        .chat-input-container.Mui-focused {
          border: 2px solid #e0e0e0 !important;
        }
        .chat-input-container .Mui-focused {
          border: 2px solid #e0e0e0 !important;
        }
        /* Force override any other styles */
        .chat-input-container,
        .chat-input-container *,
        .chat-input-container *:focus,
        .chat-input-container *:hover,
        .chat-input-container *:active {
          outline: none !important;
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = permanentBorderStyle;
      document.head.appendChild(style);
      
      return () => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    }
  }, []);
  const { messages, sendMessage, unreadCount, markAsRead, currentChat, fetchMyChat, error } = useChat();
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    // Try multiple times to ensure scroll works
    const attemptScroll = (attempts = 0) => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      // Retry if needed
      if (attempts < 2) {
        setTimeout(() => attemptScroll(attempts + 1), 200);
      }
    };
    
    setTimeout(() => {
      attemptScroll();
    }, 300);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  // Additional scroll trigger when chat is first opened
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [isOpen, messages.length, scrollToBottom]);

  // Force scroll to bottom when chat is opened
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [isOpen, messages.length, scrollToBottom]);

  useEffect(() => {
    if (isOpen && currentChat && messages.length > 0) {
      // Only mark as read when chat is opened and there are messages to view
      const hasUnreadMessages = messages.some(msg => !msg.isRead && msg.senderRole === 'admin');
      if (hasUnreadMessages) {
      markAsRead(currentChat.id);
      }
    }
  }, [isOpen, currentChat, markAsRead, messages]);

  // Ensure input is focused when chat is opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);



  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(message.trim());
      setMessage('');
      // Force recreate input field to ensure focus
      setInputKey(prev => prev + 1);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  }, [message, sending, sendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleInputChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);

  const handleCloseChat = useCallback(() => {
    setIsOpen(false);
    // Refresh unread count when chat is closed
    setTimeout(() => {
      fetchMyChat();
    }, 500);
  }, [fetchMyChat]);

  const formatTime = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  // Memoize the messages rendering to prevent unnecessary re-renders
  const renderedMessages = useMemo(() => {
    return messages.map((msg, index) => {
      const isOwnMessage = msg.senderRole === 'buyer';
      const showDate = index === 0 || 
        formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);

      return (
        <Box key={msg._id || index}>
          {showDate && (
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Chip
                label={formatDate(msg.createdAt)}
                size="small"
                variant="outlined"
                sx={{
                  bgcolor: 'background.paper',
                  borderColor: 'divider',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              />
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
              marginBottom: '8px',
              padding: '0 12px'
            }}
          >
            <Box
              sx={{
                maxWidth: '70%',
                padding: '8px 12px',
                borderRadius: '18px',
                backgroundColor: isOwnMessage ? '#dcf8c6' : '#ffffff',
                border: isOwnMessage ? 'none' : '1px solid #e0e0e0',
                position: 'relative',
                wordWrap: 'break-word'
              }}
            >
              <Box sx={{ fontSize: '14px', color: '#000000', lineHeight: '1.4' }}>
                {msg.content}
              </Box>
              <Box
                sx={{
                  fontSize: '11px',
                  color: '#8e8e8e',
                  marginTop: '4px',
                  textAlign: isOwnMessage ? 'right' : 'left'
                }}
              >
                {formatTime(msg.createdAt)}
              </Box>
            </Box>
          </Box>
        </Box>
      );
    });
  }, [messages, formatDate, formatTime]);

  const ChatWindow = useMemo(() => (
    <Fade in={isOpen} timeout={300}>
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 400,
          height: 550,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          borderRadius: '20px',
          border: '1px solid #e0e0e0',
          backgroundColor: 'rgba(255,255,255,0.98)'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 1.5,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                p: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <SupportIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                Contact Support
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={handleCloseChat}
            sx={{ 
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mx: 2, 
              mt: 1.5,
              borderRadius: 2,
              fontSize: '0.8rem'
            }}
          >
            {typeof error === 'string' ? error : (error?.message || 'An error occurred')}
          </Alert>
        )}

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            bgcolor: '#f8f9fa'
          }}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary',
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  bgcolor: 'grey.100',
                  borderRadius: '50%',
                  p: 2,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChatIcon sx={{ fontSize: 32, color: 'grey.500' }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Start a conversation
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Our support team is ready to help you
              </Typography>
            </Box>
          ) : (
            renderedMessages
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Message Input */}
        <Box sx={{ 
          p: 2.5, 
          bgcolor: '#f8f9fa'
        }}>
          <div 
            className="chat-input-container"
            style={{
              border: '2px solid #e0e0e0 !important',
              backgroundColor: 'white !important',
              borderRadius: '24px !important',
              padding: '8px 16px !important',
              display: 'flex !important',
              gap: '12px !important',
              alignItems: 'center !important',
              outline: 'none !important'
            }}
          >
            <textarea
              key={inputKey}
              ref={inputRef}
              placeholder="Type a message..."
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={sending}
              autoFocus
              style={{
                width: '100%',
                fontSize: '14px',
                padding: '8px 0',
                lineHeight: '1.4',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                backgroundColor: 'transparent',
                minHeight: '20px',
                maxHeight: '80px'
              }}
              rows={1}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!message.trim() || sending}
              sx={{ 
                bgcolor: message.trim() ? '#25d366' : '#e0e0e0',
                color: message.trim() ? 'white' : '#9e9e9e',
                width: 36,
                height: 36,
                borderRadius: '50%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: message.trim() ? '#128c7e' : '#d0d0d0',
                  transform: 'scale(1.05)'
                },
                '&:disabled': {
                  bgcolor: '#f5f5f5',
                  color: '#bdbdbd'
                }
              }}
            >
              {sending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SendIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </div>
        </Box>
      </Paper>
    </Fade>
  ), [message, sending, error, messages.length, renderedMessages, handleInputChange, handleKeyPress, handleSendMessage, isOpen, handleCloseChat, inputKey]);

  const ChatButton = useMemo(() => {
    console.log('BuyerChat - unreadCount:', unreadCount); // Debug log
    console.log('BuyerChat - currentChat:', currentChat); // Debug log
    console.log('BuyerChat - messages.length:', messages.length); // Debug log
    
    // Use real unread count instead of hardcoded values
    // Toggle the next two lines for testing:
    // const showBadge = true, badgeCount = 2; // <-- Uncomment for forced badge
    const showBadge = unreadCount > 0, badgeCount = unreadCount; // <-- Use real unread count
    
    console.log('BuyerChat - showBadge:', showBadge, 'badgeCount:', badgeCount); // Debug log
    console.log('BuyerChat - Badge should be visible:', showBadge ? 'YES' : 'NO');
    
    // TEMPORARY: Add a visual indicator for testing
    if (showBadge) {
      console.log('🎯 BUYER BADGE SHOULD BE VISIBLE WITH COUNT:', badgeCount);
    }
    
    return (
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999 }}>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Button
            variant="contained"
            onClick={() => setIsOpen(true)}
            startIcon={<ChatIcon />}
            sx={{
              borderRadius: 0,
              px: 3,
              py: 1.5,
              background: showBadge ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              boxShadow: showBadge ? '0 4px 12px rgba(244, 67, 54, 0.3)' : '0 4px 12px rgba(25, 118, 210, 0.4)',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.2s',
              '&:hover': {
                background: showBadge ? 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)' : 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                boxShadow: showBadge ? '0 6px 16px rgba(244, 67, 54, 0.4)' : '0 6px 16px rgba(25, 118, 210, 0.5)'
              }
            }}
          >
            Chat with us
          </Button>
          {showBadge && (
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                minWidth: 22,
                height: 22,
                bgcolor: '#f44336',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.2)',
                zIndex: 1,
                pointerEvents: 'none',
                transition: 'all 0.2s',
              }}
            >
              {badgeCount}
            </Box>
          )}
        </Box>
      </Box>
    );
  }, [unreadCount, currentChat, messages.length]);

  return (
    <>
      {isOpen && ChatWindow}
      {!isOpen && ChatButton}
    </>
  );
};

export default BuyerChat; 