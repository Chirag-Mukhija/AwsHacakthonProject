import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';

const s3Client = new S3Client({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
    },
});

export class S3Service {
    /**
     * Uploads an audio buffer to S3 and returns the S3 URI.
     * @param fileBuffer The file buffer to upload
     * @param originalName The original filename (for extension)
     * @returns The S3 URI (s3://bucket/key)
     */
    async uploadAudioToS3(fileBuffer: Buffer, originalName: string): Promise<string> {
        const fileExt = originalName.split('.').pop();
        const key = `audio/${uuidv4()}.${fileExt}`;

        // In a real app we might want to check file type, size, etc.

        const command = new PutObjectCommand({
            Bucket: config.aws.s3BucketName,
            Key: key,
            Body: fileBuffer,
        });

        try {
            await s3Client.send(command);
            return `s3://${config.aws.s3BucketName}/${key}`;
        } catch (error) {
            console.error('Error uploading to S3:', error);
            throw new Error('Failed to upload audio to S3');
        }
    }
}
