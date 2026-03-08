import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { extractionPrompt } from '../utils/promptTemplate.js';

let genAI = null;
if (config.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
}

export const extractStructuredData = async (text) => {
  if (!genAI) {
    throw new Error('Gemini API Key is not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = extractionPrompt.replace('{TRANSCRIPT_PLACEHOLDER}', text);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log('Raw Gemini Output:', responseText);

    try {
      const parsedData = JSON.parse(responseText);
      
      // Ensure specific keys exist
      return {
        transcript: text,
        tasks: parsedData.tasks || [],
        reminders: parsedData.reminders || [],
        calendar_events: parsedData.calendar_events || [],
        notes: parsedData.notes || []
      };
    } catch (parseError) {
      console.error('Parsing Error:', parseError);
      throw new Error('Gemini returned malformed JSON');
    }

  } catch (error) {
    console.error('Gemini API Full Error Object:', error);
    console.error('Gemini API Error details:', error?.response || error.message);
    throw new Error('Failed to extract data via Gemini. Check server logs.');
  }
};
