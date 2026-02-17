import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  useColorModeValue,
  Slide,
  Badge,
  Spinner,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { ChatIcon, CloseIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useAuth } from './AuthContext';
import {
  createChatConnection,
  joinChatRoom,
  sendMessage as hubSendMessage,
  markChatRoomAsRead,
  userTyping as hubUserTyping,
  userStoppedTyping as hubUserStoppedTyping,
} from './api/chatHub';
import { apiClient } from './api/client';

const TYPING_DEBOUNCE_MS = 1500;

function ChatOverlay() {
  const { user } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [connection, setConnection] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [chatRoomId, setChatRoomId] = useState(null); // Start with null, will be set dynamically
  const [currentRoom, setCurrentRoom] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Color tokens - all hooks called unconditionally
  const overlayBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('yellow.500', 'yellow.600');
  const myMsgBg = useColorModeValue('yellow.100', 'yellow.700');
  const otherMsgBg = useColorModeValue('gray.100', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // ---- Connection lifecycle ----
  useEffect(() => {
    if (!user || !chatRoomId) return; // must be logged in and have a room selected

    const conn = createChatConnection();

    conn.on('ReceiveMessage', (msg) => {
      console.log('📨 ReceiveMessage event:', msg);
      console.log('🧑 Current user:', user);
      
      // Handle different message formats from backend
      const messageText = typeof msg === 'string' ? msg : (msg.content || msg.message || msg.text || 'Unknown message');
      const senderName = msg.senderName || msg.sender || msg.user || msg.from || 'Unknown';
      const messageId = msg.id || msg.messageId || Date.now();
      const timestamp = msg.sentAt || msg.timestamp || msg.createdAt || new Date().toISOString();
      
      // Check if this message is from the current user
      const isOwnMessage = senderName === user?.name || 
                          msg.senderId === user?.id ||
                          msg.userId === user?.id ||
                          msg.isFromCurrentUser === true;
      
      console.log('🤔 Is own message?', isOwnMessage);
      console.log('📝 Message details:', { messageText, senderName, messageId, timestamp });
      
      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          sender: senderName,
          text: messageText,
          isOwn: isOwnMessage,
          timestamp: timestamp,
        },
      ]);
      if (!isOpen) setUnreadCount((c) => c + 1);
    });

    conn.on('MessageRead', (messageId) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
      );
    });

    conn.on('UserTyping', (userId) => {
      setTypingUsers((prev) => new Set(prev).add(userId));
    });

    conn.on('UserStoppedTyping', (userId) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    conn.onclose(() => {
      console.log('🔌 SignalR connection closed');
      setConnected(false);
    });
    conn.onreconnecting(() => {
      console.log('🔄 SignalR reconnecting...');
      setConnected(false);
    });
    conn.onreconnected(() => {
      console.log('✅ SignalR reconnected');
      setConnected(true);
    });

    console.log('🚀 Starting SignalR connection...');
    conn
      .start()
      .then(() => {
        console.log('✅ SignalR connected successfully');
        console.log('👤 User info:', user);
        setConnected(true);
        console.log(`🏠 Attempting to join chat room ${chatRoomId}...`);
        return joinChatRoom(conn, chatRoomId);
      })
      .then(() => {
        console.log(`✅ Joined chat room ${chatRoomId}`);
        // Load existing messages for this room
        return loadChatMessages(chatRoomId);
      })
      .catch((err) => {
        console.error('❌ Connection or room join failed:', err);
        // Set connected to true so chat functionality works even if room join fails
        setConnected(true);
      });

    setConnection(conn);

    return () => {
      conn.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, chatRoomId]);

  // ---- Listen for global open-chat event ----
  useEffect(() => {
    const handler = (event) => {
      console.log('🔔 Received open-chat event:', event.detail);
      if (event.detail?.roomId) {
        // Open specific room
        setChatRoomId(event.detail.roomId);
        if (event.detail.roomInfo) {
          setCurrentRoom(event.detail.roomInfo);
        }
      } else if (event.detail?.propertyId) {
        // Create/get room for property
        handleOpenPropertyChat(event.detail.propertyId);
      }
      setIsOpen(true);
    };
    window.addEventListener('open-chat', handler);
    return () => window.removeEventListener('open-chat', handler);
  }, []);

  // ---- Load user's chat rooms when overlay opens ----
  useEffect(() => {
    if (isOpen && user && !chatRoomId) {
      loadUserChatRooms();
    }
  }, [isOpen, user, chatRoomId]);

  const loadUserChatRooms = async () => {
    try {
      setLoadingRooms(true);
      const rooms = await apiClient.getUserChatRooms();
      console.log('📱 User chat rooms:', rooms);
      setAvailableRooms(rooms || []);
      
      // Auto-select the first room if available
      if (rooms && rooms.length > 0) {
        const firstRoom = rooms[0];
        setChatRoomId(firstRoom.id);
        setCurrentRoom(firstRoom);
      }
    } catch (error) {
      console.error('❌ Failed to load user chat rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadChatMessages = async (roomId) => {
    try {
      const existingMessages = await apiClient.getChatMessages(roomId, 50);
      console.log('📱 Loaded existing messages:', existingMessages);
      
      const formattedMessages = existingMessages.map(msg => ({
        id: msg.id,
        sender: msg.senderName || msg.sender || 'Unknown',
        text: msg.content || msg.message || msg.text || '',
        isOwn: msg.senderId === user?.id || msg.senderName === user?.name,
        timestamp: msg.sentAt || msg.timestamp || msg.createdAt
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('❌ Failed to load chat messages:', error);
      setMessages([]); // Clear messages on error
    }
  };

  const handleOpenPropertyChat = async (propertyId) => {
    try {
      console.log('🏠 Opening chat for property:', propertyId);
      const roomData = await apiClient.createOrGetChatRoom(propertyId);
      console.log('🏠 Got room data:', roomData);
      setChatRoomId(roomData.id);
      setCurrentRoom(roomData);
    } catch (error) {
      console.error('❌ Failed to create/get chat room for property:', error);
      toast({
        title: 'Hiba',
        description: 'A chat szoba nem indítható el.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // ---- Auto-scroll ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---- Mark as read when overlay opens ----
  useEffect(() => {
    if (isOpen && connection && connected && chatRoomId) {
      markChatRoomAsRead(connection, chatRoomId).catch(() => {});
      setUnreadCount(0);
    }
  }, [isOpen, connection, connected, chatRoomId]);

  // ---- Typing indicator with debounce ----
  const handleTyping = useCallback(() => {
    if (!connection || !connected || !chatRoomId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      hubUserTyping(connection, chatRoomId).catch(() => {});
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      hubUserStoppedTyping(connection, chatRoomId).catch(() => {});
    }, TYPING_DEBOUNCE_MS);
  }, [connection, connected, chatRoomId]);

  // ---- Send ----
  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || !chatRoomId) return;

    console.log('📤 Sending message:', text);

    // Add optimistic local message so user sees their own message immediately
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: user?.name ?? 'Me',
        text,
        isOwn: true,
        timestamp: new Date().toISOString(),
      },
    ]);
    setInputValue('');

    // Stop typing indicator
    clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current && connection && connected) {
      isTypingRef.current = false;
      hubUserStoppedTyping(connection, chatRoomId).catch(() => {});
    }

    let sentViaSignalR = false;
    if (connection && connected) {
      try {
        await hubSendMessage(connection, chatRoomId, text);
        sentViaSignalR = true;
        console.log('✅ Message sent via SignalR');
      } catch (err) {
        console.error('❌ SignalR send failed, falling back to REST:', err);
      }
    }

    if (!sentViaSignalR) {
      try {
        await apiClient.sendChatMessage(chatRoomId, text);
        console.log('✅ Message sent via REST');
      } catch (err) {
        console.error('❌ REST send failed:', err);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---- Don't render if not logged in ----
  if (!user) return null;

  return (
    <>
      {/* Floating toggle button */}
      {!isOpen && (
        <Tooltip label="Chat" placement="left">
          <IconButton
            icon={<ChatIcon />}
            colorScheme="yellow"
            size="lg"
            borderRadius="full"
            position="fixed"
            bottom="24px"
            right="24px"
            zIndex={1500}
            onClick={() => setIsOpen(true)}
            boxShadow="lg"
            aria-label="Open chat"
          >
            {unreadCount > 0 && (
              <Badge
                colorScheme="red"
                borderRadius="full"
                position="absolute"
                top="-4px"
                right="-4px"
                fontSize="xs"
                px={2}
              >
                {unreadCount}
              </Badge>
            )}
          </IconButton>
        </Tooltip>
      )}

      {/* Chat panel */}
      <Slide direction="right" in={isOpen} style={{ zIndex: 1400 }}>
        <Flex
          position="fixed"
          right="0"
          top="0"
          bottom="0"
          width={{ base: '100%', md: '380px' }}
          direction="column"
          bg={overlayBg}
          boxShadow="2xl"
          borderLeftWidth="1px"
          borderColor={borderColor}
        >
          {/* Header */}
          <Flex
            bg={headerBg}
            color="white"
            px={4}
            py={3}
            align="center"
            justify="space-between"
            flexShrink={0}
          >
            <HStack>
              <ChatIcon />
              <Text fontWeight="bold" fontSize="lg">
                {currentRoom ? (currentRoom.propertyTitle || currentRoom.property?.title || `Szoba #${currentRoom.id}`) : 'Chat'}
              </Text>
              {!connected && <Spinner size="xs" ml={2} />}
            </HStack>
            <IconButton
              icon={<CloseIcon />}
              size="sm"
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.300' }}
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            />
          </Flex>

          {/* Messages area */}
          <VStack
            flex="1"
            overflowY="auto"
            px={4}
            py={3}
            spacing={3}
            align="stretch"
          >
            {!chatRoomId ? (
              <VStack spacing={4} mt={8}>
                {loadingRooms ? (
                  <>
                    <Spinner />
                    <Text color="gray.400" textAlign="center" fontSize="sm">
                      Beszélgetések betöltése...
                    </Text>
                  </>
                ) : availableRooms.length === 0 ? (
                  <Text color="gray.400" textAlign="center" fontSize="sm">
                    Nincsenek aktív beszélgetések.
                    <br />Ingatlan oldalon indíthat újat!
                  </Text>
                ) : (
                  <>
                    <Text color="gray.400" textAlign="center" fontSize="sm">
                      Válasszon beszélgetést:
                    </Text>
                    {availableRooms.map((room) => (
                      <Box
                        key={room.id}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        cursor="pointer"
                        _hover={{ bg: inputBg }}
                        onClick={() => {
                          setChatRoomId(room.id);
                          setCurrentRoom(room);
                        }}
                      >
                        <Text fontWeight="bold" fontSize="sm">
                          {room.propertyTitle || room.property?.title || `Szoba #${room.id}`}
                        </Text>
                        {room.lastMessage && (
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            {room.lastMessage.content || room.lastMessage.text}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </>
                )}
              </VStack>
            ) : messages.length === 0 ? (
              <Text
                color="gray.400"
                textAlign="center"
                mt={8}
                fontSize="sm"
              >
                Nincsenek üzenetek. Írj elsőként!
              </Text>
            ) : null}
            {chatRoomId && messages.map((msg) => (
              <Flex
                key={msg.id}
                justify={msg.isOwn ? 'flex-end' : 'flex-start'}
              >
                <Box
                  bg={msg.isOwn ? myMsgBg : otherMsgBg}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  maxW="80%"
                >
                  {!msg.isOwn && (
                    <Text fontSize="xs" fontWeight="bold" mb={1}>
                      {msg.sender}
                    </Text>
                  )}
                  <Text fontSize="sm">{msg.text}</Text>
                  <Text fontSize="2xs" color="gray.500" textAlign="right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {msg.isOwn && msg.read && ' ✓✓'}
                  </Text>
                </Box>
              </Flex>
            ))}
            <div ref={messagesEndRef} />
          </VStack>

          {/* Typing indicator */}
          {typingUsers.size > 0 && (
            <Text fontSize="xs" color="gray.500" px={4} pb={1}>
              {typingUsers.size === 1
                ? 'Valaki éppen ír…'
                : `${typingUsers.size} felhasználó ír…`}
            </Text>
          )}

          {/* Input area */}
          <HStack px={4} py={3} borderTopWidth="1px" flexShrink={0}>
            <Input
              placeholder={chatRoomId ? "Üzenet írása…" : "Válassz beszélgetést fent"}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              bg={inputBg}
              size="md"
              borderRadius="full"
              isDisabled={!chatRoomId}
            />
            <IconButton
              icon={<ArrowForwardIcon />}
              colorScheme="yellow"
              borderRadius="full"
              onClick={handleSend}
              isDisabled={!inputValue.trim() || !connected || !chatRoomId}
              aria-label="Send message"
            />
          </HStack>
        </Flex>
      </Slide>
    </>
  );
}

export default ChatOverlay;
