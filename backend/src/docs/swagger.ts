import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { config } from '../config/env';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Signal MVP API',
            version: '1.0.0',
            description: 'API documentation for Signal Execution Assistant',
        },
        servers: [
            {
                url: `http://localhost:${config.port}`,
                description: 'Local server',
            },
        ],
        components: {
            schemas: {
                StructuredIntent: {
                    type: 'object',
                    properties: {
                        tasks: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    deadline: { type: 'string', nullable: true },
                                },
                            },
                        },
                        reminders: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    date: { type: 'string' },
                                },
                            },
                        },
                        calendarEvents: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    date: { type: 'string' },
                                    time: { type: 'string', nullable: true },
                                },
                            },
                        },
                        decisions: {
                            type: 'array',
                            items: { type: 'string' },
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    console.log(`Swagger UI available at http://localhost:${config.port}/api-docs`);
};
