import { extractStructuredData } from '../services/geminiService.js';

export const handleExtraction = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text input string is required in the body' });
    }

    const structuredData = await extractStructuredData(text);

    // Provide the extracted output to the client. The client will finalize edits 
    // and explicitly call POST /api/session to persist to MongoDB.
    
    return res.status(200).json(structuredData);

  } catch (error) {
    console.error('Extraction Controller Error:', error.message);
    return res.status(500).json({ error: error.message || 'Internal server error during extraction' });
  }
};
