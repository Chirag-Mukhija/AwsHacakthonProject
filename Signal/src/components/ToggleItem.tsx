import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/typography';

interface ToggleItemProps {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

export const ToggleItem: React.FC<ToggleItemProps> = ({
    label,
    value,
    onValueChange,
}) => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <ThemedText variant="body">{label}</ThemedText>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={'#FFFFFF'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.s,
    },
});
