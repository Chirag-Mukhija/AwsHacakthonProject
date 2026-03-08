import { extractStructuredData } from '../services/geminiService.js';
import { createSession } from '../services/sessionService.js';

export const handleExtraction = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text input string is required in the body' });
    }

    const structuredData = await extractStructuredData(text);

    // Save the extraction event directly into MongoDB
    await createSession(text, 'text', structuredData);

    return res.status(200).json(structuredData);

  } catch (error) {
    console.error('Extraction Controller Error:', error.message);
    return res.status(500).json({ error: error.message || 'Internal server error during extraction' });
  }
};
