import express from 'express';
import multer from 'multer';
import { handleDeepgramTranscription } from '../controllers/deepgramController.js';

const router = express.Router();

// Setup multer for memory storage to pass buffer directly to Deepgram
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('audio'), handleDeepgramTranscription);

export default router;
