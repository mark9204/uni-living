import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Box,
  Flex,
  Avatar,
  useColorModeValue,
  Spinner,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { useAuth } from './AuthContext';
import { apiClient } from './api/client';
import {
  createChatConnection,
  joinChatRoom,
  sendMessage as hubSendMessage,
} from './api/chatHub';

const PropertyChatModal = ({ isOpen, onClose, property, existingChatRoom }) => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [connection, setConnection] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const connectionRef = useRef(null);

  // Color tokens
  const modalBg = useColorModeValue('white', 'gray.800');
  const myMsgBg = useColorModeValue('yellow.100', 'yellow.700');
  const otherMsgBg = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Initialize chat room when modal opens
  useEffect(() => {
    if (isOpen && user && (existingChatRoom || (property && property.id))) {
      initializeChatRoom();
    }
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
      setConnection(null);
      setConnected(false);
      // Reset state when modal closes
      if (!isOpen) {
        setMessages([]);
        setChatRoom(null);
        setLoading(false);
      }
    };
  }, [isOpen, property?.id, existingChatRoom?.id, user]);

  const mapMessage = (msg) => {
    const isOwn = msg.senderId === user?.id || msg.senderId === Number(user?.id);
    return {
      id: msg.id,
      sender: msg.senderName || msg.sender || 'Unknown',
      text: msg.message || msg.content || msg.text || '',
      isOwn,
      timestamp: msg.createdAt || msg.sentAt || msg.timestamp,
    };
  };

  const loadExistingMessages = async (roomId) => {
    const existingMessages = await apiClient.getChatMessages(roomId, 50);
    console.log('📱 Loaded existing messages:', existingMessages);
    setMessages((existingMessages || []).map(mapMessage));
  };

  const initializeChatRoom = async () => {
    try {
      setLoading(true);

      if (connectionRef.current) {
        await connectionRef.current.stop();
        connectionRef.current = null;
      }

      let roomData;

      if (existingChatRoom) {
        // Use existing chat room from ChatsPage
        console.log('🏠 Using existing chat room:', existingChatRoom);
        roomData = existingChatRoom;
        setChatRoom(roomData);

        try {
          await loadExistingMessages(roomData.id);
        } catch (messageError) {
          console.error('❌ Failed to load existing messages:', messageError);
          setMessages([]);
        }
      } else {
        // Create or get existing chat room for this property (original behavior)
        console.log('🏠 Property object for chat:', property);
        roomData = await apiClient.createOrGetChatRoom(property.id);
        console.log('🏠 Chat room data:', roomData);
        setChatRoom(roomData);

        try {
          await loadExistingMessages(roomData.id);
        } catch (messageError) {
          console.error('❌ Failed to load existing messages:', messageError);
          setMessages([]);
        }
      }

      // Set up SignalR connection
      const conn = createChatConnection();

      conn.on('ReceiveMessage', (msg) => {
        console.log('📨 Property chat message received:', msg);

        const messageId = msg.id || msg.messageId;
        const isOwnMessage = msg.senderId === user?.id || msg.senderId === Number(user?.id);

        setMessages((prev) => {
          if (messageId && prev.some((m) => m.id === messageId)) {
            return prev;
          }
          return [
            ...prev,
            {
              id: messageId || Date.now(),
              sender: msg.senderName || msg.sender || msg.user || msg.from || 'Unknown',
              text: msg.message || msg.content || msg.text || 'Unknown message',
              isOwn: isOwnMessage,
              timestamp: msg.createdAt || msg.sentAt || msg.timestamp || new Date().toISOString(),
            },
          ];
        });
      });

      conn.onclose(() => {
        console.log('🔌 Property chat connection closed');
        setConnected(false);
      });
      
      conn.onreconnecting(() => {
        console.log('🔄 Property chat reconnecting...');
        setConnected(false);
      });
      
      conn.onreconnected(() => {
        console.log('✅ Property chat reconnected');
        setConnected(true);
      });

      console.log('🚀 Starting property chat connection...');
      try {
        await conn.start();
        console.log('✅ Property chat connected successfully');
        setConnected(true);
        
        // Join the specific chat room
        console.log(`🏠 Joining chat room ${roomData.id}...`);
        await joinChatRoom(conn, roomData.id);
        console.log(`✅ Joined chat room ${roomData.id}`);
        
        connectionRef.current = conn;
        setConnection(conn);
      } catch (signalRError) {
        console.error('❌ SignalR connection failed:', signalRError);
        setConnected(false);
        setConnection(null);
        throw new Error('SignalR kapcsolat nem sikerült. Valós idejű chat nem elérhető.');
      }
    } catch (error) {
      console.error('❌ Failed to initialize chat room:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        property: property
      });
      toast({
        title: 'Hiba',
        description: `A chat szoba nem indítható el: ${error.message}`,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatRoom) return;

    try {
      // Send ONLY via SignalR (no REST API for messages)
      if (connection && connected) {
        await hubSendMessage(connection, chatRoom.id, inputValue.trim());
        console.log('📤 Message sent via SignalR:', inputValue.trim());
      } else {
        // If SignalR not connected, show error
        throw new Error('Chat kapcsolat nem aktív. Próbálja újra.');
      }
      
      setInputValue('');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast({
        title: 'Hiba',
        description: `Az üzenet küldése sikertelen: ${error.message}`,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('hu-HU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent bg={modalBg} maxH="80vh">
        <ModalHeader borderBottomWidth="1px">
          <VStack align="start" spacing={1}>
            <Text>Beszélgetés a tulajdonossal</Text>
            <Text fontSize="sm" color="gray.500">
              {existingChatRoom ? (
                existingChatRoom.propertyTitle || 
                existingChatRoom.property?.title || 
                `Ingatlan #${existingChatRoom.propertyId}`
              ) : (
                property?.title
              )}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0} display="flex" flexDirection="column" height="60vh">
          {loading ? (
            <Flex align="center" justify="center" flex="1">
              <Spinner size="lg" color="yellow.500" />
            </Flex>
          ) : (
            <>
              {/* Messages Area */}
              <Box 
                flex="1" 
                overflowY="auto" 
                p={4}
                css={{
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#CBD5E0',
                    borderRadius: '3px',
                  },
                }}
              >
                <VStack spacing={3} align="stretch">
                  {messages.length === 0 ? (
                    <Box textAlign="center" py={8} color="gray.500">
                      <Text>Még nincs üzenet. Írjon egy üzenetet a tulajdonosnak!</Text>
                    </Box>
                  ) : (
                    messages.map((message) => (
                      <Flex
                        key={message.id}
                        justify={message.isOwn ? 'flex-end' : 'flex-start'}
                      >
                        <Box
                          maxW="70%"
                          bg={message.isOwn ? myMsgBg : otherMsgBg}
                          px={3}
                          py={2}
                          borderRadius="lg"
                          borderBottomLeftRadius={message.isOwn ? 'lg' : 'sm'}
                          borderBottomRightRadius={message.isOwn ? 'sm' : 'lg'}
                        >
                          <HStack spacing={2} mb={1} justify="space-between">
                            <Text fontSize="xs" fontWeight="bold">
                              {message.isOwn ? 'Te' : message.sender}
                            </Text>
                            {message.isOwn && (
                              <Badge size="sm" colorScheme="yellow">
                                Te
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm">{message.text}</Text>
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            {formatTimestamp(message.timestamp)}
                          </Text>
                        </Box>
                      </Flex>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </VStack>
              </Box>

              {/* Input Area */}
              <Box p={4} borderTopWidth="1px">
                <HStack spacing={2}>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={connected ? "Írjon üzenetet..." : "Chat kapcsolat betöltése..."}
                    bg={inputBg}
                    border="none"
                    _focus={{ boxShadow: 'none' }}
                    isDisabled={!connected}
                  />
                  <IconButton
                    icon={<ArrowForwardIcon />}
                    onClick={handleSendMessage}
                    colorScheme="yellow"
                    isDisabled={!inputValue.trim() || !connected || !chatRoom}
                    aria-label="Üzenet küldése"
                  />
                </HStack>
                {!connected && (
                  <Text fontSize="xs" color="red.500" mt={2}>
                    Chat kapcsolat szükséges az üzenetek küldéséhez...
                  </Text>
                )}
                {connected && (
                  <Text fontSize="xs" color="green.500" mt={2}>
                    ✓ Valós idejű chat aktív
                  </Text>
                )}
              </Box>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PropertyChatModal;