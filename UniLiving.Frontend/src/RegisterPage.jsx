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
    useToast
} from "@chakra-ui/react";
import { FaUserAlt, FaLock, FaEnvelope, FaPhone } from "react-icons/fa";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { apiClient } from "./api/client";

const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);
const CFaEnvelope = chakra(FaEnvelope);
const CFaPhone = chakra(FaPhone);

// Debug
console.log("API URL:", import.meta.env.VITE_API_URL || 'http://localhost:5000');

export default function RegisterPage() {
    const toast = useToast();
    const navigate = useNavigate();
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false);
    const [passwordInputTimeout, setPasswordInputTimeout] = useState(null);
    const [userType, setUserType] = useState(null); // "renter" vagy "landlord"
    const [isLoading, setIsLoading] = useState(false);
    
    // Form fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [countryCode, setCountryCode] = useState("36");
    const [phone, setPhone] = useState("");

    const handleShowPasswordClick = () => setShowPassword(!showPassword);
    const handleShowConfirmPasswordClick = () => setShowConfirmPassword(!showConfirmPassword);

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        
        // Ha üres a mező, eltűnjön a megerősítés
        if (!e.target.value) {
            setShowConfirmPasswordField(false);
            if (passwordInputTimeout) {
                clearTimeout(passwordInputTimeout);
            }
            return;
        }
        
        // Töröljük az előző timeout-ot
        if (passwordInputTimeout) {
            clearTimeout(passwordInputTimeout);
        }
        
        // 500ms után jelenítjük meg a megerősítés mezőt
        const timeout = setTimeout(() => {
            if (e.target.value) {
                setShowConfirmPasswordField(true);
            }
        }, 500);
        
        setPasswordInputTimeout(timeout);
    };

    const handlePasswordBlur = () => {
        // Ha a felhasználó elhagyja a mezőt és van jelszó, megjelenik a megerősítés
        if (password) {
            setShowConfirmPasswordField(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validáció
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            toast({
                title: "Hiba",
                description: "Kérjük, töltse ki az összes mezőt.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Hiba",
                description: "A jelszavak nem egyeznek meg.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Hiba",
                description: "A jelszó legalább 6 karakterből kell, hogy álljon.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        // Role ID meghatározása
        const roleId = userType === "renter" ? 3 : 2;

        try {
            setIsLoading(true);
            console.log("Regisztrációs adat küldése:", {
                email,
                password,
                firstName,
                lastName,
                roleId,
            });
            await apiClient.register({
                email,
                password,
                firstName,
                lastName,
                roleId,
            });

            toast({
                title: "Sikeres regisztráció",
                description: "Üdvözöljük a UniLiving-nél!",
                status: "success",
                duration: 4000,
                isClosable: true,
            });

            // Átirányítás a bejelentkezés után
            navigate("/");
        } catch (error) {
            console.error("Regisztrációs hiba:", error);
            toast({
                title: "Regisztrációs hiba",
                description: error.message || "Valamilyen hiba történt a regisztráció során.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex
            width="100vw"
            minHeight="100vh"
            backgroundColor="gray.200"
            flexDirection="column"
        >
            <Navbar />
            <Flex
                flex={1}
                justifyContent="center"
                alignItems="center"
                py={6}
            >
            <Stack
                spacing={4}
                align="center"
                width="100%"
                maxWidth="468px"
                px={4}
            >
                <Avatar bg="yellow.500" size="lg" />
                <Heading color="black.600">Regisztráció</Heading>
                <Box width="100%">
                    {!userType ? (
                        // User Type Selection
                        <Stack
                            spacing={4}
                            p="1rem"
                            backgroundColor="whiteAlpha.900"
                            boxShadow="md"
                            align="center"
                        >
                            <Heading size="md" color="black.600">Miben segíthetünk?</Heading>
                            <Button
                                width="full"
                                colorScheme="yellow"
                                variant="solid"
                                onClick={() => setUserType("renter")}
                                py={6}
                            >
                                Lakást/Albérletet keresek
                            </Button>
                            <Button
                                width="full"
                                colorScheme="yellow"
                                variant="outline"
                                onClick={() => setUserType("landlord")}
                                py={6}
                            >
                                Kiadnám a lakásomat/szobámat
                            </Button>
                        </Stack>
                    ) : (
                        // Registration Form
                        <form onSubmit={handleSubmit}>
                            <Stack
                                spacing={4}
                                p="1rem"
                                backgroundColor="whiteAlpha.900"
                                boxShadow="md"
                            >
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setUserType(null)}
                                    alignSelf="flex-start"
                                    mb={2}
                                >
                                    ← Vissza
                                </Button>
                                <FormControl>
                                    <Stack direction={["column", "column", "row"]} spacing={2}>
                                        <Box flex={1}>
                                            <InputGroup>
                                                <InputLeftElement
                                                    pointerEvents="none"
                                                    children={<CFaUserAlt color="gray.300" />}
                                                />
                                                <Input 
                                                    type="text" 
                                                    placeholder="Keresztnév"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                />
                                            </InputGroup>
                                        </Box>
                                        <Box flex={1}>
                                            <InputGroup>
                                                <InputLeftElement
                                                    pointerEvents="none"
                                                    children={<CFaUserAlt color="gray.300" />}
                                                />
                                                <Input 
                                                    type="text" 
                                                    placeholder="Vezetéknév"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                />
                                            </InputGroup>
                                        </Box>
                                    </Stack>
                                </FormControl>
                                <FormControl>
                                    <InputGroup>
                                        <InputLeftElement
                                            pointerEvents="none"
                                            children={<CFaEnvelope color="gray.300" />}
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
                                    <Stack direction="row" spacing={2}>
                                        <Box flex="0 0 auto" width="100px">
                                            <InputGroup>
                                                <InputLeftElement
                                                    pointerEvents="none"
                                                    children={<span style={{ fontSize: "14px", color: "black" }}>+</span>}
                                                />
                                                <Input 
                                                    type="text" 
                                                    placeholder="36"
                                                    maxLength="3"
                                                    paddingLeft="24px"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Backspace" && e.target.selectionStart === 0) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                />
                                            </InputGroup>
                                        </Box>
                                        <Box flex="1">
                                            <Input type="tel" placeholder="Telefonszám" />
                                        </Box>
                                    </Stack>
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
                                            onChange={handlePasswordChange}
                                            onBlur={handlePasswordBlur}
                                        />
                                        <InputRightElement width="auto" pr={1}>
                                            <Button h="2rem" size="sm" onClick={handleShowPasswordClick}>
                                                {showPassword ? "Elrejtés" : "Megjelenítés"}
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>
                                {showConfirmPasswordField && (
                                    <FormControl
                                        style={{
                                            animation: "slideDown 0.3s ease-out",
                                        }}
                                    >
                                        <style>{`
                                            @keyframes slideDown {
                                                from {
                                                    opacity: 0;
                                                    transform: translateY(-10px);
                                                    max-height: 0;
                                                }
                                                to {
                                                    opacity: 1;
                                                    transform: translateY(0);
                                                    max-height: 100px;
                                                }
                                            }
                                        `}</style>
                                        <InputGroup>
                                            <InputLeftElement
                                                pointerEvents="none"
                                                color="gray.300"
                                                children={<CFaLock color="gray.300" />}
                                            />
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Jelszó megerősítése"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                            <InputRightElement width="auto" pr={1}>
                                                <Button h="2rem" size="sm" onClick={handleShowConfirmPasswordClick}>
                                                    {showConfirmPassword ? "Elrejtés" : "Megjelenítés"}
                                                </Button>
                                            </InputRightElement>
                                        </InputGroup>
                                    </FormControl>
                                )}
                                <Button
                                    borderRadius={0}
                                    type="submit"
                                    variant="solid"
                                    colorScheme="yellow"
                                    width="full"
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Regisztrálás folyamatban..." : "Regisztráció"}
                                </Button>
                            </Stack>
                        </form>
                    )}
                </Box>
                <Box textAlign="center" mt={6}>
                    <Heading size="sm" mb={3}>
                        Már van fiókod?
                    </Heading>
                    <Button
                        as={RouterLink}
                        to="/login"
                        colorScheme="yellow"
                        variant="outline"
                        width="full"
                    >
                        Bejelentkezés
                    </Button>
                </Box>
            </Stack>
            </Flex>
        </Flex>
    );
}
