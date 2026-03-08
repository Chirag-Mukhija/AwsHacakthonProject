import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ elevated = false, style, children, ...props }) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? colors.cardElevated : colors.card,
          borderColor: colors.border,
          borderWidth: isDark ? 1 : 0,
          shadowColor: isDark ? 'transparent' : '#000',
          shadowOpacity: elevated && !isDark ? 0.05 : 0,
          elevation: elevated && !isDark ? 2 : 0,
        },
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
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
});
