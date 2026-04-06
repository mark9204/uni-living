import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Box,
  Text,
  Badge,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FiMessageSquare, FiHome } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from './NotificationContext';

const NotificationDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotifications();

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.relatedEntityType === 'Message') {
      navigate('/chats');
    } else if (notification.relatedEntityType === 'PropertyAlert') {
      navigate(`/property/${notification.relatedEntityId}`);
    } else if (notification.type === 'PropertyAlert' || notification.type === 'Message') {
      // Dummy check fallback incase old props are there
      if (notification.type === 'Message') navigate('/chats');
      else navigate(`/property/${notification.linkId}`);
    }
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">Értesítések</DrawerHeader>

        <DrawerBody p={0}>
          <VStack align="stretch" spacing={0}>
            {!notifications || notifications.length === 0 ? (
              <Box p={6} textAlign="center">
                <Text color="gray.500">Nincsenek új értesítéseid.</Text>
              </Box>
            ) : (
              notifications.map((notif) => (
                <Box
                  key={notif.id}
                  p={4}
                  borderBottomWidth="1px"
                  bg={notif.isRead ? 'transparent' : 'yellow.50'}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handleNotificationClick(notif)}
                  transition="background 0.2s"
                >
                  <HStack spacing={3} align="start">
                    <Box pt={1}>
                      <Icon
                        as={notif.relatedEntityType === 'Message' || notif.type === 'Message' ? FiMessageSquare : FiHome}
                        color={notif.relatedEntityType === 'Message' || notif.type === 'Message' ? 'blue.400' : 'yellow.500'}
                        boxSize={5}
                      />
                    </Box>
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack justify="space-between" w="full">
                        <Text fontWeight="bold" fontSize="sm">
                          {notif.title}
                        </Text>
                        {!notif.isRead && <Badge colorScheme="red">ÚJ</Badge>}
                      </HStack>
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {notif.message}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {new Date(notif.createdAt || notif.timestamp).toLocaleString('hu-HU', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default NotificationDrawer;
