import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    Input,
    Select,
    Checkbox,
    HStack,
    Button,
    FormControl,
    FormLabel,
    Collapse,
    useDisclosure,
    Icon,
} from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa';
import { apiClient } from './api/client';

function PropertiesPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const toast = useToast();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const { isOpen, onToggle } = useDisclosure();
    
    const pageBg = useColorModeValue('gray.50', 'gray.800');
    const cardBg = useColorModeValue('white', 'gray.700');
    const headingColor = useColorModeValue('gray.800', 'white');
    const textColor = useColorModeValue('gray.600', 'gray.400');
    const noPropertyBg = useColorModeValue('white', 'gray.700');

    useEffect(() => {
        let isMounted = true;

        const loadProperties = async () => {
            try {
                setLoading(true);
                
                const filter = {
                    city: searchParams.get('city'),
                    minPrice: searchParams.get('minPrice'),
                    maxPrice: searchParams.get('maxPrice'),
                    hasBalcony: searchParams.get('hasBalcony') === 'true' ? true : undefined,
                    hasElevator: searchParams.get('hasElevator') === 'true' ? true : undefined,
                    sortBy: searchParams.get('sortBy'),
                    sortDirection: searchParams.get('sortDirection'),
                    pageNumber: parseInt(searchParams.get('pageNumber') || '1'),
                    pageSize: parseInt(searchParams.get('pageSize') || '10'),
                };

                // Clean up undefined/null/empty values
                Object.keys(filter).forEach(key => {
                    if (filter[key] === undefined || filter[key] === null || filter[key] === '') {
                        delete filter[key];
                    }
                });

                const data = await apiClient.getPropertiesPaged(filter);
                
                if (isMounted) {
                    console.log('Betöltött lakások:', data);
                    if (data.items) {
                        setProperties(data.items);
                        setTotalPages(data.totalPages);
                    } else {
                        // Fallback if API returns array directly (backward compatibility)
                        setProperties(Array.isArray(data) ? data : []);
                        setTotalPages(1);
                    }
                }

            } catch (error) {
                if (isMounted) {
                    console.error('Lakások betöltési hiba:', error);
                    toast({
                        title: 'Hiba',
                        description: 'A lakások nem tölthetők be.',
                        status: 'error',
                        duration: 3000,
                    });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProperties();

        return () => {
            isMounted = false;
        };
    }, [searchParams]);

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        
        if (value === '' || value === null || value === false) {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }
        
        // Reset page to 1 on filter change (except page change)
        if (key !== 'pageNumber') {
            newParams.set('pageNumber', '1');
        }
        
        setSearchParams(newParams);
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
                <Flex justify="space-between" align="center" mb={8}>
                    <Heading as="h1" size="2xl" color={headingColor}>
                        Elérhető lakások
                    </Heading>
                    <Button onClick={onToggle} leftIcon={<Icon as={FaFilter} />} colorScheme="blue" variant="outline">
                        Szűrők
                    </Button>
                </Flex>

                {/* Filters */}
                <Box position="relative" zIndex={10}>
                    <Collapse in={isOpen} animateOpacity>
                        <Box mb={8} p={6} bg={cardBg} borderRadius="xl" boxShadow="sm">
                            <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)']} gap={6}>
                        <FormControl>
                            <FormLabel>Város</FormLabel>
                            <Input 
                                placeholder="Város keresése..." 
                                value={searchParams.get('city') || ''}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                            />
                        </FormControl>
                        
                        <FormControl>
                            <FormLabel>Min Ár</FormLabel>
                            <Input 
                                type="number" 
                                placeholder="0" 
                                value={searchParams.get('minPrice') || ''}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            />
                        </FormControl>
                        
                        <FormControl>
                            <FormLabel>Max Ár</FormLabel>
                            <Input 
                                type="number" 
                                placeholder="Max" 
                                value={searchParams.get('maxPrice') || ''}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Rendezés</FormLabel>
                            <Select 
                                value={searchParams.get('sortBy') || ''} 
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            >
                                <option value="">Alapértelmezett</option>
                                <option value="price">Ár</option>
                                <option value="size">Méret</option>
                                <option value="roomCount">Szobák</option>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Irány</FormLabel>
                            <Select 
                                value={searchParams.get('sortDirection') || ''} 
                                onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
                            >
                                <option value="">Növekvő</option>
                                <option value="desc">Csökkenő</option>
                            </Select>
                        </FormControl>

                        <Flex align="end" pb={2}>
                            <HStack spacing={6}>
                                <Checkbox 
                                    isChecked={searchParams.get('hasBalcony') === 'true'}
                                    onChange={(e) => handleFilterChange('hasBalcony', e.target.checked)}
                                >
                                    Erkély
                                </Checkbox>
                                <Checkbox 
                                    isChecked={searchParams.get('hasElevator') === 'true'}
                                    onChange={(e) => handleFilterChange('hasElevator', e.target.checked)}
                                >
                                    Lift
                                </Checkbox>
                            </HStack>
                        </Flex>
                    </Grid>
                </Box>
                </Collapse>
                </Box>

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
                            Még nincsenek elérhető lakások a megadott feltételekkel
                        </Text>
                    </Box>
                ) : (
                    <>
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Flex justify="center" mt={8} gap={4} align="center">
                                <Button 
                                    onClick={() => handleFilterChange('pageNumber', Math.max(1, (parseInt(searchParams.get('pageNumber') || '1')) - 1))}
                                    isDisabled={(parseInt(searchParams.get('pageNumber') || '1')) <= 1}
                                >
                                    Előző
                                </Button>
                                <Text color={textColor}>
                                    Oldal {searchParams.get('pageNumber') || '1'} / {totalPages}
                                </Text>
                                <Button 
                                    onClick={() => handleFilterChange('pageNumber', (parseInt(searchParams.get('pageNumber') || '1')) + 1)}
                                    isDisabled={(parseInt(searchParams.get('pageNumber') || '1')) >= totalPages}
                                >
                                    Következő
                                </Button>
                            </Flex>
                        )}
                    </>
                )}
            </Flex>
        </Flex>
    );
}

export default PropertiesPage;
