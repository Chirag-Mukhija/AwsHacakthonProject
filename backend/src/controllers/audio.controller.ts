import { Request, Response } from 'express';
import { S3Service } from '../services/s3.service';
import { TranscriptionService } from '../services/transcribe.service';
import { BedrockService } from '../services/bedrock.service';

const s3Service = new S3Service();
const transcriptionService = new TranscriptionService();
const bedrockService = new BedrockService();

export class AudioController {
    async processAudio(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No audio file uploaded' });
                return;
            }

            console.log(`Processing audio file: ${req.file.originalname}`);

            // 1. Upload to S3
            const s3Uri = await s3Service.uploadAudioToS3(req.file.buffer, req.file.originalname);
            console.log(`Uploaded to S3: ${s3Uri}`);

            // 2. Transcribe
            const transcript = await transcriptionService.transcribeAudio(s3Uri);
            console.log('Transcription complete:', transcript);

            // 3. Extract Intent
            const structuredData = await bedrockService.extractStructuredIntent(transcript);
            console.log('Intent extracted:', structuredData);

            res.json(structuredData);

        } catch (error: any) {
            console.error('Error processing audio:', error);
            res.status(500).json({
                error: 'Failed to process audio',
                details: error.message
            });
        }
    }
}
