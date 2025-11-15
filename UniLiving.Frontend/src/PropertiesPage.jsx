import React from 'react';
import { Flex, Box, Heading, Text, Grid, GridItem } from '@chakra-ui/react';
import Navbar from './Navbar';

function PropertiesPage() {
  return (
    <Flex
      width="100vw"
      height="100vh"
      flexDirection="column"
      backgroundColor="gray.200"
      overflow="hidden"
    >
      <Navbar />
      <Flex flex={1} width="100%" overflow="auto" flexDirection="column" p={8}>
        <Heading as="h1" size="2xl" color="black.600" mb={8}>
          Lakások
        </Heading>
        
        <Grid
          templateColumns={["1fr", "repeat(2, 1fr)", "repeat(3, 1fr)"]}
          gap={6}
          width="100%"
        >
          {/* Ide jönnek majd a lakások */}
          <GridItem>
            <Box
              bg="white"
              borderRadius="12px"
              boxShadow="md"
              p={4}
              textAlign="center"
            >
              <Text color="gray.500">Lakások itt lesznek megjelenítve</Text>
            </Box>
          </GridItem>
        </Grid>
      </Flex>
    </Flex>
  );
}

export default PropertiesPage;
