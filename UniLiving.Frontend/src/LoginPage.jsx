import { useState } from "react";
import {
    Flex,
    Heading,
    Input,
    Button,
    InputGroup,
    Stack,
    InputLeftElement,
    chakra,
    Box,
    Link,
    Avatar,
    FormControl,
    FormHelperText,
    InputRightElement,
    useToast,
    useColorModeValue
} from "@chakra-ui/react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { apiClient } from "./api/client";

import { useAuth } from "./AuthContext";

const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const { login } = useAuth();
    const formBackground = useColorModeValue("whiteAlpha.900", "gray.700");
    const pageBg = useColorModeValue("gray.200", "gray.800");
    const headingColor = useColorModeValue("black.600", "white");

    const handleShowClick = () => setShowPassword(!showPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast({
                title: "Hiba",
                description: "Kérjük, töltse ki mindkét mezőt.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        setIsLoading(true);
        try {
            const result = await apiClient.login({ email, password });
            console.log('Login result:', result);
            const token = result.accessToken || result.token;
            const refreshToken = result.refreshToken;
            console.log('Token:', token);
            console.log('RefreshToken:', refreshToken);
            login(token, refreshToken);
            toast({
                title: "Sikeres bejelentkezés",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate("/");
        } catch (error) {
            toast({
                title: "Bejelentkezési hiba",
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
            backgroundColor={pageBg}
            justifyContent="center"
            alignItems="center"
            overflow="auto"
        >
            <Stack
                spacing={4}
                align="center"
                width="100%"
                maxWidth="468px"
                px={4}
            >
                <Avatar bg="yellow.500" size="lg" />
                <Heading color={headingColor}>Üdvözöljük</Heading>
                <Box width="100%">
                    <form onSubmit={handleSubmit}>
                        <Stack
                            spacing={4}
                            p="1rem"
                            backgroundColor={formBackground}
                            boxShadow="md"
                        >
                            <FormControl>
                                <InputGroup>
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<CFaUserAlt color="gray.300" />}
                                    />
                                    <Input 
                                        type="email" 
                                        placeholder="E-mail cím" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </InputGroup>
                            </FormControl>
                            <FormControl>
                                <InputGroup>
                                    <InputLeftElement
                                        pointerEvents="none"
                                        color="gray.300"
                                        children={<CFaLock color="gray.300" />}
                                    />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Jelszó"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <InputRightElement width="auto" pr={1}>
                                        <Button h="2rem" size="sm" onClick={handleShowClick}>
                                            {showPassword ? "Elrejtés" : "Megjelenítés"}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                                <FormHelperText textAlign="right">
                                    <Link>Elfelejtetted a jelszavad?</Link>
                                </FormHelperText>
                            </FormControl>
                            <Button
                                borderRadius={0}
                                type="submit"
                                variant="solid"
                                colorScheme="yellow"
                                width="full"
                                isLoading={isLoading}
                            >
                                Bejelentkezés
                            </Button>
                        </Stack>
                    </form>
                </Box>
                <Box textAlign="center" mt={6}>
                    <Heading size="sm" mb={3}>
                        Még nem vagy nálunk tag?
                    </Heading>
                    <Button
                        as={RouterLink}
                        to="/register"
                        colorScheme="yellow"
                        variant="outline"
                        width="full"
                    >
                        Regisztráció
                    </Button>
                </Box>
            </Stack>
        </Flex>
    );
}
