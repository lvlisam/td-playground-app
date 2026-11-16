export const colors = {
  bg: '#F6F7F4',
  surface: '#FFFFFF',
  surfaceMid: '#F3F5F3',
  surfaceHigh: '#ECEFEC',
  surfaceElevated: '#E1E6E1',
  border: '#E5E8E3',
  borderFaint: '#E5E8E3',

  green: '#35C600',
  greenDeep: '#238B14',
  greenDim: '#EAF6E6',
  greenGlow: 'rgba(53, 198, 0, 0.24)',

  white: '#FFFFFF',
  text: '#1C1C1C',
  textSecondary: '#666A66',
  textTertiary: '#7D8780',

  red: '#D74631',
  redDim: 'rgba(215, 70, 49, 0.12)',
  blue: '#68C4D0',
  blueDim: '#E5F3F5',
  orange: '#F15A24',
  orangeDim: 'rgba(241, 90, 36, 0.12)',
  purple: '#C24C87',
  purpleDim: '#FDE5EF',
  teal: '#319D98',
  tealDim: '#E5F3F5',
  yellow: '#FFE500',
  yellowDim: '#FFF5B6',
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
    light: 'TDSansBodyLight',
    lightItalic: 'TDSansBodyLightItalic',
    regular: 'TDSansBodyRegular',
    italic: 'TDSansBodyItalic',
    medium: 'TDSansBodyMedium',
    mediumItalic: 'TDSansBodyMediumItalic',
    bold: 'TDSansBodyBold',
    boldItalic: 'TDSansBodyBoldItalic',
  },
  headline: {
    light: 'TDSansHeadlineLight',
    lightItalic: 'TDSansHeadlineLightItalic',
    regular: 'TDSansHeadlineRegular',
    regularItalic: 'TDSansHeadlineItalic',
    italic: 'TDSansHeadlineItalic',
    medium: 'TDSansHeadlineRegular',
    semibold: 'TDSansHeadlineBold',
    bold: 'TDSansHeadlineBold',
    boldItalic: 'TDSansHeadlineBoldItalic',
    heavy: 'TDSansHeadlineBold',
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
