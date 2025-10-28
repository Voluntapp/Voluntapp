export const Colors = {
  light: {
    // Primary brand colors
    primary: '#FF8C42',
    primaryDark: '#FF6B35',
    primaryLight: '#FF9F68',
    
    // Backgrounds
    background: '#FFFFFF',
    surface: '#F5F5F5',
    card: '#FFFFFF',
    
    // Text
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    
    // UI Elements
    border: '#E0E0E0',
    divider: '#EEEEEE',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
    
    // Interactive
    link: '#2196F3',
    disabled: '#BDBDBD',
  },
  dark: {
    // Primary brand colors (slightly adjusted for dark mode)
    primary: '#FF9F68',
    primaryDark: '#FF8C42',
    primaryLight: '#FFB88C',
    
    // Backgrounds
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2A2A2A',
    
    // Text
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#808080',
    
    // UI Elements
    border: '#3A3A3A',
    divider: '#2A2A2A',
    shadow: 'rgba(0, 0, 0, 0.5)',
    
    // Status colors (adjusted for dark mode)
    success: '#66BB6A',
    warning: '#FFD54F',
    error: '#EF5350',
    info: '#42A5F5',
    
    // Interactive
    link: '#64B5F6',
    disabled: '#4A4A4A',
  },
};

export type ThemeColors = typeof Colors.light;
