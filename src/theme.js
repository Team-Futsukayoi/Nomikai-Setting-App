// src/theme.js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#FFF9E5',
      100: '#FFE999',
      200: '#FFE066',
      300: '#FFD700', // メインカラー
      400: '#FFC300',
      500: '#FFB100',
      600: '#FF9F00',
      700: '#FF8C00',
      800: '#FF7A00',
      900: '#FF6800',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
});

export default theme;
