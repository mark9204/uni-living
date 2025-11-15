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
    InputRightElement
} from "@chakra-ui/react";
import { FaUserAlt, FaLock, FaEnvelope, FaPhone } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import Navbar from "./Navbar";

const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);
const CFaEnvelope = chakra(FaEnvelope);
const CFaPhone = chakra(FaPhone);

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false);
    const [passwordInputTimeout, setPasswordInputTimeout] = useState(null);

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
                    <form>
                        <Stack
                            spacing={4}
                            p="1rem"
                            backgroundColor="whiteAlpha.900"
                            boxShadow="md"
                        >
                            <FormControl>
                                <Stack direction={["column", "column", "row"]} spacing={2}>
                                    <Box flex={1}>
                                        <InputGroup>
                                            <InputLeftElement
                                                pointerEvents="none"
                                                children={<CFaUserAlt color="gray.300" />}
                                            />
                                            <Input type="text" placeholder="Keresztnév" />
                                        </InputGroup>
                                    </Box>
                                    <Box flex={1}>
                                        <InputGroup>
                                            <InputLeftElement
                                                pointerEvents="none"
                                                children={<CFaUserAlt color="gray.300" />}
                                            />
                                            <Input type="text" placeholder="Vezetéknév" />
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
                                    <Input type="email" placeholder="E-mail cím" />
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
                                                    // Megakadályozzuk a backspace-t az első pozícióban
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
                            >
                                Regisztráció
                            </Button>
                        </Stack>
                    </form>
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
