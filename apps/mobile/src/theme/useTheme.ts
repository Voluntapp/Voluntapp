import { useColorScheme } from 'react-native';
import { Colors, ThemeColors } from './colors';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors: ThemeColors = isDark ? Colors.dark : Colors.light;

  return {
    colors,
    isDark,
    colorScheme,
  };
}
