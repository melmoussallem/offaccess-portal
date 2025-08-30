import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Alert,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Send as SendIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  Support as SupportIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { useChat } from '../../contexts/ChatContext';

const AdminChat = () => {
  // Add state to track focus and force border visibility
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
  const { 
    conversations, 
    currentChat, 
    messages, 
    sendMessage, 
    unreadConversationsCount,
    markAsRead, 
    fetchConversation,
    fetchConversations,
    error,
    deleteChat,
    loading,
    setCurrentChat,
    setMessages,
    selectedBuyerId,
    setSelectedBuyerId
  } = useChat();
  
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Add state for new chat dialog and buyers list
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [buyersList, setBuyersList] = useState([]);
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [buyersSearch, setBuyersSearch] = useState('');

  // 1. Add state for confirmation dialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteBuyerId, setPendingDeleteBuyerId] = useState(null);

  // 1. Add state for clear chat dialog
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  // 2. Add function to fetch all buyers (approved, active)
  const fetchBuyersList = useCallback(async () => {
    setBuyersLoading(true);
    try {
      const res = await fetch('/api/buyers?status=approved', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      // Only show buyers not already in conversations
      const existingBuyerIds = new Set(conversations.map(conv => String(conv.buyerId)));
      const filteredBuyers = (data.buyers || []).filter(buyer => !existingBuyerIds.has(String(buyer._id)));
      setBuyersList(filteredBuyers);
    } catch (e) {
      setBuyersList([]);
    } finally {
      setBuyersLoading(false);
    }
  }, [conversations]);

  // 3. Add handler to open new chat dialog
  const handleOpenNewChat = useCallback(() => {
    setNewChatOpen(true);
    fetchBuyersList();
  }, [fetchBuyersList]);
  const handleCloseNewChat = () => {
    setNewChatOpen(false);
    setBuyersSearch('');
  };

  // 4. Add handler to start chat with selected buyer
  const handleStartChat = async (buyerId) => {
    setSelectedBuyerId(buyerId);
    setIsOpen(true);
    setNewChatOpen(false);
    await fetchConversation(buyerId);
    await fetchConversations(); // Force refresh conversations after starting new chat
    setTimeout(() => {
    }, 500);
  };

  // 2. Update handleDeleteChat to open confirmation dialog
  const handleDeleteChat = useCallback((buyerId) => {
    setPendingDeleteBuyerId(buyerId);
    setConfirmDeleteOpen(true);
  }, []);

  // 3. Add function to confirm deletion
  const confirmDelete = async () => {
    if (pendingDeleteBuyerId) {
      await deleteChat(pendingDeleteBuyerId);
      // If the deleted chat is currently selected, clear the selection and chat window
      if (selectedBuyerId === pendingDeleteBuyerId) {
        setSelectedBuyerId(null);
        setCurrentChat(null);
        setMessages([]);
        setIsOpen(false);
      }
      // Always refresh conversations after deletion
      fetchConversations();
    }
    setConfirmDeleteOpen(false);
    setPendingDeleteBuyerId(null);
  };

  // 4. Add function to cancel deletion
  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setPendingDeleteBuyerId(null);
  };

  // Handler for clear chat
  const handleClearChat = () => {
    setConfirmClearOpen(true);
  };
  const confirmClear = useCallback(async () => {
    if (!currentChat?.id && !selectedBuyerId) return;
    setClearing(true);
    try {
      const chatId = currentChat?.id || selectedBuyerId;
      const res = await fetch(`/api/chat/${chatId}/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        // Refetch conversation to update messages
        await fetchConversation(selectedBuyerId);
      }
    } catch (e) {
      // Optionally show error
    } finally {
      setClearing(false);
      setConfirmClearOpen(false);
    }
  }, [currentChat, selectedBuyerId, fetchConversation]);
  const cancelClear = useCallback(() => {
    setConfirmClearOpen(false);
  }, []);

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
    if (isOpen && selectedBuyerId) {
      scrollToBottom();
    }
  }, [messages, isOpen, selectedBuyerId, scrollToBottom]);

  // Additional scroll trigger when chat is first opened
  useEffect(() => {
    if (isOpen && selectedBuyerId && messages.length > 0) {
      scrollToBottom();
    }
  }, [isOpen, selectedBuyerId, messages.length, scrollToBottom]);

  // Force scroll to bottom when conversation is selected
  useEffect(() => {
    if (selectedBuyerId && messages.length > 0) {
      scrollToBottom();
    }
  }, [selectedBuyerId, messages.length, scrollToBottom]);

  // Mark messages as read only when conversation is actually viewed
  useEffect(() => {
    if (isOpen && selectedBuyerId && currentChat?.id && messages.length > 0) {
      // Only mark as read when there are unread messages from buyers
      const hasUnreadMessages = messages.some(msg => !msg.isRead && msg.senderRole === 'buyer');
      if (hasUnreadMessages) {
        markAsRead(currentChat.id);
      }
    }
  }, [isOpen, selectedBuyerId, currentChat, messages, markAsRead]);

  // Ensure input is focused when chat is opened or conversation is selected
  useEffect(() => {
    if (isOpen && selectedBuyerId) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedBuyerId]);

  // Convert handleSelectConversation to a plain function (not useCallback)
  const handleSelectConversation = useCallback((buyerId) => {
    setCurrentChat(null);
    setMessages([]);
    const idStr = String(buyerId);
    setSelectedBuyerId(idStr);
    fetchConversation(idStr);
  }, [setCurrentChat, setMessages, setSelectedBuyerId, fetchConversation]);

  const handleCloseChat = useCallback(() => {
    setIsOpen(false);
    setSelectedBuyerId(null);
    // Refresh conversations to update badge count
    setTimeout(() => {
      fetchConversations();
    }, 500);
  }, [fetchConversations, setSelectedBuyerId]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || sending || !selectedBuyerId) return;

    try {
      setSending(true);
      await sendMessage(message.trim(), selectedBuyerId);
      setMessage('');
      // Force recreate input field to ensure focus
      setInputKey(prev => prev + 1);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  }, [message, sending, selectedBuyerId, sendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleInputChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);

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

  const formatLastMessageTime = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return formatDate(dateString);
    }
  }, [formatDate]);

  // Always use conversations for selection logic
  const filteredConversations = useMemo(() => {
    if (!conversations || !Array.isArray(conversations)) {
      return [];
    }
    return conversations.filter(conv =>
      conv.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.companyName && conv.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [conversations, searchTerm]);

  // Memoized Conversation ListItem
  const ConversationListItem = memo(({ conv, selectedBuyerId, handleSelectConversation, handleDeleteChat }) => (
    <ListItem
      key={String(conv.buyerId)}
      button
      selected={selectedBuyerId === String(conv.buyerId)}
      onClick={e => {
        // Only select if not triggered by the delete button
        if (e.target.closest('[aria-label="delete"]')) return;
        handleSelectConversation(String(conv.buyerId));
      }}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        borderLeft: conv.unreadCount > 0 ? '4px solid #1976d2' : '4px solid transparent',
        backgroundColor: conv.unreadCount > 0 ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
        '&.Mui-selected': {
          bgcolor: '#e0e0e0',
          '&:hover': { bgcolor: '#d3d3d3' }
        },
        '&:hover': { bgcolor: '#e0e0e0' }
      }}
    >
      <ListItemAvatar>
        <Badge
          badgeContent={conv.unreadCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.6rem',
              height: 16,
              minWidth: 16,
              backgroundColor: conv.unreadCount > 0 ? '#f44336' : 'transparent'
            }
          }}
        >
          <Avatar>
            <PersonIcon />
          </Avatar>
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={conv.buyerName}
        secondary={
          <React.Fragment>
            <Typography component="span" variant="caption" color="text.secondary" display="block">
              {conv.companyName || conv.buyerEmail}
            </Typography>
            <Typography component="span" variant="body2" noWrap sx={{ color: conv.unreadCount > 0 ? 'text.primary' : 'text.secondary', fontWeight: conv.unreadCount > 0 ? 500 : 400 }}>
              {conv.lastMessage || 'No messages yet'}
            </Typography>
          </React.Fragment>
        }
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {conv.lastMessageAt && !isNaN(new Date(conv.lastMessageAt)) && conv.lastMessageAt !== null && conv.lastMessage ? formatLastMessageTime(conv.lastMessageAt) : ''}
        </Typography>
        {/* Removed duplicate Chip badge for unread count */}
      </Box>
      <IconButton
        edge="end"
        aria-label="delete"
        onClick={e => { e.stopPropagation(); e.preventDefault(); handleDeleteChat(conv.buyerId); }}
        size="small"
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </ListItem>
  ));

  // Memoize the messages rendering to prevent unnecessary re-renders
  const renderedMessages = useMemo(() => {
    if (!messages || !Array.isArray(messages)) {
      return [];
    }
    return messages.map((msg, index) => {
      const isOwnMessage = msg.senderRole === 'admin';
      const showDate = index === 0 || 
        formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);
      return (
        <MessageBubble
          key={msg._id || index}
          msg={msg}
          isOwnMessage={isOwnMessage}
          showDate={showDate}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      );
    });
  }, [messages, formatDate, formatTime]);

  const ChatDrawer = useMemo(() => (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => setIsOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: 600, md: 800, lg: 1000 },
          maxWidth: '100vw',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px 0 0 20px',
          border: '1px solid #e0e0e0',
          backgroundColor: 'rgba(255,255,255,0.98)'
        }
      }}
    >
              <AppBar 
          position="static" 
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white'
          }}
        >
          <Toolbar sx={{ minHeight: '48px !important', py: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
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
                  Buyer Support
                </Typography>
                {/* No subtitle text here */}
              </Box>
            </Box>
          <IconButton
            color="inherit"
            onClick={handleCloseChat}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', minWidth: 0 }}>
        {/* Conversations List */}
        <Box sx={{
          width: 320,
          borderRight: 0,
          background: '#fafbfc',
          boxShadow: '2px 0 8px 0 rgba(60,60,60,0.04)',
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          pb: 2,
          pt: 2,
          pr: 0,
          pl: 0,
        }}>
          <Box sx={{ px: 3, mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<ChatIcon />}
              onClick={handleOpenNewChat}
              sx={{
                borderRadius: 999,
                fontWeight: 700,
                fontSize: '1rem',
                py: 1.2,
                boxShadow: '0 2px 8px 0 rgba(25,118,210,0.08)',
                textTransform: 'none',
                letterSpacing: 0.2,
                mb: 1.5
              }}
            >
              Start New Chat
            </Button>
          </Box>

          {/* Conversations */}
          <List sx={{ flex: 1, overflow: 'auto', px: 1, py: 0 }}>
            {filteredConversations.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">
                  {searchTerm ? 'No conversations found' : 'No conversations yet'}
                </Typography>
              </Box>
            ) : (
              filteredConversations.map((conv) => (
                <ConversationListItem
                  key={String(conv.buyerId)}
                  conv={conv}
                  selectedBuyerId={selectedBuyerId}
                  handleSelectConversation={handleSelectConversation}
                  handleDeleteChat={handleDeleteChat}
                />
              ))
            )}
          </List>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {selectedBuyerId ? (
            !currentChat || String(currentChat.buyerId) !== String(selectedBuyerId) || loading ? (
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    {currentChat?.buyerName ? `Chat with ${currentChat.buyerName}` : ''}
                  </Typography>
                  <Tooltip title="Clear all messages in this chat" arrow>
                    <span>
                      <IconButton
                        color="warning"
                        onClick={handleClearChat}
                        disabled={clearing || messages.length === 0}
                        sx={{
                          bgcolor: '#FFF3E0',
                          color: '#FF9800',
                          borderRadius: '50%',
                          boxShadow: 1,
                          ml: 1,
                          '&:hover': {
                            bgcolor: '#FFE0B2',
                            color: '#F57C00',
                          },
                          width: 40,
                          height: 40
                        }}
                      >
                        <ClearAllIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
                {/* Confirm Clear Dialog */}
                <Dialog open={confirmClearOpen} onClose={cancelClear}>
                  <DialogTitle>Clear Chat History</DialogTitle>
                  <DialogContent>
                    <Typography>
                      Are you sure you want to clear the entire chat history? <br />
                      This will also erase the conversation history for the buyer. This cannot be undone.
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={cancelClear} disabled={clearing}>Cancel</Button>
                    <Button onClick={confirmClear} color="warning" disabled={clearing}>Clear</Button>
                  </DialogActions>
                </Dialog>
                {/* Error Alert */}
                {error && (
                  <Alert severity="error" sx={{ mx: 2, mt: 1 }}>
                    {typeof error === 'string' ? error : (error?.message || 'An error occurred')}
                  </Alert>
                )}
                {/* Messages */}
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: 'auto',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    bgcolor: '#f8f9fa',
                    borderLeft: '1px solid',
                    borderRight: '1px solid',
                    borderColor: 'divider'
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
                        <ChatIcon sx={{ fontSize: 40 }} />
                      </Box>
                      <Typography component="span" variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        Start a conversation
                      </Typography>
                      <Typography component="span" variant="caption" sx={{ opacity: 0.7 }}>
                        Begin chatting with {currentChat?.buyerName}
                      </Typography>
                    </Box>
                  ) : (
                    renderedMessages
                  )}
                  <div ref={messagesEndRef} />
                </Box>
                <Divider />
                {/* Message Input */}
                <Box sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
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
              </>
            )
          ) : (
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">Select a conversation</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  ), [isOpen, searchTerm, filteredConversations, selectedBuyerId, messages.length, renderedMessages, message, sending, error, handleSelectConversation, handleInputChange, handleKeyPress, handleSendMessage, handleCloseChat, handleOpenNewChat, handleDeleteChat, confirmClearOpen, clearing, confirmClear, cancelClear, loading, currentChat, inputKey]);

  // Open chat window and refresh conversations
  const handleOpenChat = useCallback(() => {
    setIsOpen(true);
    fetchConversations();
  }, [fetchConversations]);

  const ChatButton = useMemo(() => {
    // Use real unread conversations count
    const showBadge = unreadConversationsCount > 0, badgeCount = unreadConversationsCount;
    
    return (
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Button
            variant="contained"
            onClick={handleOpenChat}
            startIcon={<SupportIcon />}
            sx={{
              borderRadius: 0,
              px: 3,
              py: 1.5,
              backgroundColor: showBadge ? '#f44336' : '#1976d2',
              color: 'white',
              boxShadow: showBadge ? '0 4px 12px rgba(244, 67, 54, 0.3)' : '0 4px 12px rgba(25, 118, 210, 0.4)',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: showBadge ? '#d32f2f' : '#1565c0',
                boxShadow: showBadge ? '0 6px 16px rgba(244, 67, 54, 0.4)' : '0 6px 16px rgba(25, 118, 210, 0.5)'
              }
            }}
          >
            Customer Support
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
  }, [unreadConversationsCount, handleOpenChat]);

  return (
    <>
      {isOpen && ChatDrawer}
      {!isOpen && ChatButton}
      <Dialog open={newChatOpen} onClose={handleCloseNewChat} maxWidth="xs" fullWidth>
        <DialogTitle>Start New Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search buyers by name or email"
            type="text"
            fullWidth
            value={buyersSearch}
            onChange={e => setBuyersSearch(e.target.value)}
            sx={{ mb: 2 }}
          />
          {buyersLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List>
              {buyersList.filter(b =>
                b.name.toLowerCase().includes(buyersSearch.toLowerCase()) ||
                b.email.toLowerCase().includes(buyersSearch.toLowerCase())
              ).map(buyer => (
                <ListItem button key={buyer._id} onClick={() => handleStartChat(buyer._id)}>
                  <ListItemAvatar>
                    <Avatar><PersonIcon /></Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={buyer.name} secondary={buyer.email} />
                </ListItem>
              ))}
              {buyersList.length === 0 && (
                <ListItem>
                  <ListItemText primary="No buyers found" />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewChat}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmDeleteOpen} onClose={cancelDelete}>
        <DialogTitle>Delete Chat</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this chat? This will remove it from your view but not from the buyer's view.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Memoized Message Bubble
const MessageBubble = memo(({ msg, isOwnMessage, showDate, formatDate, formatTime }) => (
  <Box key={msg._id}>
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
));

export default AdminChat; 