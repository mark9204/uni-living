import React from 'react';
import {
  Flex,
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Stack,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const MotionBox = motion(Box);
const MotionImage = motion(Image);

// Infinite scroll animation for the gallery view
const scrollStyle = `
  @keyframes scroll {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-50%);
    }
  }
`;

function LandingPage() {
  const bg = useColorModeValue('gray.200', 'gray.800');
  const textColor = useColorModeValue('yellow.500', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const galleryBg = useColorModeValue('gray.300', 'gray.700');
  // Placeholder pictures
  const properties = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=500&h=500&fit=crop',
      title: 'Modern Lakás'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop',
      title: 'Kényelmes Ház'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=500&fit=crop',
      title: 'Luxus Lakás'
    },
    {
      id: 4,
      image: 'https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg',
      title: 'Otthonos Szoba'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=500&h=500&fit=crop',
      title: 'Elegáns Loft'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
      title: 'Stílusos Apartman'
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=500&fit=crop',
      title: 'Minimális Design'
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop',
      title: 'Otthonos Szoba'
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=500&fit=crop',
      title: 'Modern Konyha'
    },
    {
      id: 10,
      image: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=500&h=500&fit=crop',
      title: 'Luxus Hálószoba'
    },
    {
      id: 11,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=500&fit=crop',
      title: 'Világos Nappali'
    },
    {
      id: 12,
      image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=500&h=500&fit=crop',
      title: 'Elegáns Lépcsősor'
    },
    {
      id: 13,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
      title: 'Modern Fürdőszoba'
    },
    {
      id: 14,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=500&fit=crop',
      title: 'Meleg Kerti Sarok'
    },
    {
      id: 15,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=500&fit=crop',
      title: 'Kortárs Lakóhely'
    },
    {
      id: 16,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop',
      title: 'Vidéki Házikó'
    },
    {
      id: 17,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=500&fit=crop',
      title: 'Tágas Terasz'
    },
    {
      id: 18,
      image: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=500&h=500&fit=crop',
      title: 'Elegáns Foyer'
    },
    {
      id: 19,
      image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=500&h=500&fit=crop',
      title: 'Loft Stúdió'
    },
    {
      id: 20,
      image: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=500&h=500&fit=crop',
      title: 'Világos Nappali'
    },
    {
      id: 21,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
      title: 'Relaxáló Szoba'
    },
    {
      id: 22,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=500&fit=crop',
      title: 'Exkluzív Épület'
    },
    {
      id: 23,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop',
      title: 'Kényelmes Menedék'
    },
    {
      id: 24,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=500&fit=crop',
      title: 'Prémium Hely'
    },
    {
      id: 25,
      image: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=500&h=500&fit=crop',
      title: 'Ragyogó Intériőr'
    },
    {
      id: 26,
      image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=500&h=500&fit=crop',
      title: 'Stílusos Rezidencia'
    },
    {
      id: 27,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
      title: 'Meleg Ölelés'
    },
    {
      id: 28,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=500&fit=crop',
      title: 'Szép Nappali'
    },
    {
      id: 29,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=500&fit=crop',
      title: 'Modell Ház'
    },
    {
      id: 30,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop',
      title: 'Végső Otthon',
    },
  ];

  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      backgroundColor={bg}
      overflow="hidden"
    >
      <Flex flex={1} width="100%" overflow="hidden">
        {/* Left Side Content */}
        <Flex
          width={["100%", "100%", "50%"]}
          justifyContent="center"
          alignItems="center"
          px={4}
          py={8}
        >
          <Stack
            spacing={8}
            align="center"
            width="100%"
            maxWidth="600px"
            textAlign="center"
          >
            <MotionImage
              src="https://pics.clipartpng.com/House_PNG_Clip_Art-2193.png"
              alt="UniLiving House"
              width="200px"
              height="auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeIn' }}
            />
            <Heading as="h1" size="2xl" color={textColor}>
              Üdvözlünk a UniLiving-nél
            </Heading>
            <Text fontSize="lg" color={secondaryTextColor}>
              Találd meg, ahova tartozol
            </Text>
            <Button
              as={RouterLink}
              to="/properties"
              colorScheme="yellow"
              size="lg"
              width={["100%", "auto"]}
            >
              Kezdjük
            </Button>
          </Stack>
        </Flex>

        {/* Right Side Gallery - Click to Properties */}
        <Box
          as={RouterLink}
          to="/properties"
          display={['none', 'none', 'flex']}
          width="50%"
          backgroundColor={galleryBg}
          justifyContent="center"
          alignItems="center"
          overflow="hidden"
          position="relative"
          cursor="pointer"
          transition="all 0.3s ease"
          _hover={{
            bg: 'gray.400',
            '& > div:first-of-type': {
              opacity: 0.8,
            },
            '& > div:last-of-type': {
              opacity: 1,
            }
          }}
        >
          <Box
            display="grid"
            gridTemplateColumns="repeat(2, 1fr)"
            width="100%"
            gap={4}
            padding={4}
            css={{
              animation: 'scroll 80s linear infinite',
              '@keyframes scroll': {
                '0%': { transform: 'translateY(0)' },
                '100%': { transform: 'translateY(-50%)' },
              },
            }}
            transition="opacity 0.3s ease"
          >
            {/* Triplikált lista a zökkenőmentes hurokhoz */}
            {[...properties, ...properties, ...properties].map((property, index) => (
              <Box
                key={index}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                padding={2}
              >
                <Image
                  src={property.image}
                  alt={property.title}
                  width="100%"
                  height="250px"
                  objectFit="cover"
                  borderRadius="12px"
                  boxShadow="lg"
                />
              </Box>
            ))}
          </Box>

          {/* Hover Text */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            opacity={0}
            transition="opacity 0.3s ease"
            zIndex={10}
          >
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color="white"
              textAlign="center"
              textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
            >
              Találd meg otthonod még ma!
            </Text>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}

export default LandingPage;
