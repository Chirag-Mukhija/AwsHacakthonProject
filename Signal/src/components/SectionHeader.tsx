import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { Spacing } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';

interface SectionHeaderProps {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    actionLabel,
    onAction,
}) => {
    const { colors } = useTheme();
    return (
        <View style={styles.container}>
            <ThemedText variant="headingMedium" style={styles.title}>
                {title}
            </ThemedText>
            {actionLabel && onAction && (
                <TouchableOpacity onPress={onAction}>
                    <ThemedText variant="body" color={colors.accent}>
                        {actionLabel}
                    </ThemedText>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.s,
        marginTop: Spacing.m,
    },
    title: {
        flex: 1,
    },
});
