import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  IconButton,
  Divider,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { apiClient } from './api/client';

const CITIES = [
  'Ajka', 'Baja', 'Békéscsaba', 'Budaörs', 'Budapest', 'Cegléd', 'Debrecen', 
  'Dunakeszi', 'Dunaújváros', 'Eger', 'Esztergom', 'Gödöllő', 'Gyöngyös', 
  'Győr', 'Gyula', 'Hajdúböszörmény', 'Hódmezővásárhely', 'Jászberény', 
  'Kaposvár', 'Kecskemét', 'Keszthely', 'Kiskunfélegyháza', 'Kiskunhalas', 
  'Miskolc', 'Mosonmagyaróvár', 'Nagykanizsa', 'Nyíregyháza', 'Orosháza', 
  'Ózd', 'Pápa', 'Pécs', 'Salgótarján', 'Siófok', 'Szeged', 'Szekszárd', 
  'Szentendre', 'Szentes', 'Székesfehérvár', 'Szigetszentmiklós', 'Szolnok', 
  'Szombathely', 'Tatabánya', 'Vác', 'Veszprém', 'Zalaegerszeg'
];

const PreferencesPage = () => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMyPreferences();
      setSavedSearches(data);
    } catch (err) {
      toast({
        title: 'Hiba történt',
        description: 'Nem sikerült betölteni a kereséseket.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    cities: '',
    minPrice: '',
    maxPrice: '',
    minSize: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.cities && !formData.minPrice && !formData.maxPrice && !formData.minSize) {
      toast({
        title: 'Hiba',
        description: 'Kérjük adj meg legalább egy szűrési feltételt!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const payload = {
        cities: formData.cities || null,
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
        minSize: formData.minSize ? parseFloat(formData.minSize) : null,
      };
      const newSearch = await apiClient.addPreference(payload);
      setSavedSearches([...savedSearches, newSearch]);
      setFormData({ cities: '', minPrice: '', maxPrice: '', minSize: '' });
      
      toast({
        title: 'Sikeres mentés',
        description: 'A keresési preferenciát elmentettük.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Hiba történt',
        description: 'Nem sikerült elmenteni a preferenciát.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.deletePreference(id);
      setSavedSearches(savedSearches.filter((s) => s.id !== id));
      toast({
        title: 'Törölve',
        description: 'A mentett keresést eltávolítottuk.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Hiba történt',
        description: 'Nem sikerült törölni a preferenciát.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box p={8} maxW="container.lg" mx="auto">
      <Heading mb={6} color="yellow.500">Mentett keresések és Értesítések</Heading>
      <Text mb={8} color={textColor}>
        Állítsd be, hogy milyen paraméterű lakások érdekelnek, és mi azonnal értesítünk egy harang ikonon keresztül, ha a feltételeidnek megfelelő új hirdetés kerül fel!
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        {/* Új feltétel hozzáadása űrlap */}
        <Box as="form" onSubmit={handleSave} bg={bgColor} p={6} borderRadius="md" shadow="sm" borderWidth="1px">
          <Heading size="md" mb={4}>Új értesítés beállítása</Heading>
          
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Város / Megye</FormLabel>
              <Select placeholder="Válassz várost..." name="cities" value={formData.cities} onChange={handleChange}>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormControl>

            <HStack w="full">
              <FormControl>
                <FormLabel>Min. Ár (Ft)</FormLabel>
                <Input type="number" name="minPrice" value={formData.minPrice} onChange={handleChange} placeholder="Pl. 80000" />
              </FormControl>
              <FormControl>
                <FormLabel>Max. Ár (Ft)</FormLabel>
                <Input type="number" name="maxPrice" value={formData.maxPrice} onChange={handleChange} placeholder="Pl. 150000" />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Min. alapterület (m²)</FormLabel>
              <Input type="number" name="minSize" value={formData.minSize} onChange={handleChange} placeholder="Pl. 30" />
            </FormControl>

            <Button w="full" colorScheme="yellow" type="submit">
              Értesítést kérek
            </Button>
          </VStack>
        </Box>

        {/* Meglévő mentett keresések listája */}
        <Box>
          <Heading size="md" mb={4}>Aktív kereséseid</Heading>
          
          {savedSearches.length === 0 ? (
            <Text color={textColor}>Jelenleg nincsenek mentett kereséseid.</Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {savedSearches.map((search) => (
                <Card key={search.id} size="sm" variant="outline" bg={bgColor}>
                  <CardBody>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" color="yellow.500">
                          {search.cities || 'Bármely város'}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          Ár: {search.minPrice ? `${search.minPrice} Ft` : '0 Ft'} - {search.maxPrice ? `${search.maxPrice} Ft` : 'Bármennyi'}
                        </Text>
                        {search.minSize && (
                          <Text fontSize="sm" color={textColor}>
                            Méret: {search.minSize}+ m²
                          </Text>
                        )}
                      </VStack>
                      <IconButton
                        aria-label="Keresés törlése"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(search.id)}
                      />
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default PreferencesPage;
