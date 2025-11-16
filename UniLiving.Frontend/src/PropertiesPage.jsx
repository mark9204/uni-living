import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Flex,
    Box,
    Heading,
    Text,
    Grid,
    GridItem,
    Image,
    Badge,
    Spinner,
    useToast,
    useColorModeValue,
} from '@chakra-ui/react';
import { apiClient } from './api/client';

function PropertiesPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const pageBg = useColorModeValue('gray.50', 'gray.800');
    const cardBg = useColorModeValue('white', 'gray.700');
    const headingColor = useColorModeValue('gray.800', 'white');
    const textColor = useColorModeValue('gray.600', 'gray.400');
    const noPropertyBg = useColorModeValue('white', 'gray.700');

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getProperties();
            console.log('Betöltött lakások:', data);
            if (data.length > 0) {
                console.log('Első lakás teljes objektum:', data[0]);
                console.log('Első lakás images mező:', data[0].images);
            }
            setProperties(data);
        } catch (error) {
            console.error('Lakások betöltési hiba:', error);
            toast({
                title: 'Hiba',
                description: 'A lakások nem tölthetők be.',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePropertyClick = (propertyId) => {
        navigate(`/property/${propertyId}`);
    };

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7177';

    return (
        <Flex
            width="100%"
            height="100%"
            flexDirection="column"
            backgroundColor={pageBg}
            overflow="hidden"
        >
            <Flex flex={1} width="100%" overflow="auto" flexDirection="column" p={8}>
                <Heading as="h1" size="2xl" color={headingColor} mb={8}>
                    Elérhető lakások
                </Heading>

                {loading ? (
                    <Flex justify="center" align="center" height="400px">
                        <Spinner size="xl" color="blue.500" />
                    </Flex>
                ) : properties.length === 0 ? (
                    <Box
                        bg={noPropertyBg}
                        borderRadius="12px"
                        boxShadow="md"
                        p={8}
                        textAlign="center"
                    >
                        <Text color={textColor} fontSize="lg">
                            Még nincsenek elérhető lakások
                        </Text>
                    </Box>
                ) : (
                    <Grid
                        templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
                        gap={6}
                        width="100%"
                    >
                        {properties.map((property) => {
                            const mainImage = property.images?.find((img) => img.isMainImage) || property.images?.[0];
                            
                            return (
                                <GridItem key={property.id}>
                                    <Box
                                        bg={cardBg}
                                        borderRadius="xl"
                                        boxShadow="md"
                                        overflow="hidden"
                                        cursor="pointer"
                                        onClick={() => handlePropertyClick(property.id)}
                                        transition="all 0.3s"
                                        _hover={{
                                            transform: 'translateY(-4px)',
                                            boxShadow: 'xl',
                                        }}
                                    >
                                        {/* Kép */}
                                        <Box position="relative" height="200px" bg="gray.200">
                                            {mainImage ? (
                                                <Image
                                                    src={`${API_BASE_URL}/uploads/properties/prop_${property.id}/${mainImage.filePath}`}
                                                    alt={property.title}
                                                    width="100%"
                                                    height="100%"
                                                    objectFit="cover"
                                                />
                                            ) : (
                                                <Flex
                                                    width="100%"
                                                    height="100%"
                                                    align="center"
                                                    justify="center"
                                                >
                                                    <Text color="gray.400">Nincs kép</Text>
                                                </Flex>
                                            )}
                                            {/* Ár badge */}
                                            <Badge
                                                position="absolute"
                                                top={3}
                                                right={3}
                                                colorScheme="yellow"
                                                fontSize="md"
                                                px={3}
                                                py={1}
                                                borderRadius="md"
                                            >
                                                {property.price.toLocaleString()} {property.currency}
                                            </Badge>
                                        </Box>

                                        {/* Adatok */}
                                        <Box p={4}>
                                            <Heading size="md" mb={2} noOfLines={1} color={useColorModeValue('yellow.500', 'white')}>
                                                {property.title}    
                                            </Heading>
                                            <Text color={textColor} fontSize="sm" mb={2} noOfLines={1}>
                                                📍 {property.address}, {property.city}
                                            </Text>
                                            <Flex gap={3} color={textColor} fontSize="sm">
                                                <Text>🛏️ {property.roomCount} szoba</Text>
                                                <Text>📏 {property.size} m²</Text>
                                            </Flex>
                                        </Box>
                                    </Box>
                                </GridItem>
                            );
                        })}
                    </Grid>
                )}
            </Flex>
        </Flex>
    );
}

export default PropertiesPage;
