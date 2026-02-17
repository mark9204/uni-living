import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Flex,
  Badge,
  useColorModeValue,
  Spinner,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { apiClient } from './api/client';
import PropertyChatModal from './PropertyChatModal';

const ChatsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Color tokens
  const pageBg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (user) {
      loadUserChats();
    }
  }, [user]);

  const loadUserChats = async () => {
    try {
      setLoading(true);
      // Get user's chat rooms
      const rooms = await apiClient.getUserChatRooms();
      console.log('📱 User chat rooms raw data:', rooms);
      
      // If we have rooms, try to enrich them with property data
      if (rooms && rooms.length > 0) {
        const enrichedRooms = await Promise.all(
          rooms.map(async (room) => {
            try {
              // Try to get property details if we don't have the title
              if (!room.propertyTitle && !room.property?.title && room.propertyId) {
                const property = await apiClient.getProperty(room.propertyId);
                console.log(`📱 Enriched property data for room ${room.id}:`, property);
                return {
                  ...room,
                  propertyTitle: property.title,
                  property: property
                };
              }
              return room;
            } catch (error) {
              console.log(`📱 Could not enrich room ${room.id} with property data:`, error.message);
              return room; // Return original room if enrichment fails
            }
          })
        );
        console.log('📱 Enriched chat rooms:', enrichedRooms);
        setChatRooms(enrichedRooms);
      } else {
        setChatRooms(rooms || []);
      }
    } catch (error) {
      console.error('❌ Failed to load chat rooms:', error);
      toast({
        title: 'Hiba',
        description: 'A beszélgetések betöltése sikertelen.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const openPropertyChat = (chatRoom) => {
    console.log('📱 Opening chat room modal:', chatRoom.id);
    setSelectedChatRoom(chatRoom);
    setIsChatModalOpen(true);
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Most';
    } else if (diffHours < 24) {
      return `${diffHours} óra`;
    } else if (diffDays < 7) {
      return `${diffDays} nap`;
    } else {
      return date.toLocaleDateString('hu-HU');
    }
  };

  const getOtherUserName = (chatRoom) => {
    if (!user) return 'Ismeretlen';
    
    // Try multiple possible field names for user names
    if (user.role === 'Tenant') {
      // Show landlord name - try different possible field names
      return chatRoom.landlordName || 
             chatRoom.landlord?.name || 
             chatRoom.landlord?.firstName || 
             chatRoom.ownerName || 
             chatRoom.owner?.name || 
             `Tulajdonos #${chatRoom.landlordId || chatRoom.ownerId || ''}`;
    } else {
      // Show tenant name - try different possible field names  
      return chatRoom.tenantName || 
             chatRoom.tenant?.name || 
             chatRoom.tenant?.firstName || 
             chatRoom.renterName ||
             `Bérlő #${chatRoom.tenantId || ''}`;
    }
  };

  const getPropertyTitle = (chatRoom) => {
    // Try multiple possible field names for property title
    return chatRoom.propertyTitle || 
           chatRoom.property?.title ||
           chatRoom.property?.name ||
           chatRoom.propertyName ||
           `Lakás #${chatRoom.propertyId}`;
  };

  const getLastMessage = (chatRoom) => {
    if (!chatRoom.messages || chatRoom.messages.length === 0) {
      return 'Még nem volt üzenet...';
    }
    const lastMsg = chatRoom.messages[chatRoom.messages.length - 1];
    return lastMsg.message || 'Üzenet';
  };

  if (!user) {
    return (
      <Box minH="100vh" bg={pageBg} pt={8}>
        <Container maxW="container.lg">
          <VStack spacing={8} align="center" py={12}>
            <Text fontSize="lg" color={secondaryTextColor}>
              Bejelentkezés szükséges a beszélgetések megtekintéséhez.
            </Text>
            <Button 
              colorScheme="yellow" 
              onClick={() => navigate('/login')}
            >
              Bejelentkezés
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} pt={8} pb={12} overflowY="auto">
      <Container maxW="container.lg">
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Heading size="lg" color={textColor}>
              Beszélgetések
            </Heading>
            {chatRooms.length > 0 && (
              <Badge colorScheme="yellow" variant="subtle">
                {chatRooms.length} beszélgetés
              </Badge>
            )}
          </HStack>

          {loading ? (
            <Flex justify="center" py={12}>
              <Spinner size="lg" color="yellow.500" />
            </Flex>
          ) : chatRooms.length === 0 ? (
            <Box
              bg={cardBg}
              borderRadius="xl"
              p={12}
              textAlign="center"
              border="1px"
              borderColor={borderColor}
            >
              <VStack spacing={4}>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  Még nincsenek beszélgetései
                </Text>
                <Text color={secondaryTextColor}>
                  {user.role === 'Tenant' 
                    ? 'Vegye fel a kapcsolatot egy tulajdonossal egy lakás oldalán!' 
                    : 'Várjon, amíg valaki felveszi Önnel a kapcsolatot.'
                  }
                </Text>
                {user.role === 'Tenant' && (
                  <Button 
                    colorScheme="yellow" 
                    onClick={() => navigate('/properties')}
                    mt={4}
                  >
                    Lakások böngészése
                  </Button>
                )}
              </VStack>
            </Box>
          ) : (
            <VStack spacing={3} align="stretch">
              {chatRooms.map((chatRoom) => (
                <Box
                  key={chatRoom.id}
                  bg={cardBg}
                  borderRadius="lg"
                  p={4}
                  border="1px"
                  borderColor={borderColor}
                  cursor="pointer"
                  _hover={{
                    shadow: 'md',
                    borderColor: 'yellow.300',
                    transform: 'translateY(-1px)',
                  }}
                  transition="all 0.2s"
                  onClick={() => openPropertyChat(chatRoom)}
                >
                  <HStack spacing={4} align="start">
                    <Avatar 
                      name={getOtherUserName(chatRoom)}
                      size="md"
                      bg="yellow.100"
                      color="yellow.800"
                    />
                    <VStack spacing={1} align="start" flex="1">
                      <HStack justify="space-between" width="100%">
                        <Text fontWeight="bold" color={textColor}>
                          {(() => {
                            const userName = getOtherUserName(chatRoom);
                            console.log(`📱 Chat room ${chatRoom.id} user name:`, userName, 'Raw chat room:', chatRoom);
                            return userName;
                          })()}
                        </Text>
                        <Text fontSize="sm" color={secondaryTextColor}>
                          {formatLastMessageTime(chatRoom.lastMessageAt)}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="yellow.600" fontWeight="medium">
                        📍 {(() => {
                          const propertyTitle = getPropertyTitle(chatRoom);
                          console.log(`📱 Chat room ${chatRoom.id} property title:`, propertyTitle);
                          return propertyTitle;
                        })()}
                      </Text>
                      <Text 
                        fontSize="sm" 
                        color={secondaryTextColor}
                        noOfLines={2}
                        mt={1}
                      >
                        {getLastMessage(chatRoom)}
                      </Text>
                    </VStack>
                    {chatRoom.hasUnreadMessages && (
                      <Badge colorScheme="red" borderRadius="full">
                        Új
                      </Badge>
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </Container>
      
      {/* Property Chat Modal */}
      {selectedChatRoom && (
        <PropertyChatModal
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedChatRoom(null);
          }}
          property={{
            id: selectedChatRoom.propertyId,
            title: selectedChatRoom.propertyTitle || selectedChatRoom.property?.title || `Ingatlan #${selectedChatRoom.propertyId}`
          }}
          existingChatRoom={selectedChatRoom}
        />
      )}
    </Box>
  );
};

export default ChatsPage;