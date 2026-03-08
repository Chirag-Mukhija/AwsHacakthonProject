import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { config } from '../config/env.js';

export const transcribeAudio = async (filePath) => {
  if (!config.GROQ_API_KEY) {
    throw new Error('Groq API Key is not configured');
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('model', 'whisper-large-v3');

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${config.GROQ_API_KEY}`,
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error) {
    console.error('Whisper API Error:', error?.response?.data || error.message);
    throw new Error('Failed to transcribe audio with Groq');
  }
};
