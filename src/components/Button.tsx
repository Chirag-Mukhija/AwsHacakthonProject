import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from './Typography';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  containerStyle,
  disabled,
  ...props
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'primary': return colors.primaryAction;
      case 'secondary': return colors.cardElevated;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return colors.primaryAction;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    switch (variant) {
      case 'primary': return colors.white;
      case 'secondary': return colors.text;
      case 'outline': return colors.primaryAction;
      case 'ghost': return colors.text;
      default: return colors.white;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return colors.primaryAction;
    return 'transparent';
  };

  const getHeight = () => {
    switch (size) {
      case 'small': return 36;
      case 'large': return 56;
      case 'medium':
      default: return 48;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          height: getHeight(),
          opacity: disabled ? 0.6 : 1,
        },
        containerStyle,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon}
          {title && (
            <Typography
              variant="body"
              color={getTextColor()}
              style={{ fontWeight: '600', marginLeft: icon ? 8 : 0 }}
            >
              {title}
            </Typography>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
});
