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
    useColorModeValue,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { apiClient } from "./api/client";
import { useAuth } from "./AuthContext";

export default function UploadPropertyPage() {
    const toast = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const pageBg = useColorModeValue("gray.200", "gray.800");
    const formBg = useColorModeValue("white", "gray.700");
    const headingColor = useColorModeValue("black.600", "white");
    const dropzoneBg = useColorModeValue("white", "gray.600");
    const dropzoneHoverBg = useColorModeValue("gray.50", "gray.500");
    const dropzoneBorderColor = useColorModeValue("gray.300", "gray.500");
    const dropzoneHoverBorderColor = useColorModeValue("yellow.400", "yellow.300");
    const imagePreviewBorderColor = useColorModeValue("gray.200", "gray.600");
    const textMutedColor = useColorModeValue("gray.600", "gray.400");

    // Képek kezelése
    const [images, setImages] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Alapvető információk
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [price, setPrice] = useState("");
    const [currency, setCurrency] = useState("HUF");
    const [size, setSize] = useState("");
    const [roomCount, setRoomCount] = useState("");
    const [bathroomCount, setBathroomCount] = useState("");
    const [availableFrom, setAvailableFrom] = useState("");
    const [availableTo, setAvailableTo] = useState("");
    
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
        if (!title || !description || !address || !city || !postalCode || !price || !size || !roomCount || !bathroomCount || !categoryId || !availableFrom) {
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

        // Kép fájlméret ellenőrzés (max 10 MB / kép)
        const maxSizeMB = 10;
        const oversizedImages = images.filter(img => img.file.size > maxSizeMB * 1024 * 1024);
        if (oversizedImages.length > 0) {
            toast({
                title: "Hiba",
                description: `${oversizedImages.length} kép túllépi a ${maxSizeMB} MB limitet.`,
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);

        try {
            // LÉPÉS 1: Property létrehozása (képek nélkül)
            const propertyData = {
                title,
                description,
                address,
                city,
                postalCode,
                price: parseFloat(price),
                currency,
                size: parseFloat(size),
                roomCount: parseInt(roomCount),
                bathroomCount: parseInt(bathroomCount),
                availableFrom,
                availableTo: availableTo || null, // Ha üres, null-t küldünk
                categoryId: parseInt(categoryId),
                hasBalcony,
                hasParking,
                hasElevator,
                petsAllowed,
                smokingAllowed,
            };

            console.log('LÉPÉS 1: Property létrehozása...', propertyData);
            const propertyResult = await apiClient.createProperty(propertyData);
            console.log('Property létrehozva, ID:', propertyResult.id);

            // LÉPÉS 2: Képek feltöltése egyesével
            console.log(`LÉPÉS 2: ${images.length} kép feltöltése...`);
            const uploadedImages = [];
            
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                
                toast({
                    title: "Feltöltés folyamatban...",
                    description: `Kép ${i + 1}/${images.length} feltöltése...`,
                    status: "info",
                    duration: 2000,
                    isClosable: true,
                });

                try {
                    const uploadedImage = await apiClient.uploadPropertyImage(
                        propertyResult.id, 
                        image.file
                    );
                    uploadedImages.push(uploadedImage);
                    console.log(`Kép ${i + 1} feltöltve, ID:`, uploadedImage.id);
                } catch (error) {
                    console.error(`Kép ${i + 1} feltöltése sikertelen:`, error);
                    toast({
                        title: "Kép feltöltési hiba",
                        description: `A ${i + 1}. kép feltöltése sikertelen: ${error.message}`,
                        status: "warning",
                        duration: 4000,
                        isClosable: true,
                    });
                }
            }

            // LÉPÉS 3: Főkép beállítása (az első feltöltött kép, ami főképnek van jelölve)
            if (uploadedImages.length > 0) {
                const mainImageIndex = images.findIndex(img => img.isMain);
                const mainImage = uploadedImages[mainImageIndex >= 0 ? mainImageIndex : 0];
                
                console.log('LÉPÉS 3: Főkép beállítása, ID:', mainImage.id);
                try {
                    await apiClient.setMainPropertyImage(propertyResult.id, mainImage.id);
                    console.log('Főkép beállítva');
                } catch (error) {
                    console.error('Főkép beállítása sikertelen:', error);
                }
            }

            toast({
                title: "Sikeres feltöltés!",
                description: `Az ingatlan sikeresen fel lett töltve ${uploadedImages.length} képpel.`,
                status: "success",
                duration: 4000,
                isClosable: true,
            });
            
            // Átirányítás a lakások oldalra
            navigate("/properties");
        } catch (error) {
            console.error('Property létrehozási hiba:', error);
            toast({
                title: "Feltöltési hiba",
                description: error.message || "Ismeretlen hiba történt a property létrehozása során.",
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
            backgroundColor={pageBg}
            justifyContent="center"
            alignItems="flex-start"
            py={6}
            overflow="auto"
        >
            <Box width="100%" maxWidth="1400px" px={4}>
                <Heading color={headingColor} textAlign="center" mb={6}>Új ingatlan feltöltése</Heading>
                
                <Grid templateColumns={["1fr", "1fr", "1fr 2fr"]} gap={6}>
                    {/* Bal oldal - Képfeltöltés */}
                    <Box>
                        <VStack spacing={4} align="stretch" position="sticky" top="20px">
                            {/* Drag & Drop terület */}
                            <Box
                                border="2px dashed"
                                borderColor={isDragging ? dropzoneHoverBorderColor : dropzoneBorderColor}
                                borderRadius="md"
                                p={8}
                                textAlign="center"
                                bg={isDragging ? dropzoneHoverBg : dropzoneBg}
                                cursor="pointer"
                                transition="all 0.2s"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-input').click()}
                                _hover={{ borderColor: dropzoneHoverBorderColor, bg: dropzoneHoverBg }}
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
                                    <Text fontSize="sm" color={textMutedColor}>
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
                                                borderColor={img.isMain ? "yellow.500" : imagePreviewBorderColor}
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
                                    <Text fontSize="xs" color={textMutedColor} mt={2}>
                                        Kattints egy képre, hogy főképpé tedd
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </Box>

                    {/* Jobb oldal - Űrlap */}
                    <Box
                        backgroundColor={formBg}
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
                            <SimpleGrid columns={[1, 3]} spacing={4}>
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
                                <FormControl isRequired>
                                    <FormLabel>Irányítószám</FormLabel>
                                    <Input
                                        placeholder="pl. 1054"
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
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
                            <SimpleGrid columns={[1, 3]} spacing={4}>
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
                                    <FormLabel>Fürdőszobák száma</FormLabel>
                                    <NumberInput min={1}>
                                        <NumberInputField
                                            placeholder="1"
                                            value={bathroomCount}
                                            onChange={(e) => setBathroomCount(e.target.value)}
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

                             {/* Elérhetőség */}
                             <SimpleGrid columns={[1, 2]} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Elérhető ettől</FormLabel>
                                    <Input
                                        type="date"
                                        value={availableFrom}
                                        onChange={(e) => setAvailableFrom(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Elérhető eddig (nem kötelező)</FormLabel>
                                    <Input
                                        type="date"
                                        value={availableTo}
                                        onChange={(e) => setAvailableTo(e.target.value)}
                                        min={availableFrom} // Ne lehessen korábbi, mint a kezdő dátum
                                    />
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