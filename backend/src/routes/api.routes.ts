import { Router } from 'express';
import multer from 'multer';
import { AudioController } from '../controllers/audio.controller';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const audioController = new AudioController();

/**
 * @swagger
 * /process-audio:
 *   post:
 *     summary: Upload and process an audio file
 *     tags: [Audio]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successfully processed audio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StructuredIntent'
 *       400:
 *         description: Bad request (missing file)
 *       500:
 *         description: Server error
 */
router.post('/process-audio', upload.single('audio'), (req, res) => audioController.processAudio(req, res));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is running
     */
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
