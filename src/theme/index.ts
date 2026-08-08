export const colors = {
  bg: '#0A0A0A',
  surface: '#141414',
  surfaceMid: '#1A1A1A',
  surfaceHigh: '#222222',
  surfaceElevated: '#2A2A2A',
  border: '#2E2E2E',
  borderFaint: '#1E1E1E',

  green: '#00C853',
  greenBright: '#69F0AE',
  greenDim: 'rgba(0, 200, 83, 0.12)',
  greenGlow: 'rgba(0, 200, 83, 0.25)',

  text: '#F5F5F5',
  textSecondary: '#9A9A9A',
  textTertiary: '#5A5A5A',

  red: '#FF3B30',
  redDim: 'rgba(255, 59, 48, 0.12)',
  blue: '#0A84FF',
  blueDim: 'rgba(10, 132, 255, 0.12)',
  orange: '#FF9F0A',
  orangeDim: 'rgba(255, 159, 10, 0.12)',
  purple: '#BF5AF2',
  purpleDim: 'rgba(191, 90, 242, 0.12)',
  teal: '#5AC8FA',
  tealDim: 'rgba(90, 200, 250, 0.12)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const font = {
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    hero: 42,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};
