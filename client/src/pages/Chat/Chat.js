import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BuyerChat from './BuyerChat';
import AdminChat from './AdminChat';

const Chat = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return user.role === 'admin' ? <AdminChat /> : <BuyerChat />;
};

export default Chat; 