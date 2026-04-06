import { useState, useEffect } from "react";
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
    Spinner,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "./api/client";
import { useAuth } from "./AuthContext";

export default function UploadPropertyPage() {
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams(); // Property ID a szerkesztéshez
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [initialDataLoading, setInitialDataLoading] = useState(false);

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

    // Szerkesztési mód inicializálása
    useEffect(() => {
        if (id) {
            setIsEditing(true);
            loadPropertyForEdit(id);
        }
    }, [id]);

    // Ingatlan betöltése szerkesztéshez
    const loadPropertyForEdit = async (propertyId) => {
        try {
            setInitialDataLoading(true);
            const property = await apiClient.getProperty(propertyId);
            
            // Ellenőrizzük, hogy a felhasználó a tulajdonos-e
            if (property.ownerId !== user?.id && property.owner?.id !== user?.id) {
                toast({
                    title: "Hiba",
                    description: "Csak a saját hirdetéseidet szerkesztheted.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                navigate('/properties');
                return;
            }

            // Alapadatok betöltése
            setTitle(property.title || "");
            setDescription(property.description || "");
            setAddress(property.address || "");
            setCity(property.city || "");
            setPostalCode(property.postalCode || "");
            setPrice(property.price?.toString() || "");
            setCurrency(property.currency || "HUF");
            setSize(property.size?.toString() || "");
            setRoomCount(property.roomCount?.toString() || "");
            setBathroomCount(property.bathroomCount?.toString() || "");
            setCategoryId(property.categoryId?.toString() || "");
            
            // Dátumok formázása
            if (property.availableFrom) {
                const date = new Date(property.availableFrom);
                setAvailableFrom(date.toISOString().split('T')[0]);
            }
            if (property.availableTo) {
                const date = new Date(property.availableTo);
                setAvailableTo(date.toISOString().split('T')[0]);
            }

            // Boolean mezők
            setHasBalcony(property.hasBalcony || false);
            setHasParking(property.hasParking || false);
            setHasElevator(property.hasElevator || false);
            setPetsAllowed(property.petsAllowed || false);
            setSmokingAllowed(property.smokingAllowed || false);

            // Képek betöltése (csak preview, a fájlok maradnak a szerveren)
            if (property.images && property.images.length > 0) {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7177';
                const loadedImages = property.images.map((img, index) => ({
                    id: img.id,
                    preview: `${API_BASE_URL}/uploads/properties/prop_${propertyId}/${img.filePath}`,
                    isMain: img.isMainImage || index === 0,
                    existing: true // Jelölés, hogy meglévő kép
                }));
                setImages(loadedImages);
                const mainIndex = loadedImages.findIndex(img => img.isMain);
                setMainImageIndex(mainIndex >= 0 ? mainIndex : 0);
            }
            
        } catch (error) {
            console.error('Property betöltési hiba:', error);
            toast({
                title: "Hiba",
                description: "A hirdetés adatai nem tölthetők be.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            navigate('/properties');
        } finally {
            setInitialDataLoading(false);
        }
    };

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
                setImages(prev => {
                    const newImages = [...prev, {
                        file: file,
                        preview: e.target.result,
                        isMain: prev.length === 0 && !prev.some(img => img.isMain), // Csak akkor legyen főkép, ha még nincs
                        existing: false
                    }];
                    return newImages;
                });
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
            
            // Ha a fő képet töröltük és van még kép, az első legyen az új fő kép
            if (prev[index]?.isMain && newImages.length > 0) {
                newImages[0].isMain = true;
                setMainImageIndex(0);
            } else {
                // Újraszámoljuk a főkép indexét
                const newMainIndex = newImages.findIndex(img => img.isMain);
                setMainImageIndex(newMainIndex >= 0 ? newMainIndex : 0);
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
        if (!title?.trim() || !description?.trim() || !address?.trim() || !city?.trim() || !postalCode?.trim() || !price || !size || !roomCount || !bathroomCount || !categoryId || !availableFrom) {
            toast({
                title: "Hiba",
                description: "Kérjük, töltse ki az összes kötelező mezőt.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        // Dátum validáció
        if (availableTo && availableFrom && new Date(availableTo) <= new Date(availableFrom)) {
            toast({
                title: "Hiba",
                description: "A 'Elérhető eddig' dátum nem lehet korábbi, mint a 'Elérhető től' dátum.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        // Numerikus értékek validációja
        const numericPrice = parseFloat(price);
        const numericSize = parseFloat(size);
        const numericRoomCount = parseInt(roomCount);
        const numericBathroomCount = parseInt(bathroomCount);
        const numericCategoryId = parseInt(categoryId);

        if (isNaN(numericPrice) || numericPrice <= 0) {
            toast({
                title: "Hiba",
                description: "Az árat helyesen töltse ki (pozitív szám).",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        if (isNaN(numericSize) || numericSize <= 0) {
            toast({
                title: "Hiba",
                description: "A méret helyes megadása szükséges (pozitív szám).",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        if (isNaN(numericRoomCount) || numericRoomCount <= 0) {
            toast({
                title: "Hiba",
                description: "A szobák számát helyesen töltse ki (pozitív egész szám).",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        if (isNaN(numericBathroomCount) || numericBathroomCount < 0) {
            toast({
                title: "Hiba",
                description: "A fürdőszobák számát helyesen töltse ki (nem negatív egész szám).",
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

        // Kép fájlméret ellenőrzés (max 10 MB / kép) - csak az új képeknél
        const maxSizeMB = 10;
        const newImages = images.filter(img => !img.existing);
        const oversizedImages = newImages.filter(img => img.file && img.file.size > maxSizeMB * 1024 * 1024);
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
            // Property adatok
            const propertyData = {
            title: title.trim(),
            description: description.trim(),
            address: address.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
            price: numericPrice,
            currency: currency.trim(),
            size: numericSize,
            roomCount: numericRoomCount,
            bathroomCount: numericBathroomCount,
            availableFrom: availableFrom || null,
            availableTo: availableTo || null,
            categoryId: numericCategoryId,
                hasBalcony,
                hasParking,
                hasElevator,
                petsAllowed,
                smokingAllowed,
            };

            let propertyResult;

            if (isEditing) {
                // SZERKESZTÉSI MÓD - property frissítése
                console.log('Property frissítése...');
                console.log('Property ID:', id);
                console.log('User ID:', user?.id);
                
                // Explicit update objektum csak a szükséges mezőkkel
                const updateData = {
                    title: title.trim(),
                    description: description.trim(),
                    address: address.trim(),
                    city: city.trim(),
                    postalCode: postalCode.trim(),
                    price: numericPrice,
                    currency: currency.trim(),
                    size: numericSize,
                    roomCount: numericRoomCount,
                    bathroomCount: numericBathroomCount,
                    availableFrom: availableFrom || null,
                    availableTo: availableTo || null,
                    categoryId: numericCategoryId,
                    hasBalcony,
                    hasParking,
                    hasElevator,
                    petsAllowed,
                    smokingAllowed,
                };
                
                console.log('Update data:', JSON.stringify(updateData, null, 2));
                
                await apiClient.updateProperty(id, updateData);
                propertyResult = { id };
                
                toast({
                    title: "Sikeres frissítés",
                    description: "A hirdetés adatai frissítve lettek.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                // ÚJ LÉTREHOZÁS - property létrehozása
                console.log('LÉPÉS 1: Property létrehozása...', propertyData);
                propertyResult = await apiClient.createProperty(propertyData);
                console.log('Property létrehozva, ID:', propertyResult.id);
            }

            // Képek kezelése
            const newImagesToUpload = images.filter(img => !img.existing);
            
            if (newImagesToUpload.length > 0) {
                console.log(`Új képek feltöltése: ${newImagesToUpload.length} db`);
                const uploadedImages = [];
                
                for (let i = 0; i < newImagesToUpload.length; i++) {
                    const image = newImagesToUpload[i];
                    
                    toast({
                        title: "Feltöltés folyamatban...",
                        description: `Kép ${i + 1}/${newImagesToUpload.length} feltöltése...`,
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
            }

            // Főkép beállítása
            const mainImage = images.find(img => img.isMain);
            if (mainImage && (mainImage.id || !mainImage.existing)) {
                console.log('Főkép beállítása...');
                try {
                    if (mainImage.existing && mainImage.id) {
                        // Meglévő kép beállítása főképnek
                        await apiClient.setMainPropertyImage(propertyResult.id, mainImage.id);
                    } else {
                        // Újonnan feltöltött kép főképnek való beállítása még nem implementált
                        console.log('Új főkép beállítása szükséges, de nincs implementálva');
                    }
                } catch (error) {
                    console.error('Főkép beállítási hiba:', error);
                }
            }

            const actionText = isEditing ? "frissítve" : "feltöltve";
            const successTitle = isEditing ? "Sikeres frissítés!" : "Sikeres feltöltés!";
            
            if (!isEditing) {
                toast({
                    title: successTitle,
                    description: `Az ingatlan sikeresen fel lett töltve.`,
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                });
            }
            
            // Átirányítás
            navigate(isEditing ? `/property/${id}` : "/properties");
        } catch (error) {
            console.error('Property művelet hiba:', error);
            let errorMessage = "Ismeretlen hiba történt.";
            
            if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'object') {
                errorMessage = JSON.stringify(error);
            } else {
                errorMessage = String(error);
            }
            
            toast({
                title: isEditing ? "Frissítési hiba" : "Feltöltési hiba",
                description: errorMessage,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Betöltési állapot megjelenítése
    if (initialDataLoading) {
        return (
            <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <Spinner size="xl" color="yellow.500" />
                <Text ml={4}>Hirdetés betöltése...</Text>
            </Box>
        );
    }

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
                <Heading color={headingColor} textAlign="center" mb={6}>
                    {isEditing ? "Hirdetés módosítása" : "Új ingatlan feltöltése"}
                </Heading>
                
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
                                {isEditing ? "Módosítások mentése" : "Ingatlan feltöltése"}
                            </Button>
                            </VStack>
                        </form>
                    </Box>
                </Grid>
            </Box>
        </Flex>
    );
}