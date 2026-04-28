import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast, Alert, AlertIcon, Box, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useAuth } from './AuthContext';
import { apiClient } from './api/client';
import { createChatConnection } from './api/chatHub';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Értesítések letöltése, ha a felhasználó be van jelentkezve
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Feliratkozás a SignalR hívásokra
  useEffect(() => {
    if (!user) return;
    
    let connection;
    let isMounted = true;

    const startConnection = async () => {
      try {
        connection = createChatConnection();
        
        connection.on('ReceiveNotification', (notification) => {
          if (isMounted) {
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            toast({
              position: 'bottom-right',
              duration: 5000,
              isClosable: true,
              render: ({ onClose }) => (
                <Alert 
                  status="info" 
                  variant="solid" 
                  borderRadius="md" 
                  boxShadow="lg"
                  cursor="pointer" 
                  onClick={() => {
                    onClose();
                    // Navigate based on type
                    if (notification.relatedEntityType === 'Message' || notification.type === 'Message') {
                      navigate('/chats');
                    } else if (notification.relatedEntityType === 'PropertyAlert' || notification.type === 'PropertyAlert') {
                      navigate(`/property/${notification.relatedEntityId || notification.linkId}`);
                    }
                  }}
                >
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>{notification.title || "Új értesítés"}</AlertTitle>
                    <AlertDescription display="block">
                      {notification.message}
                    </AlertDescription>
                  </Box>
                </Alert>
              ),
            });
          }
        });

        await connection.start();
        console.log('Notification SignalR Connected');
      } catch (err) {
        console.error('SignalR Connection Error: ', err);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      if (connection) {
        connection.stop();
      }
    };
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await apiClient.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error loading notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, refreshNotifications: loadNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
