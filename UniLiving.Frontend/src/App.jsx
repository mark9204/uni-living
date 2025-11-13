import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import LoginPage from './LoginPage';

function App() {
  return (
    <ChakraProvider>
      <LoginPage />
    </ChakraProvider>
  );
}

export default App;
