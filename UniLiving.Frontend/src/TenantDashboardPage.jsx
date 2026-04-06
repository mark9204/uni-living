import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  VStack,
  Text,
  Button,
  useColorModeValue,
  Flex,
  Spinner
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { apiClient } from './api/client';

export default function TenantDashboardPage() {
  const { user } = useAuth();
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  const [stats, setStats] = useState({ newNotifications: 0, unreadMessages: 0, savedFavorites: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiClient.getTenantStats();
        setStats({
          newNotifications: data.newNotifications,
          unreadMessages: data.unreadMessages,
          savedFavorites: data.savedFavorites
        });
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <Box maxW="7xl" mx="auto" px={4} py={8}>
        <VStack align="stretch" spacing={8}>
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="xl">
              Üdvözlünk, {user?.name || 'Bérlő'}!
            </Heading>
            <Button
              as={RouterLink}
              to="/properties"
              colorScheme="yellow"
              size="md"
            >
              Böngészés a lakások között
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Stat bg={cardBg} p={6} borderRadius="lg" boxShadow="sm">
              <StatLabel fontSize="lg">Új értesítések</StatLabel>
              <StatNumber fontSize="3xl">{isLoading ? <Spinner size="sm" /> : stats.newNotifications}</StatNumber>
              <StatHelpText>A múlt héten feltöltött</StatHelpText>
            </Stat>
            
            <Stat bg={cardBg} p={6} borderRadius="lg" boxShadow="sm">
              <StatLabel fontSize="lg">Olvasatlan üzenetek</StatLabel>
              <StatNumber fontSize="3xl">{isLoading ? <Spinner size="sm" /> : stats.unreadMessages}</StatNumber>
              <StatHelpText>
                <RouterLink to="/chats" style={{ color: 'var(--chakra-colors-yellow-500)' }}>
                  Üzenetek megtekintése
                </RouterLink>
              </StatHelpText>
            </Stat>

            <Stat bg={cardBg} p={6} borderRadius="lg" boxShadow="sm">
              <StatLabel fontSize="lg">Mentett kedvencek</StatLabel>
              <StatNumber fontSize="3xl">{isLoading ? <Spinner size="sm" /> : stats.savedFavorites}</StatNumber>
              <StatHelpText>Lakások, amiket elmentett</StatHelpText>
            </Stat>
          </SimpleGrid>

          <Box bg={bg} p={6} borderRadius="lg" boxShadow="sm">
            <Heading as="h3" size="md" mb={4}>
              Ajánlott lakások
            </Heading>
            <Text color="gray.500">Jelenleg nincsenek új ajánlások az Ön preferenciái alapján.</Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
