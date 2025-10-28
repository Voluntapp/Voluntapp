# Voluntapp

A volunteer opportunities platform with a web client and a React Native (Expo) mobile app for iOS and Android.

## Tech Stack
- Web: Vite + React + TypeScript + TailwindCSS
- Server: Node.js + Express + TypeScript + Drizzle ORM
- Mobile: Expo (React Native 0.74), Expo Router, React Query
- DB/Infra: Drizzle (see drizzle.config.ts)

## Repository Structure
- apps/mobile — Expo mobile app (iOS/Android)
- client — Web client (Vite)
- server — Backend server (Express)
- shared — Shared code/types
- drizzle.config.ts — Drizzle configuration
- tailwind.config.ts — Tailwind config

## Prerequisites
- Node.js 18+ and npm
- macOS (for iOS builds)
- Xcode + Command Line Tools (for iOS)
- Android Studio + SDK + emulator/device (for Android)
- Java 17 (for Android builds)
- CocoaPods (iOS) — usually installed via: `sudo gem install cocoapods`

Note: In the mobile app, CocoaPods installation will run automatically after `npm install` via a `postinstall` script (`npx pod-install ios`).

## Setup
From the repository root:
1. Install dependencies for root/server/web:
   - `npm install`
2. Install mobile dependencies (runs pods automatically on macOS):
   - `cd apps/mobile && npm install`

## Environment Variables

### Server/Web
Some features may require environment variables for the server (e.g., database connection). Create a `.env` in the project root if needed and mirror keys referenced by `server/index.ts` and `drizzle.config.ts`.

### Mobile App
The mobile app reads the backend API URL from:
1. `apps/mobile/app.json` → `extra.apiUrl` (highest priority)
2. `apps/mobile/.env` → `EXPO_PUBLIC_API_BASE`
3. Defaults to `http://localhost:5000`

For development with a remote backend (e.g., ngrok), create `apps/mobile/.env`:
```
EXPO_PUBLIC_API_BASE=https://your-backend-url.com
```

## Web (Development)
From the repository root:
- Start dev server: `npm run dev`
  - This runs the server via `tsx server/index.ts` and serves the client with Vite in development.

## Web (Production Build)
From the repository root:
- Build: `npm run build`
  - Outputs web assets with Vite and bundles the server to `dist/` via esbuild.
- Start: `npm start`

## Mobile (Android)
From `apps/mobile`:
1. Ensure Java 17 and Android SDKs are installed, and an emulator/device is available.
2. Install deps (first time): `npm install`
3. Run on Android: `npm run android`
   - This will build and install the app on the emulator/device through Expo.

## Mobile (iOS)
From `apps/mobile` on macOS:

### Prerequisites
1. **Xcode** (from App Store) - Open once to complete setup
2. **Command Line Tools**: Xcode → Settings → Locations → Command Line Tools
3. **CocoaPods**: `sudo gem install cocoapods`
4. **Watchman** (optional but recommended): `brew install watchman`

### Initial Setup
1. Install dependencies:
   ```bash
   cd apps/mobile
   npm install
   ```
   This automatically runs `npx pod-install ios` via postinstall script.

2. Configure backend URL (if using remote backend):
   - Create `.env` file in `apps/mobile/`:
     ```
     EXPO_PUBLIC_API_BASE=https://your-backend-url.com
     ```
   - Or update `apiUrl` in `apps/mobile/app.json` under `extra` section

### Run on iOS Simulator
```bash
npm run ios
```
This builds the app and launches it in the iOS Simulator.

### Run on Physical iPhone/iPad
1. Connect your device via USB
2. Run:
   ```bash
   npm run ios -- --device
   ```
3. Select your physical device from the list
4. **First time only**: 
   - Open `ios/Voluntapp.xcworkspace` in Xcode
   - Select your device as the target
   - Go to Signing & Capabilities
   - Select your Team (Apple ID)
   - Xcode will automatically provision the app
5. On your device: Settings → General → VPN & Device Management → Trust the developer certificate

### Alternative: Open in Xcode
```bash
open ios/Voluntapp.xcworkspace
```
Then select your device/simulator and press Run (▶️).

## Troubleshooting

### iOS
- **Pods fail to install**: Run `npx pod-install ios` inside `apps/mobile`, or `cd ios && pod install --repo-update`
- **Build errors**: Clean build folder in Xcode (Product → Clean Build Folder) or delete `ios/build/`
- **Metro cache issues**: `npx react-native start --reset-cache`
- **Signing errors**: Open `ios/Voluntapp.xcworkspace` in Xcode and configure Signing & Capabilities with your Apple ID
- **Device not detected**: Ensure device is unlocked, trusted ("Trust This Computer" prompt), and USB cable supports data transfer

### Android
- **Build issues**: Confirm Java 17 with `java -version`, and ensure ANDROID_HOME and SDK paths are set
- **Emulator not starting**: Open Android Studio → AVD Manager and verify emulator configuration

### General
- **Module resolution issues**: Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- **Backend connection fails**: Verify API URL in mobile app config and ensure backend is accessible from device/simulator

## License
Apache License 2.0

Copyright 2025 Voluntapp Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
