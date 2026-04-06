import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Divider,
  SimpleGrid,
  Icon,
  HStack,
  Flex
} from '@chakra-ui/react';
import { CheckCircleIcon, StarIcon, InfoIcon } from '@chakra-ui/icons';

function AboutPage() {
  const bg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const highlightColor = useColorModeValue('yellow.500', 'yellow.400');
  const pageBg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box w="100%" h="100%" overflowY="auto" bg={pageBg}>
      <Container maxW="container.xl" py={12}>
        <VStack spacing={12} align="stretch" bg={bg} p={10} borderRadius="2xl" boxShadow="xl">
          
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="2xl" color={highlightColor}>
              Rólunk
            </Heading>
            <Text fontSize="xl" color={textColor} maxW="3xl">
              Ismerd meg az UniLiving történetét és a csapatot, akik azért dolgoznak, 
              hogy a legjobb albérletkeresési élményt nyújtsák az egyetemisták számára.
            </Text>
          </VStack>

          <Divider />

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
            <Box>
              <Heading as="h2" size="xl" mb={6} color={highlightColor}>
                A mi történetünk
              </Heading>
              <Text fontSize="lg" color={textColor} mb={4}>
                Az UniLiving egyetemisták által alapított kezdeményezés, mely azzal a céllal jött létre, hogy áthidalja 
                a szakadékot a diákok és a megbízható főbérlők között. Saját bőrünkön tapasztaltuk meg a megfelelő 
                albérlet megtalálásának és fenntartásának nehézségeit.
              </Text>
              <Text fontSize="lg" color={textColor}>
                Úgy gondoltuk, ennek a folyamatnak nem kellene ennyire fárasztónak lennie. Ezért létrehoztunk egy 
                olyan felületet, amely kifejezetten a hallgatók igényeire van szabva.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="xl" mb={6} color={highlightColor}>
                Küldetésünk
              </Heading>
              <VStack spacing={4} align="flex-start">
                <HStack align="flex-start" spacing={4}>
                  <Icon as={CheckCircleIcon} color="green.500" mt={1} />
                  <Text fontSize="lg" color={textColor}>
                    <strong>Átláthatóság:</strong> Nincsenek rejtett költségek, tiszta és világos kommunikáció minden fél részéről.
                  </Text>
                </HStack>
                <HStack align="flex-start" spacing={4}>
                  <Icon as={StarIcon} color="yellow.400" mt={1} />
                  <Text fontSize="lg" color={textColor}>
                    <strong>Minőség:</strong> Csak hitelesített, egyetemistabarát szálláslehetőségeket kínálunk a platformon.
                  </Text>
                </HStack>
                <HStack align="flex-start" spacing={4}>
                  <Icon as={InfoIcon} color="blue.400" mt={1} />
                  <Text fontSize="lg" color={textColor}>
                    <strong>Biztonság:</strong> Beépített értékelési rendszer, hogy mindenki a legmegbízhatóbb környezetben élhessen és adhasson ki.
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </SimpleGrid>

          <Box mt={8} p={8} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="xl">
            <Heading as="h3" size="lg" mb={4} textAlign="center" color={highlightColor}>
              Miért válassz minket?
            </Heading>
            <Text fontSize="lg" color={textColor} textAlign="center" maxW="4xl" mx="auto">
              Platformunk egyesíti a modern technológiát a közösségi visszajelzésekkel. Mi nem csupán ingatlanokat 
              listázunk, hanem otthonokat, ahol egy diák nyugodtan koncentrálhat a tanulmányaira, és kiadóként biztos lehetsz
              benne, hogy a legjobb bérlőkkel kerülsz kapcsolatba.
            </Text>
          </Box>
          
        </VStack>
      </Container>
    </Box>
  );
}

export default AboutPage;
