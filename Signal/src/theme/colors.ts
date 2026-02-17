export const Colors = {
  light: {
    background: '#F7F8FA',
    card: '#FFFFFF',
    primary: '#1E2A78',
    accent: '#4FC3F7',
    textPrimary: '#111111',
    textSecondary: '#6B6B6B',
    success: '#34C759',
    warning: '#FF9F0A',
    error: '#FF3B30',
    border: '#E5E5EA',
    surface: '#FFFFFF',
  },
  dark: {
    background: '#0F1115',
    card: '#1A1C22',
    primary: '#4FC3F7',
    accent: '#7FD8FF',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    success: '#30D158',
    warning: '#FFB340',
    error: '#FF453A',
    border: '#2C2C2E',
    surface: '#1C1C1E',
  },
};

export type ThemeColors = typeof Colors.light;
