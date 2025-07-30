import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadConversationsCount, setUnreadConversationsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);
  const lastFetchRef = useRef(0);
  const isInitializedRef = useRef(false);
  const previousConversationIdsRef = useRef([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);
  // Track the latest requested buyerId to prevent race conditions
  const latestRequestRef = useRef(null);

  // Cleanup function for logout
  const cleanup = useCallback(() => {
    // Stop polling immediately
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    
    // Reset all state
    setConversations([]);
    setCurrentChat(null);
    setMessages([]);
    setUnreadCount(0);
    setUnreadConversationsCount(0);
    setLoading(false);
    setError(null);
    isInitializedRef.current = false;
  }, []);

  // Fetch conversations (admin only)
  const fetchConversations = useCallback(async () => {
    if (user?.role !== 'admin') return;
    
    try {
      setError(null);
      const response = await axios.get('/api/chat/conversations');
      setConversations(response.data.conversations);
      // Count conversations with unread messages for admin
      const unreadCount = response.data.conversations.filter(c => c.hasUnread).length;
      setUnreadConversationsCount(unreadCount);
      // --- New logic: Detect new conversations ---
      const prevIds = previousConversationIdsRef.current;
      const newIds = response.data.conversations.map(c => String(c.buyerId));
      const newConvoAppeared = newIds.some(id => !prevIds.includes(id));
      if (newConvoAppeared) {
        // Optionally, you could trigger a toast or sound here
        // For now, just update the ref
        previousConversationIdsRef.current = newIds;
      } else {
        previousConversationIdsRef.current = newIds;
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    }
  }, [user?.role]);

  // Fetch buyer's chat
  const fetchMyChat = useCallback(async () => {
    if (user?.role !== 'buyer') return;
    
    try {
      setError(null);
      const response = await axios.get('/api/chat/my-chat');
      setCurrentChat(response.data.chat);
      setMessages(response.data.chat.messages);
      setUnreadCount(response.data.chat.unreadCount);
    } catch (error) {
      console.error('Error fetching chat:', error);
      setError('Failed to load chat');
    }
  }, [user?.role]);

  // Fetch specific conversation (admin only)
  const fetchConversation = useCallback(async (buyerId) => {
    if (user?.role !== 'admin') return;
    console.log("Fetching conversation for", buyerId);
    latestRequestRef.current = buyerId;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/chat/conversation/${buyerId}`);
      // Only update state if this is the latest request
      if (latestRequestRef.current === buyerId) {
        setCurrentChat(response.data.chat);
        setMessages(response.data.chat.messages);
        setUnreadCount(response.data.chat.unreadCount);
        console.log("Set currentChat:", response.data.chat);
        console.log("Set messages:", response.data.chat.messages);
      }
    } catch (error) {
      if (latestRequestRef.current === buyerId) {
        console.error('Error fetching conversation:', error);
        setError('Failed to load conversation');
      }
    } finally {
      if (latestRequestRef.current === buyerId) {
        setLoading(false);
        console.log("Done loading for", buyerId);
      }
    }
  }, [user?.role]);

  // Send message
  const sendMessage = useCallback(async (content, buyerId = null) => {
    if (!content.trim()) return;
    
    try {
      setError(null);
      const payload = { content: content.trim() };
      if (user?.role === 'admin' && buyerId) {
        payload.buyerId = buyerId;
      }

      const response = await axios.post('/api/chat/send-message', payload);
      
      // Add new message to current messages
      setMessages(prev => [...prev, response.data.message]);
      
      // Update conversations list for admin
      if (user?.role === 'admin') {
        await fetchConversations();
      }
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      throw error;
    }
  }, [user?.role, fetchConversations]);

  // Mark messages as read
  const markAsRead = useCallback(async (chatId) => {
    if (!chatId) return;
    
    try {
      await axios.put('/api/chat/mark-read', { chatId });
      setUnreadCount(0);
      // Refresh conversations to update unreadConversationsCount
      if (user?.role === 'admin') {
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user?.role, fetchConversations]);

  // Get unread count - with error handling
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get('/api/chat/unread-count');
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      // Silently handle unread count errors to avoid console spam
      console.debug('Unread count fetch failed:', error.message);
    }
  }, []);

  // Optimized polling function
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Only poll if user is authenticated
    if (!user) return;

    // Initial fetch only once
    if (!isInitializedRef.current) {
      if (user.role === 'admin') {
        fetchConversations();
      } else {
        fetchMyChat();
      }
      isInitializedRef.current = true;
    }

    // Helper to check if tab is focused
    const isTabFocused = () => typeof document !== 'undefined' && document.visibilityState === 'visible';

    // Set up polling with more frequent interval for better notification responsiveness
    pollingRef.current = setInterval(() => {
      if (!isTabFocused()) return; // Pause polling if tab is not focused
      const now = Date.now();
      // Prevent too frequent requests
      if (now - lastFetchRef.current < 10000) return;
      lastFetchRef.current = now;

      if (user.role === 'admin') {
        fetchConversations();
      } else {
        fetchMyChat();
      }
    }, 1000); // Check every second, but only fetch if 10s have passed and tab is focused
  }, [user, fetchConversations, fetchMyChat]);

  // Listen for tab visibility changes to resume polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Immediately fetch when tab regains focus
        if (user?.role === 'admin') fetchConversations();
        else if (user?.role === 'buyer') fetchMyChat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, fetchConversations, fetchMyChat]);

  // Start/stop polling based on user
  useEffect(() => {
    startPolling();
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [startPolling]);

  // On mount, initialize previousConversationIdsRef
  useEffect(() => {
    if (user?.role === 'admin') {
      previousConversationIdsRef.current = conversations.map(c => String(c.buyerId));
    }
  }, [user?.role, conversations]);

  // Clear state when user changes (including logout)
  useEffect(() => {
    if (!user) {
      // User logged out - cleanup immediately
      cleanup();
    } else {
      // User logged in - reset state for new user
      setCurrentChat(null);
      setMessages([]);
      setUnreadCount(0);
      setError(null);
      isInitializedRef.current = false;
    }
  }, [user, cleanup]);

  const deleteChat = useCallback(async (buyerId) => {
    if (user?.role !== 'admin' || !buyerId) return;
    try {
      await axios.delete(`/api/chat/conversation/${buyerId}`);
      await fetchConversations();
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat');
    }
  }, [user?.role, fetchConversations]);

  const value = {
    conversations,
    currentChat,
    messages,
    unreadCount,
    unreadConversationsCount,
    loading,
    error,
    fetchConversations,
    fetchMyChat,
    fetchConversation,
    sendMessage,
    markAsRead,
    fetchUnreadCount,
    cleanup,
    deleteChat,
    setCurrentChat, // expose setter
    setMessages,    // expose setter
    selectedBuyerId,
    setSelectedBuyerId
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 