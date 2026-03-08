import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};

if (!config.MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI is not defined in the environment variables');
}

// Validate critical variables
if (!config.GROQ_API_KEY) {
  console.warn('⚠️ GROQ_API_KEY is not defined in the environment variables');
}

if (!config.GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY is not defined in the environment variables');
}
