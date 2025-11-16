import { useState } from "react";
import {
    Flex,
    Heading,
    Input,
    Button,
    Stack,
    Box,
    FormControl,
    FormLabel,
    Textarea,
    NumberInput,
    NumberInputField,
    Select,
    Checkbox,
    SimpleGrid,
    useToast,
    VStack,
    HStack,
    Image,
    Text,
    IconButton,
    Grid,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { apiClient } from "./api/client";

export default function UploadPropertyPage() {
    const toast = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Képek kezelése
    const [images, setImages] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Alapvető információk
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [price, setPrice] = useState("");
    const [currency, setCurrency] = useState("HUF");
    const [size, setSize] = useState("");
    const [roomCount, setRoomCount] = useState("");
    
    // Kategória - később API-ból töltjük be, most hardcode-oljuk
    const [categoryId, setCategoryId] = useState("");

    // Boolean mezők (checkbox-ok)
    const [hasBalcony, setHasBalcony] = useState(false);
    const [hasParking, setHasParking] = useState(false);
    const [hasElevator, setHasElevator] = useState(false);
    const [petsAllowed, setPetsAllowed] = useState(false);
    const [smokingAllowed, setSmokingAllowed] = useState(false);

    // Kép feltöltés kezelése
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleFiles = (files) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            toast({
                title: "Hiba",
                description: "Csak képfájlokat tölthetsz fel.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Képek preview-jának létrehozása
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImages(prev => [...prev, {
                    file: file,
                    preview: e.target.result,
                    isMain: prev.length === 0 // Az első kép legyen a fő kép
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    // Drag and drop kezelése
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    // Kép törlése
    const removeImage = (index) => {
        setImages(prev => {
            const newImages = prev.filter((_, i) => i !== index);
            // Ha a fő képet töröltük, az első kép legyen az új fő kép
            if (index === mainImageIndex && newImages.length > 0) {
                newImages[0].isMain = true;
                setMainImageIndex(0);
            }
            return newImages;
        });
    };

    // Fő kép beállítása
    const setAsMainImage = (index) => {
        setImages(prev => prev.map((img, i) => ({
            ...img,
            isMain: i === index
        })));
        setMainImageIndex(index);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validáció - ellenőrizzük, hogy minden kötelező mező ki van-e töltve
        if (!title || !description || !address || !city || !price || !size || !roomCount || !categoryId) {
            toast({
                title: "Hiba",
                description: "Kérjük, töltse ki az összes kötelező mezőt.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        if (images.length === 0) {
            toast({
                title: "Hiba",
                description: "Kérjük, töltsön fel legalább egy képet.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);

        // Az adatok összeállítása a backend által várt formátumban
        const propertyData = {
            title,
            description,
            address,
            city,
            price: parseFloat(price), // Szám formátumra konvertáljuk
            currency,
            size: parseFloat(size),
            roomCount: parseInt(roomCount),
            categoryId: parseInt(categoryId),
            hasBalcony,
            hasParking,
            hasElevator,
            petsAllowed,
            smokingAllowed,
            // isActive és isApproved a backend állítja be, nem küldünk
        };

        console.log('Sending property data:', propertyData);

        try {
            const result = await apiClient.createProperty(propertyData);
            console.log('Property created:', result);
            
            toast({
                title: "Sikeres feltöltés!",
                description: "Az ingatlan sikeresen fel lett töltve.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });
            
            // Átirányítás a lakások oldalra
            navigate("/properties");
        } catch (error) {
            toast({
                title: "Feltöltési hiba",
                description: error.message || "Ismeretlen hiba történt.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex
            width="100%"
            height="100%"
            backgroundColor="gray.200"
            justifyContent="center"
            alignItems="center"
            py={6}
            overflow="auto"
        >
            <Box width="100%" maxWidth="1400px" px={4}>
                <Heading color="black.600" textAlign="center" mb={6}>Új ingatlan feltöltése</Heading>
                
                <Grid templateColumns={["1fr", "1fr", "1fr 2fr"]} gap={6}>
                    {/* Bal oldal - Képfeltöltés */}
                    <Box>
                        <VStack spacing={4} align="stretch" position="sticky" top="20px">
                            {/* Drag & Drop terület */}
                            <Box
                                border="2px dashed"
                                borderColor={isDragging ? "yellow.500" : "gray.300"}
                                borderRadius="md"
                                p={8}
                                textAlign="center"
                                bg={isDragging ? "yellow.50" : "white"}
                                cursor="pointer"
                                transition="all 0.2s"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-input').click()}
                                _hover={{ borderColor: "yellow.400", bg: "gray.50" }}
                            >
                                <Input
                                    id="file-input"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    display="none"
                                />
                                <VStack spacing={2}>
                                    <Text fontSize="3xl">📷</Text>
                                    <Text fontWeight="bold">Képek feltöltése</Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Kattints vagy húzd ide a képeket
                                    </Text>
                                </VStack>
                            </Box>

                            {/* Feltöltött képek */}
                            {images.length > 0 && (
                                <Box>
                                    <Text fontWeight="bold" mb={2}>
                                        Feltöltött képek ({images.length})
                                    </Text>
                                    <VStack spacing={2} align="stretch">
                                        {images.map((img, index) => (
                                            <Box
                                                key={index}
                                                position="relative"
                                                borderRadius="md"
                                                overflow="hidden"
                                                border="2px solid"
                                                borderColor={img.isMain ? "yellow.500" : "gray.200"}
                                                cursor="pointer"
                                                onClick={() => setAsMainImage(index)}
                                                _hover={{ borderColor: "yellow.400" }}
                                            >
                                                <Image
                                                    src={img.preview}
                                                    alt={`Preview ${index + 1}`}
                                                    width="100%"
                                                    height="120px"
                                                    objectFit="cover"
                                                />
                                                {img.isMain && (
                                                    <Box
                                                        position="absolute"
                                                        top={2}
                                                        left={2}
                                                        bg="yellow.500"
                                                        color="white"
                                                        px={2}
                                                        py={1}
                                                        borderRadius="md"
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                    >
                                                        FŐ KÉP
                                                    </Box>
                                                )}
                                                <IconButton
                                                    icon={<CloseIcon />}
                                                    position="absolute"
                                                    top={2}
                                                    right={2}
                                                    size="sm"
                                                    colorScheme="red"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeImage(index);
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </VStack>
                                    <Text fontSize="xs" color="gray.600" mt={2}>
                                        Kattints egy képre, hogy főképpé tedd
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </Box>

                    {/* Jobb oldal - Űrlap */}
                    <Box
                        backgroundColor="white"
                        p={8}
                        boxShadow="md"
                        borderRadius="md"
                    >
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4} align="stretch">
                            {/* Cím */}
                            <FormControl isRequired>
                                <FormLabel>Cím</FormLabel>
                                <Input
                                    placeholder="pl. Modern lakás a belvárosban"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </FormControl>

                            {/* Leírás */}
                            <FormControl isRequired>
                                <FormLabel>Leírás</FormLabel>
                                <Textarea
                                    placeholder="Írja le részletesen az ingatlant..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    minHeight="120px"
                                />
                            </FormControl>

                            {/* Cím és Város - két oszlopban */}
                            <SimpleGrid columns={[1, 2]} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Utca, házszám</FormLabel>
                                    <Input
                                        placeholder="pl. Fő utca 12."
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Város</FormLabel>
                                    <Input
                                        placeholder="pl. Budapest"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            {/* Ár, Valuta, Méret - három oszlopban */}
                            <SimpleGrid columns={[1, 3]} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Ár</FormLabel>
                                    <NumberInput min={0}>
                                        <NumberInputField
                                            placeholder="150000"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                        />
                                    </NumberInput>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Valuta</FormLabel>
                                    <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                        <option value="HUF">HUF</option>
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Méret (m²)</FormLabel>
                                    <NumberInput min={0}>
                                        <NumberInputField
                                            placeholder="50"
                                            value={size}
                                            onChange={(e) => setSize(e.target.value)}
                                        />
                                    </NumberInput>
                                </FormControl>
                            </SimpleGrid>

                            {/* Szobaszám és Kategória */}
                            <SimpleGrid columns={[1, 2]} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Szobák száma</FormLabel>
                                    <NumberInput min={1}>
                                        <NumberInputField
                                            placeholder="2"
                                            value={roomCount}
                                            onChange={(e) => setRoomCount(e.target.value)}
                                        />
                                    </NumberInput>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Kategória</FormLabel>
                                    <Select
                                        placeholder="Válassz kategóriát"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                    >
                                        <option value="1">Lakás</option>
                                        <option value="2">Ház</option>
                                        <option value="3">Szoba</option>
                                        <option value="4">Garzon</option>
                                    </Select>
                                </FormControl>
                            </SimpleGrid>

                            {/* Jellemzők - Checkbox-ok */}
                            <FormControl>
                                <FormLabel>Jellemzők</FormLabel>
                                <SimpleGrid columns={[1, 2]} spacing={3}>
                                    <Checkbox
                                        isChecked={hasBalcony}
                                        onChange={(e) => setHasBalcony(e.target.checked)}
                                    >
                                        Van erkély/terasz
                                    </Checkbox>
                                    <Checkbox
                                        isChecked={hasParking}
                                        onChange={(e) => setHasParking(e.target.checked)}
                                    >
                                        Van parkolóhely
                                    </Checkbox>
                                    <Checkbox
                                        isChecked={hasElevator}
                                        onChange={(e) => setHasElevator(e.target.checked)}
                                    >
                                        Van lift
                                    </Checkbox>
                                    <Checkbox
                                        isChecked={petsAllowed}
                                        onChange={(e) => setPetsAllowed(e.target.checked)}
                                    >
                                        Kisállat megengedett
                                    </Checkbox>
                                    <Checkbox
                                        isChecked={smokingAllowed}
                                        onChange={(e) => setSmokingAllowed(e.target.checked)}
                                    >
                                        Dohányzás megengedett
                                    </Checkbox>
                                </SimpleGrid>
                            </FormControl>

                            {/* Feltöltés gomb */}
                            <Button
                                type="submit"
                                colorScheme="yellow"
                                size="lg"
                                width="full"
                                isLoading={isLoading}
                                mt={4}
                            >
                                Ingatlan feltöltése
                            </Button>
                            </VStack>
                        </form>
                    </Box>
                </Grid>
            </Box>
        </Flex>
    );
}