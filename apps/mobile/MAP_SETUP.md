# Maps Setup Guide

## Changes Made to Fix Maps

### 1. **Installed expo-location**
```bash
npx expo install expo-location
```

### 2. **Updated app.json**
Added location plugin configuration:
```json
"plugins": [
  ["expo-router"],
  "expo-secure-store",
  ["expo-location", {
    "locationAlwaysAndWhenInUsePermission": "Allow Voluntapp to use your location to show nearby opportunities."
  }]
]
```

### 3. **Updated discovery.tsx**
- Removed forced PROVIDER_GOOGLE and PROVIDER_DEFAULT
- Added automatic location detection
- Set default region (San Francisco as fallback)
- Simplified map configuration
- Added user location display

## How Maps Work Now

### **On App Start:**
1. Requests location permission
2. Gets user's current location
3. Centers map on user's location
4. Falls back to San Francisco if permission denied

### **Map Features:**
- ✅ Mini map preview on home screen
- ✅ Tap to expand to full screen
- ✅ Shows user's location (blue dot)
- ✅ Orange markers for opportunities
- ✅ Tap markers to see opportunity details
- ✅ Works on both iOS (Apple Maps) and Android (Google Maps)

## Testing Maps

### **iOS Simulator:**
1. In simulator menu: Features → Location → Custom Location
2. Enter coordinates (e.g., 37.7749, -122.4194 for SF)
3. Map should show your custom location

### **Android Emulator:**
1. Open extended controls (three dots)
2. Go to Location tab
3. Set custom GPS coordinates
4. Map should update

### **Real Device:**
- Grant location permission when prompted
- Map will show your actual location
- Opportunities will be shown as orange markers

## If Maps Still Don't Show

1. **Restart the dev server:**
   ```bash
   # Stop current server
   # Then restart:
   npx expo start -c
   ```

2. **Rebuild the app:**
   ```bash
   # For iOS:
   npx expo run:ios
   
   # For Android:
   npx expo run:android
   ```

3. **Check permissions:**
   - iOS: Settings → Voluntapp → Location → While Using
   - Android: Settings → Apps → Voluntapp → Permissions → Location

4. **Verify data has coordinates:**
   - Check that opportunities in database have latitude/longitude
   - Without coordinates, only the map background will show

## Default Map Region
- **Latitude:** 37.7749 (San Francisco)
- **Longitude:** -122.4194
- **Delta:** 0.3 (zoom level)

This ensures the map always displays something, even without user location or opportunity coordinates.
