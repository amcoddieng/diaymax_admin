// Color Palette inspired by Emerald theme
export const colors = {
  // Primary Colors - Emerald
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Primary Emerald
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // CTA (Call to Action) - Gold/Amber
  cta: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // CTA Gold
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Secondary - Sage Green
  secondary: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096', // Secondary Sage
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },
  
  // Accent - Deep Teal
  accent: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Accent Teal
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  
  // Background Colors
  background: {
    light: '#ffffff',
    dark: '#1a1a1a',
    gray: '#f8fafc',
  },
  
  // Text Colors
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    light: '#9ca3af',
    white: '#ffffff',
  },
  
  // White
  white: '#ffffff',
  
  // Status Colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Debug Colors
  debug: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    800: '#075985',
  }
};

// Tailwind CSS custom colors configuration
export const tailwindColors = {
  primary: colors.primary,
  cta: colors.cta,
  secondary: colors.secondary,
  accent: colors.accent,
  'bg-light': colors.background.light,
  'bg-dark': colors.background.dark,
  'bg-gray': colors.background.gray,
  'text-primary': colors.text.primary,
  'text-secondary': colors.text.secondary,
  'text-light': colors.text.light,
  'success': colors.status.success,
  'warning': colors.status.warning,
  'error': colors.status.error,
  'info': colors.status.info,
  'debug': colors.debug,
};
