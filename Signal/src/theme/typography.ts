import { StyleSheet } from 'react-native';

export const Typography = {
    headingLarge: {
        fontSize: 32,
        fontWeight: '700' as const,
        lineHeight: 40,
        letterSpacing: 0.3,
    },
    headingMedium: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 32,
        letterSpacing: 0.2,
    },
    body: {
        fontSize: 17,
        fontWeight: '400' as const,
        lineHeight: 24,
        letterSpacing: 0,
    },
    caption: {
        fontSize: 13,
        fontWeight: '400' as const,
        lineHeight: 18,
        letterSpacing: -0.1,
    },
};

export const Spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
};

export const Radius = {
    s: 8,
    m: 16,
    l: 24,
    full: 9999,
};

export const Shadows = {
    light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dark: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
    },
};
