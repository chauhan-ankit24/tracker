/**
 * Central palette. Kept in sync with tailwind.config.js so that non-className
 * consumers (charts, status bar, gradients) share the same values.
 */
export const colors = {
  saffron: {
    50: '#FFF8F1',
    100: '#FEEFDF',
    200: '#FBD9B4',
    300: '#F8BE81',
    400: '#F2A04E',
    500: '#EC8420',
    600: '#D66E12',
    700: '#B1560F',
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
  white: '#FFFFFF',
} as const;

export const primary = colors.saffron[500];
