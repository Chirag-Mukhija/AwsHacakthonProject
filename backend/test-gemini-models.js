import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('Fetching available models...');

try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Use a quick fetch to the REST API directly since the JS SDK might abstract listModels differently
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  const geminiModels = data.models.filter(m => m.name.includes('gemini'));
  console.log('Available Gemini Models:');
  geminiModels.forEach(m => console.log(m.name, '-', m.displayName));
} catch (e) {
  console.error('FULL ERROR:', e);
}
