import fs from 'fs';
import { transcribeAudio } from '../services/whisperService.js';

export const handleTranscription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioFilePath = req.file.path;
    
    // Call the Groq Whisper service
    const transcriptionData = await transcribeAudio(audioFilePath);
    
    // Clean up the uploaded file from temp storage
    fs.unlink(audioFilePath, (err) => {
      if (err) console.error('Failed to delete temp file:', err);
    });

    res.status(200).json({ transcript: transcriptionData.text });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    console.error('Transcription Controller Error:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error during transcription' });
  }
};
