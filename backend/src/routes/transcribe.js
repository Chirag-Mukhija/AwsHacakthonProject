import express from 'express';
import multer from 'multer';
import { handleTranscription } from '../controllers/transcriptionController.js';

const router = express.Router();

// Setup multer for temporary file storage
const upload = multer({ dest: 'temp_uploads/' });

router.post('/', upload.single('audio'), handleTranscription);

export default router;
