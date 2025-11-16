import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    yellow: {
      50: '#FFFFF0',
      100: '#FEFCBF',
      200: '#FAF089',
      300: '#F6E05E',
      400: '#ECC94B',
      500: '#D69E2E',
      600: '#B7791F',
      700: '#975A16',
      800: '#744210',
      900: '#5F370E',
    },
  },
  components: {
    Button: {
      variants: {
        solid: (props) => {
          if (props.colorScheme === 'yellow') {
            return {
              bg: props.colorMode === 'dark' ? 'yellow.600' : 'yellow.500',
              color: props.colorMode === 'dark' ? 'white' : 'yellow.900',
              _hover: {
                bg: props.colorMode === 'dark' ? 'yellow.500' : 'yellow.600',
              },
            };
          }
        },
        outline: (props) => {
            if (props.colorScheme === 'yellow') {
              return {
                borderColor: props.colorMode === 'dark' ? 'yellow.500' : 'yellow.500',
                color: props.colorMode === 'dark' ? 'yellow.500' : 'yellow.500',
                _hover: {
                  bg: props.colorMode === 'dark' ? 'yellow.500' : 'yellow.50',
                  color: props.colorMode === 'dark' ? 'white' : 'black',
                },
              };
            }
          },
      },
    },
  },
});

export default theme;
