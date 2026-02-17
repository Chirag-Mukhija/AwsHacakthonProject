import {
    TranscribeClient,
    StartTranscriptionJobCommand,
    GetTranscriptionJobCommand,
    TranscribeClientConfig,
} from '@aws-sdk/client-transcribe';
import { config } from '../config/env';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'; // We need axios to fetch the transcript from the presigned URL if not using S3 get

// Just in case we need to install axios
// npm install axios

const transcribeClient = new TranscribeClient({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
    },
});

export class TranscriptionService {
    /**
     * Starts a transcription job and polls for completion.
     * @param s3Uri S3 URI of the audio file
     * @returns The transcribed text
     */
    async transcribeAudio(s3Uri: string): Promise<string> {
        const jobName = `signal-transcription-${uuidv4()}`;

        try {
            // 1. Start Job
            await transcribeClient.send(
                new StartTranscriptionJobCommand({
                    TranscriptionJobName: jobName,
                    Media: { MediaFileUri: s3Uri },
                    MediaFormat: 'mp4', // Assuming mp4/m4a from expo-av. Adjust if needed.
                    LanguageCode: 'en-US',
                    OutputBucketName: config.aws.s3BucketName,
                })
            );

            // 2. Poll for Completion
            let jobStatus = 'IN_PROGRESS';
            let transcriptUri = '';

            // Timeout after 60 seconds (MVP)
            const startTime = Date.now();
            const TIMEOUT = 60000;

            while (jobStatus === 'IN_PROGRESS' || jobStatus === 'QUEUED') {
                if (Date.now() - startTime > TIMEOUT) {
                    throw new Error('Transcription timed out');
                }

                await new Promise((resolve) => setTimeout(resolve, 1000)); // Poll every 1s

                const { TranscriptionJob } = await transcribeClient.send(
                    new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
                );

                if (!TranscriptionJob) throw new Error('Job not found');

                jobStatus = TranscriptionJob.TranscriptionJobStatus!;

                if (jobStatus === 'COMPLETED') {
                    transcriptUri = TranscriptionJob.Transcript?.TranscriptFileUri!;
                } else if (jobStatus === 'FAILED') {
                    throw new Error('Transcription failed');
                }
            }

            // 3. Retrieve Transcript (It's a JSON file on S3)
            // Since we specified OutputBucketName, it is saved to our bucket. 
            // However, GetTranscriptionJob returns a pre-signed URL to download it or the S3 URI.
            // Usually TranscriptFileUri is a presigned HTTPS URL.

            const response = await axios.get(transcriptUri);
            // AWS Transcribe Output JSON structure:
            // { results: { transcripts: [ { transcript: "..." } ] } }

            const transcriptText = response.data.results.transcripts[0].transcript;
            return transcriptText;

        } catch (error) {
            console.error('Error in transcription service:', error);
            throw error;
        }
    }
}
