import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

// Route imports
import transcribeRoutes from './routes/transcribe.js';
import transcribeAudioRoutes from './routes/transcribeAudio.js';
import extractRoutes from './routes/extract.js';
import sessionRoutes from './routes/sessionRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger UI Documentation
try {
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('✅ Swagger API documentation available at /api-docs');
} catch (error) {
  console.error('⚠️ Failed to load Swagger documentation:', error.message);
}

// Routes
app.use('/api/transcribe', transcribeRoutes);
app.use('/api/transcribe-audio', transcribeAudioRoutes);
app.use('/api/extract', extractRoutes);
app.use('/api', sessionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Signal Backend MVP is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(config.PORT, () => {
  console.log(`🚀 Server running on port ${config.PORT}`);
});
