import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { extractionPrompt } from '../utils/promptTemplate.js';

let genAI = null;
if (config.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Calls Gemini with up to `maxRetries` attempts, using exponential backoff.
const callGeminiWithRetry = async (prompt, maxRetries = 3) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Gemini] Attempt ${attempt}/${maxRetries}...`);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      console.log('[Gemini] Raw output:', responseText);
      return responseText;
    } catch (err) {
      lastError = err;

      // Extract a human-readable reason from the error
      const status = err?.status || err?.response?.status;
      const message = err?.message || String(err);

      console.error(`[Gemini] Attempt ${attempt} failed — status: ${status}, message: ${message}`);

      // Retry on rate-limit (429) or server overload (500/503). Bail immediately on others.
      const isRetryable = !status || status === 429 || status === 500 || status === 503;
      if (!isRetryable || attempt === maxRetries) break;

      const delay = 1000 * Math.pow(2, attempt); // 2s, 4s, 8s
      console.log(`[Gemini] Retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }

  // Surface the real error message, not a generic one
  const realMessage = lastError?.message || String(lastError);
  throw new Error(`Gemini API failed after ${maxRetries} attempts: ${realMessage}`);
};

export const extractStructuredData = async (text) => {
  if (!genAI) {
    throw new Error('Gemini API Key is not configured. Check your .env file.');
  }

  const currentDateTime = new Date().toISOString();
  const prompt = extractionPrompt
    .replace('{TRANSCRIPT_PLACEHOLDER}', text)
    .replace('{CURRENT_DATETIME}', currentDateTime);

  // Step 1: Call Gemini (with retry). Let the real error propagate if all retries fail.
  const responseText = await callGeminiWithRetry(prompt);

  // Step 2: Parse JSON — kept separate so parse errors are not masked by Gemini errors.
  let parsedData;
  try {
    parsedData = JSON.parse(responseText);
  } catch (parseError) {
    console.error('[Gemini] JSON parse failed. Raw response was:', responseText);
    throw new Error(`Gemini returned malformed JSON: ${parseError.message}`);
  }

  // Step 3: Validate and return
  const validCalendarEvents = (parsedData.calendar_events || []).filter((event) => {
    if (!event.start_iso) {
      console.warn('[Gemini] Skipping calendar event — missing start_iso:', event);
      return false;
    }
    return true;
  });

  return {
    transcript: text,
    tasks: parsedData.tasks || [],
    reminders: parsedData.reminders || [],
    calendar_events: validCalendarEvents,
    notes: parsedData.notes || [],
  };
};
