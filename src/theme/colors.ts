export const lightColors = {
  background: '#FFFFFF',
  card: '#F3F4F6',
  cardElevated: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  primary: '#000000', // Apple-like black for primary in light mode or vibrant
  primaryAction: '#3B82F6', // Action blue
  border: '#E5E7EB',
  success: '#10B981',
  danger: '#EF4444',
  icon: '#374151',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const darkColors = {
  background: '#09090B', // Very dark gray/black
  card: '#18181B',
  cardElevated: '#27272A',
  text: '#FAFAFA',
  textSecondary: '#A1A1AA',
  primary: '#FFFFFF', // White for primary in dark mode
  primaryAction: '#60A5FA',
  border: '#27272A',
  success: '#34D399',
  danger: '#F87171',
  icon: '#E4E4E7',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type Colors = typeof lightColors;
