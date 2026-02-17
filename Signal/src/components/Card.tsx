import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Shadows, Spacing } from '../theme/typography';

interface CardProps extends ViewProps {
    children: React.ReactNode;
    variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'elevated',
    ...props
}) => {
    const { colors, theme } = useTheme();

    const shadowStyle = variant === 'elevated' ? Shadows[theme] : {};
    const borderStyle =
        variant === 'outlined' ? { borderWidth: 1, borderColor: colors.border } : {};

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: colors.card, borderRadius: Radius.m },
                shadowStyle,
                borderStyle,
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: Spacing.m,
        marginBottom: Spacing.m,
    },
});
