import axios from 'axios';
import { config } from '../config/env.js';

// Map file extensions/mimetypes to Deepgram-accepted content types
const resolveContentType = (mimetype) => {
  if (!mimetype) return 'audio/wav';
  if (mimetype.includes('m4a') || mimetype.includes('mp4') || mimetype.includes('mpeg4') || mimetype.includes('aac')) {
    return 'audio/mp4';
  }
  return mimetype;
};

export const handleDeepgramTranscription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    if (!config.DEEPGRAM_API_KEY || config.DEEPGRAM_API_KEY === 'your_key_here') {
      return res.status(500).json({ error: 'Deepgram API Key is not configured on the server' });
    }

    const audioBuffer = req.file.buffer;
    const contentType = resolveContentType(req.file.mimetype);

    console.log(`[Deepgram] Received ${req.file.size} bytes, mimetype: ${req.file.mimetype} → sending as ${contentType}`);

    // Send the audio buffer to Deepgram
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      audioBuffer,
      {
        headers: {
          'Authorization': `Token ${config.DEEPGRAM_API_KEY}`,
          'Content-Type': contentType,
        },
        params: {
          model: 'nova-2',
          smart_format: true,
        }
      }
    );

    // Gracefully handle empty transcript (e.g. silence recorded)
    const transcript = response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';

    console.log(`[Deepgram] Transcript: "${transcript}"`);

    res.status(200).json({ transcript });
  } catch (error) {
    console.error('[Deepgram] Transcription Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.err_msg || error.message || 'Internal server error during transcription' });
  }
};
