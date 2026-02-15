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

const TYPING_DEBOUNCE_MS = 1500;

function ChatOverlay() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [connection, setConnection] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [chatRoomId, setChatRoomId] = useState(1); // default room
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Color tokens
  const overlayBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('yellow.500', 'yellow.600');
  const myMsgBg = useColorModeValue('yellow.100', 'yellow.700');
  const otherMsgBg = useColorModeValue('gray.100', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  // ---- Connection lifecycle ----
  useEffect(() => {
    if (!user) return; // must be logged in

    const conn = createChatConnection();

    conn.on('ReceiveMessage', (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id ?? Date.now(),
          sender: msg.senderName ?? msg.senderId ?? 'Unknown',
          text: msg.content ?? msg.message ?? msg,
          isOwn: false,
          timestamp: msg.sentAt ?? new Date().toISOString(),
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

    conn.onclose(() => setConnected(false));
    conn.onreconnecting(() => setConnected(false));
    conn.onreconnected(() => setConnected(true));

    conn
      .start()
      .then(() => {
        setConnected(true);
        return joinChatRoom(conn, chatRoomId);
      })
      .catch((err) => console.error('Chat connection failed:', err));

    setConnection(conn);

    return () => {
      conn.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, chatRoomId]);

  // ---- Listen for global open-chat event ----
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-chat', handler);
    return () => window.removeEventListener('open-chat', handler);
  }, []);

  // ---- Auto-scroll ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---- Mark as read when overlay opens ----
  useEffect(() => {
    if (isOpen && connection && connected) {
      markChatRoomAsRead(connection, chatRoomId).catch(() => {});
      setUnreadCount(0);
    }
  }, [isOpen, connection, connected, chatRoomId]);

  // ---- Typing indicator with debounce ----
  const handleTyping = useCallback(() => {
    if (!connection || !connected) return;

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
    if (!text || !connection || !connected) return;

    // Optimistic local message
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
    if (isTypingRef.current) {
      isTypingRef.current = false;
      hubUserStoppedTyping(connection, chatRoomId).catch(() => {});
    }

    try {
      await hubSendMessage(connection, chatRoomId, text);
    } catch (err) {
      console.error('Failed to send message:', err);
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
          borderColor={useColorModeValue('gray.200', 'gray.600')}
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
                Chat
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
            {messages.length === 0 && (
              <Text
                color="gray.400"
                textAlign="center"
                mt={8}
                fontSize="sm"
              >
                Nincsenek üzenetek. Írj elsőként!
              </Text>
            )}
            {messages.map((msg) => (
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
              placeholder="Üzenet írása…"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              bg={inputBg}
              size="md"
              borderRadius="full"
            />
            <IconButton
              icon={<ArrowForwardIcon />}
              colorScheme="yellow"
              borderRadius="full"
              onClick={handleSend}
              isDisabled={!inputValue.trim() || !connected}
              aria-label="Send message"
            />
          </HStack>
        </Flex>
      </Slide>
    </>
  );
}

export default ChatOverlay;
