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
import { FaUserAlt, FaLock } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import Navbar from "./Navbar";

const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    const handleShowClick = () => setShowPassword(!showPassword);

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
            >
            <Stack
                spacing={4}
                align="center"
                width="100%"
                maxWidth="468px"
                px={4}
            >
                <Avatar bg="yellow.500" size="lg" />
                <Heading color="black.600" textOutline="10px solid" textOutlineColor="black.600">Üdvözöljük</Heading>
                <Box width="100%">
                    <form>
                        <Stack
                            spacing={4}
                            p="1rem"
                            backgroundColor="whiteAlpha.900"
                            boxShadow="md"
                        >
                            <FormControl>
                                <InputGroup>
                                    <InputLeftElement
                                        pointerEvents="none"
                                        children={<CFaUserAlt color="gray.300" />}
                                    />
                                    <Input type="email" placeholder="E-mail cím" />
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
        </Flex>
    );
}
