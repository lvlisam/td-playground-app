export const colors = {
  bg: '#F4F5F3',
  surface: '#FFFFFF',
  surfaceMid: '#F7F8F7',
  surfaceHigh: '#EDF0ED',
  surfaceElevated: '#E3E8E3',
  border: '#DDE2DD',
  borderFaint: '#E9ECE9',

  green: '#46B649',
  greenBright: '#7AD66F',
  greenDim: 'rgba(70, 182, 73, 0.12)',
  greenGlow: 'rgba(70, 182, 73, 0.25)',

  text: '#161917',
  textSecondary: '#6A716B',
  textTertiary: '#8B928C',

  red: '#D74631',
  redDim: 'rgba(215, 70, 49, 0.12)',
  blue: '#46B649',
  blueDim: 'rgba(70, 182, 73, 0.12)',
  orange: '#46B649',
  orangeDim: 'rgba(70, 182, 73, 0.12)',
  purple: '#46B649',
  purpleDim: 'rgba(70, 182, 73, 0.12)',
  teal: '#46B649',
  tealDim: 'rgba(70, 182, 73, 0.12)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const font = {
  headline: {
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    heavy: 'Inter_800ExtraBold',
  },
  size: {
    xs: 12,
    sm: 14,
    base: 15,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 30,
    hero: 40,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};
