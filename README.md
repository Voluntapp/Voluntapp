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
Some features may require environment variables for the server (e.g., database connection). Create a `.env` in the project root if needed and mirror keys referenced by `server/index.ts` and `drizzle.config.ts`.

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
1. Ensure Xcode and CocoaPods are installed (`sudo gem install cocoapods` if needed).
2. Install deps (first time): `npm install`
   - This will automatically run `npx pod-install ios`.
3. Run on iOS simulator: `npm run ios`
   - To open in Xcode: `open ios/Voluntapp.xcworkspace`

## Troubleshooting
- If iOS pods fail to install, run: `npx pod-install ios` inside `apps/mobile`, or `cd ios && pod install`.
- For Android build issues, confirm Java 17: `java -version`, and ensure ANDROID_HOME and SDK paths are set.
- Delete `node_modules` and reinstall if you hit module resolution issues.

## License
MIT
