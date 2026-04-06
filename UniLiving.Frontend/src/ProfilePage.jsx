import React, { useState, useEffect } from 'react';
import {
  Box, Container, VStack, Heading, FormControl, FormLabel, Input,
  Button, useToast, useColorModeValue, Divider, SimpleGrid, Spinner, Center
} from '@chakra-ui/react';
import { apiClient } from './api/client';
import { useAuth } from './AuthContext';

function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  
  const bg = useColorModeValue('white', 'gray.800');
  const pageBg = useColorModeValue('gray.50', 'gray.900');

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    id: 0,
    fullName: '',
    email: '',
    phoneNumber: '',
    roleName: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    if (user?.id) {
      apiClient.getUser(user.id)
        .then(data => {
          setProfileData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          toast({ title: 'Hiba a profil betöltésekor', status: 'error', duration: 3000 });
          setLoading(false);
        });
    }
  }, [user, toast]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await apiClient.updateUser(user.id, profileData);
      toast({ title: 'Profil sikeresen frissítve!', status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: 'Hiba a profil frissítésekor', description: err.message, status: 'error', duration: 3000 });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({ title: 'Az új jelszavak nem egyeznek!', status: 'warning', duration: 3000 });
      return;
    }

    setChangingPassword(true);
    try {
      await apiClient.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast({ title: 'Jelszó sikeresen megváltoztatva!', status: 'success', duration: 3000 });
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast({ title: 'Hiba a jelszó változtatásakor', description: err.message, status: 'error', duration: 3000 });
    } finally {
      setChangingPassword(false);
    }
  };

  if(!user) {
    return <Center h="100%"><Heading size="md">Kérlek jelentkezz be</Heading></Center>;
  }

  if (loading) {
    return <Center h="100%"><Spinner size="xl" color="yellow.500" /></Center>;
  }

  return (
    <Box w="100%" h="100%" overflowY="auto" bg={pageBg}>
      <Container maxW="container.md" py={12}>
        <VStack spacing={8} align="stretch" bg={bg} p={10} borderRadius="2xl" boxShadow="xl">
          
          <Heading as="h1" size="xl" color="yellow.500">
            Profil módosítása
          </Heading>

          <Box>
            <Heading as="h2" size="md" mb={4}>Személyes adatok</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>Teljes név</FormLabel>
                <Input name="fullName" value={profileData.fullName} onChange={handleProfileChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" value={profileData.email} onChange={handleProfileChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Telefonszám</FormLabel>
                <Input name="phoneNumber" value={profileData.phoneNumber || ''} onChange={handleProfileChange} />
              </FormControl>
            </SimpleGrid>
            <Button
              mt={6}
              colorScheme="yellow"
              isLoading={savingProfile}
              onClick={saveProfile}
            >
              Adatok mentése
            </Button>
          </Box>

          <Divider />

          <Box>
            <Heading as="h2" size="md" mb={4}>Jelszó módosítása</Heading>
            <VStack spacing={4} align="stretch" maxW="sm">
              <FormControl>
                <FormLabel>Jelenlegi jelszó</FormLabel>
                <Input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Új jelszó</FormLabel>
                <Input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Új jelszó megerősítése</FormLabel>
                <Input type="password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} />
              </FormControl>
            </VStack>
            <Button
              mt={6}
              colorScheme="red"
              variant="outline"
              isLoading={changingPassword}
              onClick={changePassword}
            >
              Jelszó megváltoztatása
            </Button>
          </Box>

        </VStack>
      </Container>
    </Box>
  );
}

export default ProfilePage;