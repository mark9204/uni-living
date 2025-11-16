import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    Image,
    Grid,
    GridItem,
    Badge,
    VStack,
    HStack,
    Divider,
    Button,
    useToast,
    Spinner,
    Icon,
} from '@chakra-ui/react';
import { FaBed, FaRulerCombined, FaMapMarkerAlt, FaUser, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { apiClient } from './api/client';

const PropertyOverviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        loadProperty();
    }, [id]);

    const loadProperty = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getProperty(id);
            console.log('Betöltött property teljes adat:', data);
            console.log('Property images mező:', data.images);
            
            setProperty(data);
            
            // Főkép kiválasztása
            const mainImg = data.images?.find(img => img.isMainImage);
            console.log('Főkép:', mainImg);
            console.log('Összes kép:', data.images);
            setSelectedImage(mainImg || data.images?.[0] || null);
        } catch (error) {
            console.error('Property betöltési hiba:', error);
            toast({
                title: 'Hiba',
                description: 'A lakás adatai nem tölthetők be.',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <Spinner size="xl" color="blue.500" />
            </Box>
        );
    }

    if (!property) {
        return (
            <Container maxW="container.lg" py={10}>
                <Text>Lakás nem található.</Text>
                <Button mt={4} onClick={() => navigate('/properties')}>
                    Vissza a listához
                </Button>
            </Container>
        );
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7177';

    return (
        <Box minH="100vh" bg="gray.50" py={8} overflowY="auto" height="100%">
            <Container maxW="container.xl">
                <Button mb={6} onClick={() => navigate(-1)} variant="ghost">
                    ← Vissza
                </Button>

                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
                    {/* BAL OLDAL - Képek */}
                    <GridItem>
                        <VStack spacing={4} align="stretch">
                            {/* Nagy kép */}
                            <Box
                                bg="white"
                                borderRadius="xl"
                                overflow="hidden"
                                boxShadow="lg"
                                position="relative"
                                height="500px"
                            >
                                {selectedImage ? (
                                    <Image
                                        src={`${API_BASE_URL}/uploads/properties/prop_${property.id}/${selectedImage.filePath}`}
                                        alt={property.title}
                                        width="100%"
                                        height="100%"
                                        objectFit="cover"
                                    />
                                ) : (
                                    <Box
                                        width="100%"
                                        height="100%"
                                        bg="gray.200"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Text color="gray.500">Nincs kép</Text>
                                    </Box>
                                )}
                                {selectedImage?.isMainImage && (
                                    <Badge
                                        position="absolute"
                                        top={4}
                                        right={4}
                                        colorScheme="blue"
                                        fontSize="sm"
                                        px={3}
                                        py={1}
                                    >
                                        Főkép
                                    </Badge>
                                )}
                            </Box>

                            {/* Miniatűr képek */}
                            {property.images && property.images.length > 1 && (
                                <Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={3}>
                                    {property.images.map((img) => (
                                        <Box
                                            key={img.id}
                                            cursor="pointer"
                                            onClick={() => setSelectedImage(img)}
                                            borderRadius="md"
                                            overflow="hidden"
                                            border={selectedImage?.id === img.id ? '3px solid' : '2px solid'}
                                            borderColor={selectedImage?.id === img.id ? 'blue.500' : 'gray.200'}
                                            transition="all 0.2s"
                                            _hover={{ borderColor: 'blue.400' }}
                                            height="100px"
                                        >
                                            <Image
                                                src={`${API_BASE_URL}/uploads/properties/prop_${property.id}/${img.filePath}`}
                                                alt={`Kép ${img.id}`}
                                                width="100%"
                                                height="100%"
                                                objectFit="cover"
                                            />
                                        </Box>
                                    ))}
                                </Grid>
                            )}
                        </VStack>
                    </GridItem>

                    {/* JOBB OLDAL - Adatok */}
                    <GridItem>
                        <VStack spacing={6} align="stretch">
                            {/* Címke és ár */}
                            <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
                                <Heading size="lg" mb={2}>
                                    {property.title}
                                </Heading>
                                <HStack spacing={2} mb={4}>
                                    <Icon as={FaMapMarkerAlt} color="gray.500" />
                                    <Text color="gray.600">
                                        {property.address}, {property.city}
                                    </Text>
                                </HStack>
                                <Heading size="2xl" color="blue.600">
                                    {property.price.toLocaleString()} {property.currency}
                                    <Text as="span" size="md" color="gray.500" fontWeight="normal">
                                        /hó
                                    </Text>
                                </Heading>
                            </Box>

                            {/* Alapadatok */}
                            <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
                                <Heading size="md" mb={4}>
                                    Alapadatok
                                </Heading>
                                <VStack spacing={3} align="stretch">
                                    <HStack justify="space-between">
                                        <HStack>
                                            <Icon as={FaRulerCombined} color="blue.500" />
                                            <Text fontWeight="medium">Méret:</Text>
                                        </HStack>
                                        <Text>{property.size} m²</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <HStack>
                                            <Icon as={FaBed} color="blue.500" />
                                            <Text fontWeight="medium">Szobák:</Text>
                                        </HStack>
                                        <Text>{property.roomCount} szoba</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <HStack>
                                            <Icon as={FaUser} color="blue.500" />
                                            <Text fontWeight="medium">Bérbeadó:</Text>
                                        </HStack>
                                        <Text>{property.owner?.name || 'N/A'}</Text>
                                    </HStack>
                                    {property.category && (
                                        <HStack justify="space-between">
                                            <Text fontWeight="medium">Kategória:</Text>
                                            <Badge colorScheme="purple">{property.category.name}</Badge>
                                        </HStack>
                                    )}
                                </VStack>
                            </Box>

                            {/* Tulajdonságok */}
                            <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
                                <Heading size="md" mb={4}>
                                    Tulajdonságok
                                </Heading>
                                <VStack spacing={2} align="stretch">
                                    <HStack justify="space-between">
                                        <Text>Erkély:</Text>
                                        <Icon
                                            as={property.hasBalcony ? FaCheckCircle : FaTimesCircle}
                                            color={property.hasBalcony ? 'green.500' : 'red.500'}
                                        />
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Parkolás:</Text>
                                        <Icon
                                            as={property.hasParking ? FaCheckCircle : FaTimesCircle}
                                            color={property.hasParking ? 'green.500' : 'red.500'}
                                        />
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Lift:</Text>
                                        <Icon
                                            as={property.hasElevator ? FaCheckCircle : FaTimesCircle}
                                            color={property.hasElevator ? 'green.500' : 'red.500'}
                                        />
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Kisállat engedélyezett:</Text>
                                        <Icon
                                            as={property.petsAllowed ? FaCheckCircle : FaTimesCircle}
                                            color={property.petsAllowed ? 'green.500' : 'red.500'}
                                        />
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Dohányzás engedélyezett:</Text>
                                        <Icon
                                            as={property.smokingAllowed ? FaCheckCircle : FaTimesCircle}
                                            color={property.smokingAllowed ? 'green.500' : 'red.500'}
                                        />
                                    </HStack>
                                </VStack>
                            </Box>

                            {/* Leírás */}
                            <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
                                <Heading size="md" mb={4}>
                                    Leírás
                                </Heading>
                                <Text color="gray.700" lineHeight="tall">
                                    {property.description}
                                </Text>
                            </Box>

                            {/* Kapcsolatfelvétel gomb */}
                            <Button
                                colorScheme="blue"
                                size="lg"
                                width="100%"
                                onClick={() => {
                                    toast({
                                        title: 'Kapcsolatfelvétel',
                                        description: 'Ez a funkció hamarosan elérhető lesz!',
                                        status: 'info',
                                        duration: 3000,
                                    });
                                }}
                            >
                                Kapcsolatfelvétel
                            </Button>
                        </VStack>
                    </GridItem>
                </Grid>
            </Container>
        </Box>
    );
};

export default PropertyOverviewPage;
