# Signal App - AI Context & Project Overview

**Application Name:** Signal
**Purpose:** An AI-powered productivity assistant that converts voice notes and typed text into structured tasks, reminders, calendar events, and general notes.

This file serves as the central context file for LLMs. **Any future AI model working on this project should read this file first to understand the architecture, stack, and current state of features.** Whenever major features or architectural changes are introduced, this file MUST be updated.

---

## 1. Technology Stack

### Frontend (Mobile App)
- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation (`@react-navigation/native-stack`, `@react-navigation/bottom-tabs`)
- **Animations:** React Native Reanimated, React Native Gesture Handler
- **Interactions:** `react-native-draggable-flatlist` (for drag-and-drop categorization)
- **Styling:** Custom theming context (Dark/Light mode support)

### Backend (API Server)
- **Framework:** Node.js with Express
- **Language:** JavaScript (ES Modules, `"type": "module"`)
- **Database:** MongoDB (via Mongoose)
- **AI Services:**
  - **Speech-to-Text:** Groq Fast API (Whisper Large V3)
  - **LLM Extraction/Structure:** Google Gemini API (`gemini-2.5-flash`)
- **API Documentation:** Swagger UI (`swagger-ui-express`, `yamljs`)
- **Utilities:** `multer` (file handling), `axios`, `cors`, `dotenv`, `morgan`

---

## 2. Core Features Implemented

### Frontend Features
1. **Onboarding / Landing Screen:** Initial welcome screen routing to the main app.
2. **Home Screen:** Dashboard featuring "Record" and "Type" actions, alongside a visual list of upcoming tasks.
3. **Recording Flow:**
   - **Recording Screen:** Animated pulsing mic UI and timer. Captures voice.
   - **Transcription Screen:** Displays transcribed text for user review/editing before extraction.
4. **Typing Flow:**
   - User taps "Type" on Home. Instantly opens the Transcription screen with a blank textbox for manual input.
5. **Processing & Segregation:**
   - **Processing Screen:** Loading state while making HTTP requests to the Backend API.
   - **Segregation Screen:** Renders the dynamic JSON array returned by the API using `DraggableFlatList`. Items are categorized into sub-lists (Tasks, Reminders, Calendar Events, Notes). Users can edit text, mark checkboxes, or drag items between lists.

### Backend Features
1. **Transcribe API (`POST /api/transcribe`):**
   - Receives audio file via `multer`.
   - Sends to Groq Whisper for fast transcription.
   - Returns the text transcript.
2. **Extract API (`POST /api/extract`):**
   - Receives text payload.
   - Prompts Gemini (`gemini-2.5-flash`) with a strict JSON schema prompt.
   - Expects strict output arrays: `tasks`, `reminders`, `calendar_events`, `notes`.
   - Automatically saves the resulting interaction into MongoDB as a "Session" document before responding to the client.
3. **Database Integration (MongoDB):**
   - Uses MongoDB Atlas connection format.
   - **Session Model:** Stores `{ transcript, source_type, ai_output, created_at }`. The `ai_output` enforces sub-schemas for tasks, reminders, etc.
   - **Session Routes:**
     - `GET /api/sessions`: Fetch all history.
     - `GET /api/tasks`: Flattens uncompleted tasks across all sessions for Home screen preview.
     - `PATCH /api/session/:id/task`: Toggles completion state for a specific task.

---

## 3. Project Structure Tree

```
/SignalApp
├── AI_CONTEXT.md                <-- Project LLM Context
├── App.tsx                      <-- Frontend Entry
├── package.json                 <-- Frontend Deps
├── src/                         <-- Frontend Src
│   ├── components/              <-- UI Components (Card, Typography, Button)
│   ├── context/                 <-- ThemeContext
│   ├── navigation/              <-- RootNavigator, MainTabNavigator
│   ├── screens/                 <-- HomeScreen, RecordingScreen, SegregationScreen, etc.
│   └── theme/                   <-- Colors, Spacing
│
└── backend/                     <-- Backend Directory
    ├── package.json             <-- Backend Deps
    ├── .env                     <-- Environment variables (PORT, GROQ_API_KEY, GEMINI_API_KEY, MONGODB_URI)
    ├── README.md                <-- Backend setup instructions
    └── src/
        ├── server.js            <-- Backend Entry
        ├── config/              <-- env.js, db.js (Mongoose connection)
        ├── models/              <-- sessionModel.js
        ├── controllers/         <-- extractionController, transcriptionController, sessionController
        ├── routes/              <-- extract.js, transcribe.js, sessionRoutes.js
        ├── services/            <-- whisperService, geminiService, sessionService
        ├── utils/               <-- promptTemplate.js
        └── docs/                <-- swagger.yaml
```

---

## 4. Current State & Next Steps

**Current Status:** The core architecture is completely defined. Both Voice and Type-to-extract workflows successfully hit the full-stack chain (Frontend UI -> Node Server -> Gemini 2.5 Flash -> MongoDB Database -> Frontend Segregation mapping).

**Pending / Next Improvements (v1.1+):**
- Integrating the active `GET /api/tasks` endpoint with the real Home Screen Task list.
- Creating the `HistoryScreen` UI on the frontend to map over `GET /api/sessions`.
- Audio recording integration on frontend (connecting the pulsing UI to react-native-audio-recorder player/sender).
