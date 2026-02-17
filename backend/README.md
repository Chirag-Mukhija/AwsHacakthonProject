# Backend - Signal Execution Assistant

A Node.js + Express backend that processes audio files using AWS Services to extract structured intent.

## Tech Stack
- **Runtime**: Node.js (LTS)
- **Framework**: Express with TypeScript
- **AWS Services**:
    - **S3**: Audio file storage
    - **Transcribe**: Speech-to-text
    - **Bedrock (Claude)**: Intent extraction (JSON)
- **Documentation**: Swagger UI

## Prerequisites
1.  **AWS Account**: You need active AWS credentials.
2.  **AWS Services Enabled**:
    - S3 Bucket created
    - Bedrock Model Access enabled (Claude 3 or Titan)
3.  **Environment Variables**: Create a `.env` file in `backend/` (see `.env.example`).

## Setup

1.  **Install Dependencies**
    ```bash
    cd backend
    npm install
    ```

2.  **Configure Environment**
    Create `.env`:
    ```env
    PORT=3000
    AWS_REGION=us-east-1
    AWS_ACCESS_KEY_ID=your_key
    AWS_SECRET_ACCESS_KEY=your_secret
    S3_BUCKET_NAME=your_bucket
    BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## API Documentation

Access Swagger UI at: `http://localhost:3000/api-docs`

### `POST /process-audio`
Uploads an audio file and returns extracted structured data.

**Request**: `multipart/form-data` with `audio` file field.

**Response**:
```json
{
  "tasks": [...],
  "reminders": [...],
  "calendarEvents": [...],
  "decisions": [...]
}
```

## Testing

Use `curl`:
```bash
curl -X POST http://localhost:3000/process-audio \
  -F "audio=@/path/to/test_recording.m4a"
```
