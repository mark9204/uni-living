import React from 'react';
import {
  Box,
  Flex,
  Button,
  HStack,
  Text,
  IconButton,
  useColorMode,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useAuth } from './AuthContext';

function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={10}
      bg="white"
      boxShadow="md"
      py={4}
      px={8}
    >
      <Flex justify="space-between" align="center" maxW="100%">
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

        {/* Navigation Links */}
        <HStack spacing={6}>
          <Button 
            as={RouterLink}
            to="/properties"
            variant="ghost" 
            size="md"
          >
            Lakások
          </Button>
          <Button variant="ghost" size="md">
            Profil
          </Button>
          <Button variant="ghost" size="md">
            Rólunk
          </Button>
        </HStack>

        {/* Right Side - Login & Theme Toggle */}
        <HStack spacing={4}>
          {user ? (
            <>
              <Text fontWeight="bold">Szia, {user.name}!</Text>
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
