export const colors = {
  bg: '#F6F7F6',
  surface: '#FFFFFF',
  surfaceMid: '#F3F5F3',
  surfaceHigh: '#ECEFEC',
  surfaceElevated: '#E1E6E1',
  border: '#D7DDD7',
  borderFaint: '#E8ECE8',

  green: '#43B02A',
  greenBright: '#52C435',
  greenDeep: '#00573F',
  greenDark: '#004C23',
  greenDim: 'rgba(67, 176, 42, 0.12)',
  greenGlow: 'rgba(67, 176, 42, 0.24)',

  white: '#FFFFFF',
  text: '#202420',
  textSecondary: '#56605A',
  textTertiary: '#7D8780',

  red: '#D74631',
  redDim: 'rgba(215, 70, 49, 0.12)',
  blue: '#68C4D0',
  blueDim: 'rgba(104, 196, 208, 0.18)',
  orange: '#F15A24',
  orangeDim: 'rgba(241, 90, 36, 0.12)',
  purple: '#C24C87',
  purpleDim: 'rgba(194, 76, 135, 0.12)',
  teal: '#319D98',
  tealDim: 'rgba(49, 157, 152, 0.12)',
  yellow: '#FFE500',
  yellowDim: 'rgba(255, 229, 0, 0.22)',
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
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const font = {
  body: {
    light: 'Inter_300Light',
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
  },
  headline: {
    regular: 'Inter_400Regular',
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
