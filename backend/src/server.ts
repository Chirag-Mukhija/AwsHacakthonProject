import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import apiRoutes from './routes/api.routes';
import { setupSwagger } from './docs/swagger';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', apiRoutes);

// Documentation
setupSwagger(app);

// Start server
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});
