import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { config } from '../config/env';

const bedrockClient = new BedrockRuntimeClient({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
    },
});

export interface StructuredIntent {
    tasks: Array<{ title: string; deadline: string | null }>;
    reminders: Array<{ title: string; date: string }>;
    calendarEvents: Array<{ title: string; date: string; time: string | null }>;
    decisions: string[];
}

export class BedrockService {
    /**
     * Extracts structured intent from a transcript using Bedrock (Claude).
     * @param transcript The text transcript
     * @returns Structured JSON object
     */
    async extractStructuredIntent(transcript: string): Promise<StructuredIntent> {
        const today = new Date().toISOString().split('T')[0];

        const prompt = `
      You are an AI assistant that extracts structured tasks, reminders, calendar events, and decisions from a voice note transcript.
      Today's date is ${today}.
      
      TRANSCRIPT: "${transcript}"
      
      INSTRUCTIONS:
      1. Analyze the transcript for actionable items.
      2. Categorize them into:
         - tasks (actionable to-dos, deadline is optional YYYY-MM-DD or null)
         - reminders (specific things to remember, date is required YYYY-MM-DD)
         - calendarEvents (meetings/appointments, date YYYY-MM-DD and time HH:MM 24h format are required if mentioned, else null)
         - decisions (conclusions reached, pure text)
      3. profound ONLY VALID JSON. Do not include any explanation or markdown formatting.
      
      OUTPUT FORMAT:
      {
        "tasks": [ { "title": "string", "deadline": "YYYY-MM-DD" | null } ],
        "reminders": [ { "title": "string", "date": "YYYY-MM-DD" } ],
        "calendarEvents": [ { "title": "string", "date": "YYYY-MM-DD", "time": "HH:MM" | null } ],
        "decisions": [ "string" ]
      }
    `;

        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1000,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        }
                    ]
                }
            ],
            temperature: 0,
        };

        const command = new InvokeModelCommand({
            contentType: 'application/json',
            body: JSON.stringify(payload),
            modelId: config.aws.bedrockModelId,
        });

        try {
            const response = await bedrockClient.send(command);
            const responseBody = new TextDecoder().decode(response.body);
            const result = JSON.parse(responseBody);

            // Extract the text content from Claude's response structure
            const contentText = result.content[0].text;

            // Parse the JSON from the text content
            // Handle potential markdown code blocks if the model adds them despite instructions
            const jsonString = contentText.replace(/```json\n?|\n?```/g, '').trim();

            return JSON.parse(jsonString) as StructuredIntent;

        } catch (error) {
            console.error('Error invoking Bedrock:', error);
            throw new Error('Failed to extract intent from transcript');
        }
    }
}
