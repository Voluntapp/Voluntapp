# Dark Mode Support

Voluntapp now supports dark mode on both iOS and Android! The app automatically adapts to your system theme settings.

## Features

- 🌓 **Automatic theme switching** - Follows your device's system appearance settings
- 🎨 **Themed colors** - All UI elements adapt to light/dark mode
- 📱 **iOS & Android support** - Works seamlessly on both platforms
- 🔄 **Real-time updates** - Theme changes instantly when you switch your system settings

## Color Palette

### Light Mode
- **Primary**: #FF8C42 (Vibrant Orange)
- **Background**: #FFFFFF (White)
- **Text**: #1A1A1A (Near Black)
- **Surface**: #F5F5F5 (Light Gray)

### Dark Mode
- **Primary**: #FF9F68 (Softer Orange - better for dark backgrounds)
- **Background**: #121212 (True Black)
- **Text**: #FFFFFF (White)
- **Surface**: #1E1E1E (Dark Gray)

## For Developers

### Using the Theme in Your Components

```tsx
import { useTheme } from '../src/theme/useTheme';

function MyComponent() {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        Hello, {isDark ? 'night' : 'day'}!
      </Text>
    </View>
  );
}
```

### Available Theme Properties

- `colors` - Object containing all theme colors
- `isDark` - Boolean indicating if dark mode is active
- `colorScheme` - String: 'light' | 'dark' | 'no-preference'

### Theme Colors

Access via `colors` object:
- `colors.primary` - Brand color
- `colors.background` - Main background
- `colors.surface` - Card/elevated surfaces
- `colors.text` - Primary text
- `colors.textSecondary` - Secondary text
- `colors.textTertiary` - Tertiary/disabled text
- `colors.border` - Border color
- `colors.shadow` - Shadow color
- `colors.success` / `colors.error` / `colors.warning` / `colors.info` - Status colors

## Testing Dark Mode

### iOS
1. Open Settings app
2. Go to Display & Brightness
3. Toggle between Light and Dark

### Android
1. Open Settings app
2. Go to Display
3. Toggle Dark theme

The app will automatically update in real-time!

## App Icon

The app features a fancy orange "V" logo that includes:
- Diagonal gradient background
- Glowing effects
- 3D shadowing
- Decorative accent
- Optimized for both light and dark home screens
