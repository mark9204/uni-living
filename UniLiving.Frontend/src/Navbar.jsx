import React from 'react';
import {
  Box,
  Flex,
  Button,
  HStack,
  Text,
  IconButton,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { SunIcon, MoonIcon, BellIcon } from '@chakra-ui/icons';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import NotificationDrawer from './NotificationDrawer';

function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const navBg = useColorModeValue('white', 'gray.800');
  const yellowHover = useColorModeValue('yellow.300', 'yellow.500');
  const yellowHoverText = useColorModeValue('yellow.900', 'white');

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={10}
      bg={navBg}
      boxShadow="md"
      py={4}
      px={8}
    >
      <Flex justify="space-between" align="center" maxW="100%" gap={8}>
        {/* Logo */}
        <RouterLink to="/">
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="yellow.500"
            cursor="pointer"
          >
            UniLiving
          </Text>
        </RouterLink>

        {/* Center Section - Navigation Links with Upload Button for Landlords */}
        <Flex flex="1" justify="center" align="center">
          <HStack spacing={6}>
            {user && (user.role === 'Landlord' || user.role === 'Owner') && (
              <Button
                as={RouterLink}
                to="/upload"
                colorScheme="yellow"
                size="lg"
                fontWeight="bold"
                leftIcon={<Text fontSize="xl">+</Text>}
              >
                Feltöltés
              </Button>
            )}
            <Button 
              as={RouterLink}
              to="/properties"
              variant="ghost" 
              size="md"
              _hover={{ 
                bg: yellowHover,
                color: yellowHoverText,
              }}
            >
              Lakások
            </Button>
            {user && (
              <>
                <Button
                  as={RouterLink}
                  to="/chats"
                  variant="ghost"
                  size="md"
                  _hover={{
                    bg: yellowHover,
                    color: yellowHoverText,
                  }}
                >
                  Beszélgetések
                </Button>
                <Button
                  as={RouterLink}
                  to="/preferences"
                  variant="ghost"
                  size="md"
                  _hover={{
                    bg: yellowHover,
                    color: yellowHoverText,
                  }}
                >
                  Értesítések
                </Button>
              </>
            )}
            <Button variant="ghost" size="md"
              _hover={{
                bg: yellowHover,
                color: yellowHoverText,
              }}>
              Profil
            </Button>
            <Button variant="ghost" size="md"
              _hover={{
                bg: yellowHover,
                color: yellowHoverText,
              }}>
              Rólunk
            </Button>
          </HStack>
        </Flex>

        {/* Right Side - Login & Theme Toggle */}
        <HStack spacing={4}>
          {user ? (
            <>
              <Text fontWeight="bold">Szia, {user.name}!</Text>
              
              {/* Értesítések harang ikon */}
              <Box position="relative">
                <IconButton
                  aria-label="Értesítések"
                  icon={<BellIcon boxSize={5} />}
                  variant="ghost"
                  onClick={onDrawerOpen}
                  _hover={{
                    bg: yellowHover,
                    color: yellowHoverText,
                  }}
                />
                {unreadCount > 0 && (
                  <Badge
                    colorScheme="red"
                    borderRadius="full"
                    position="absolute"
                    top="-1"
                    right="-1"
                    fontSize="0.7em"
                    px={2}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Box>

              <NotificationDrawer isOpen={isDrawerOpen} onClose={onDrawerClose} />

              <Button onClick={logout} colorScheme="yellow" variant="outline" size="md">
                Kijelentkezés
              </Button>
            </>
          ) : (
            <Button 
              as={RouterLink}
              to="/login"
              colorScheme="yellow" 
              variant="outline" 
              size="md"
            >
              Belépés
            </Button>
          )}
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="md"
            aria-label="Toggle dark mode"
          />
        </HStack>
      </Flex>
    </Box>
  );
}

export default Navbar;
