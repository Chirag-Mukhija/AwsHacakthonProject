import express from 'express';
import { handleExtraction } from '../controllers/extractionController.js';

const router = express.Router();

router.post('/', handleExtraction);

export default router;
