import React from 'react';
import { ChakraProvider, Flex, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import PropertiesPage from './PropertiesPage';
import UploadPropertyPage from './UploadPropertyPage';
import PropertyOverviewPage from './PropertyOverviewPage';
import ChatsPage from './ChatsPage';
import PreferencesPage from './PreferencesPage';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';
import Navbar from './Navbar';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  duration: 0.5,
  ease: 'easeInOut',
};

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{ width: '100%', height: '100%' }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/property/:id" element={<PropertyOverviewPage />} />
          <Route path="/upload" element={<UploadPropertyPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Flex direction="column" height="100vh" overflow="hidden">
            <Navbar />
            <Box flex="1" overflow="hidden" position="relative">
              <AppRoutes />
            </Box>
          </Flex>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
