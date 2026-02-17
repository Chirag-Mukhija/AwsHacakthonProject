import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../theme/typography';

export interface ThemedTextProps extends TextProps {
    variant?: keyof typeof Typography;
    color?: string; // Explicit color override
    secondary?: boolean; // Use secondary text color
}

export const ThemedText: React.FC<ThemedTextProps> = ({
    style,
    variant = 'body',
    color,
    secondary = false,
    ...props
}) => {
    const { colors } = useTheme();

    const textColor = color || (secondary ? colors.textSecondary : colors.textPrimary);
    const typographyStyle = Typography[variant];

    return (
        <Text
            style={[
                { color: textColor },
                typographyStyle,
                style,
            ]}
            {...props}
        />
    );
};
