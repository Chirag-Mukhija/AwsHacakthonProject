# Signal App - Backend (MVP)

This repository contains the Node.js REST API for the Signal mobile application. It securely bridges the mobile application to powerful AI models for processing audio files and transcribing them into categorized, structured text.

## Features
- **Audio Transcription (`/api/transcribe`):** Uses Groq's blazing-fast Whisper Large V3 API to convert user voice recordings into text.
- **Data Extraction (`/api/extract`):** Uses Google's Gemini 1.5 Flash through structured prompt engineering to parse transcriptions directly into actionable JSON data (Tasks, Reminders, Calendar Events, Notes).
- **Interactive Documentation:** Fully implemented Swagger UI interface natively hosted on the server mapping all endpoints and payloads visually.

## Tech Stack
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **File Handling:** Multer, form-data
- **AI Integration:** `@google/generative-ai`, `axios` (Groq API)
- **Documentation:** Swagger UI (`swagger-ui-express`, `yamljs`)

## Pre-requisites
- Node.js (v18+)
- Groq API Key (Available for free at console.groq.com)
- Google Gemini API Key (Available for free at aistudio.google.com)

## Setup Instructions

1. **Navigate to the Backend directory (if not already there):**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup (CRITICAL):**
   You **MUST** create an `.env` file in the root of the `backend/` directory. Without this file, the API services will fail to connect.
   
   Create a file named `.env` and add the following keys substituting your exact keys:
   ```env
   # Server Port (Default is 3000)
   PORT=3000

   # Your Groq API Key
   GROQ_API_KEY=gsk_your_actual_groq_api_key_goes_here

   # Your Gemini API Key
   GEMINI_API_KEY=AIza_your_actual_gemini_api_key_goes_here
   ```

4. **Start the Development Server:**
   ```bash
   node src/server.js
   ```

5. **Verify API through Swagger Docs:**
   Open your browser and navigate to the Swagger console:
   [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
