import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';

interface TypographyProps extends TextProps {
  variant?: keyof typeof typography;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  align = 'auto',
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        typography[variant],
        { color: color || colors.text, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
