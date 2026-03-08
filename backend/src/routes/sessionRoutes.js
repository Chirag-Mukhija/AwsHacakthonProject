import express from 'express';
import { handleCreateSession, handleGetSessions, handleGetTasks, handleUpdateTask, handleSeedData } from '../controllers/sessionController.js';

const router = express.Router();

router.post('/session', handleCreateSession);
router.post('/seed', handleSeedData);
router.get('/sessions', handleGetSessions);
router.get('/tasks', handleGetTasks);
router.patch('/session/:id/task', handleUpdateTask);

export default router;
