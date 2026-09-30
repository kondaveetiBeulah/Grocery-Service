import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    fontFamily,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    fontFamily,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    fontFamily,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    fontFamily,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    fontFamily,
  },
  bodyLargeBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    fontFamily,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    fontFamily,
  },
  bodyMediumBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    fontFamily,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    fontFamily,
  },
  bodySmallBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    fontFamily,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    fontFamily,
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    fontFamily,
    letterSpacing: 0.1,
  },
  counter: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    fontFamily,
  },
};
