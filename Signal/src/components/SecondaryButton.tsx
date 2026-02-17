import React from 'react';
import { TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ThemedText } from './ThemedText';
import { Radius, Spacing } from '../theme/typography';

interface SecondaryButtonProps extends TouchableOpacityProps {
    label: string;
    onPress: () => void;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
    label,
    onPress,
    style,
    ...props
}) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.button,
                { borderColor: colors.border, borderWidth: 1 },
                style,
            ]}
            activeOpacity={0.6}
            {...props}
        >
            <ThemedText variant="body" color={colors.textSecondary}>
                {label}
            </ThemedText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 48,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.l,
    },
});
