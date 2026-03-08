# Signal App - Frontend

Signal is an AI-powered productivity assistant that converts your voice decisions into structured tasks, reminders, and calendar events. This repository contains the mobile frontend built with React Native (Expo) and styled according to modern Figma designs.

## Features
- **Voice Recording:** Intuitive recording interface with mockup animated waveforms.
- **Transcript Editing:** Seamless review process before AI extraction.
- **Segregation via Drag & Drop:** Interactive categorized lists utilizing `react-native-draggable-flatlist`.
- **Theming:** Full native support for instant Light Mode and Dark Mode switching via Context API.
- **History Tracking:** Expandable log cards to reflect neatly on past sessions.

## Tech Stack
- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Routing:** React Navigation (Stack & Bottom Tabs)
- **Animations:** React Native Reanimated & Gesture Handler
- **Icons:** Lucide React Native

## Pre-requisites
Ensure you have the following installed on your machine:
- Node.js (v18+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS only) or Android Studio Emulator

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   For this specific MVP iteration, the **Frontend does not require** a separate `.env` file because the mock data is hardcoded and backend communication is waiting to be wired up entirely. 
   *(In a future production version, you would create an `.env` file here to store things like `EXPO_PUBLIC_API_URL` to point to the backend.)*

3. **Start the Development Server:**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on Device / Simulator:**
   - Press **`i`** in the terminal to open the iOS Simulator.
   - Press **`a`** to open the Android Emulator.
   - Scan the QR code with the **Expo Go** app on your physical device.
