import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('API Key starts with:', process.env.GEMINI_API_KEY?.substring(0, 5) || 'Missing');

try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  const result = await model.generateContent("Say hello");
  console.log('Result:', result.response.text());
} catch (e) {
  console.error('FULL ERROR:', e);
}
