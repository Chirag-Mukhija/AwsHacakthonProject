import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export interface ThemedViewProps extends ViewProps {
    colorType?: 'background' | 'card' | 'surface';
}

export const ThemedView: React.FC<ThemedViewProps> = ({ style, colorType = 'background', ...props }) => {
    const { colors } = useTheme();

    return (
        <View style={[{ backgroundColor: colors[colorType] }, style]} {...props} />
    );
};
