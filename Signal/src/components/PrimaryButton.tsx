import React from 'react';
import { TouchableOpacity, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ThemedText } from './ThemedText';
import { Radius, Spacing } from '../theme/typography';

interface PrimaryButtonProps extends TouchableOpacityProps {
    label: string;
    onPress: () => void;
    loading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    label,
    onPress,
    loading = false,
    style,
    disabled,
    ...props
}) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                { backgroundColor: disabled ? colors.border : colors.primary },
                style,
            ]}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <ThemedText
                    variant="headingMedium"
                    style={{ color: '#FFFFFF', fontSize: 17 }} // Always white for primary? Or based on contrast? Assuming white for now.
                >
                    {label}
                </ThemedText>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 56,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.l,
    },
});
