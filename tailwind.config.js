/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ISKCON-inspired soft saffron palette
        saffron: {
          50: '#FFF8F1',
          100: '#FEEFDF',
          200: '#FBD9B4',
          300: '#F8BE81',
          400: '#F2A04E',
          500: '#EC8420', // primary
          600: '#D66E12',
          700: '#B1560F',
          800: '#8C4413',
          900: '#723913',
        },
        ink: {
          900: '#1F2430',
          700: '#3A4152',
          500: '#6B7280',
          400: '#9AA1AE',
        },
        cloud: {
          50: '#FFFFFF',
          100: '#FAFAFB',
          200: '#F3F4F6',
          300: '#E9EBEF',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
        '3xl': '16px',
      },
    },
  },
  plugins: [],
};
