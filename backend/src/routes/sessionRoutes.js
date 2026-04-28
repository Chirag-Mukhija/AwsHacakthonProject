import express from 'express';
import { handleCreateSession, handleGetSessions, handleGetTasks, handleUpdateTask, handleSeedData, handleDeleteSession, handleDeleteTask, handleGetReminders, handleUpdateReminder, handleGetNotes } from '../controllers/sessionController.js';

const router = express.Router();

router.post('/session', handleCreateSession);
router.post('/seed', handleSeedData);
router.get('/sessions', handleGetSessions);
router.get('/tasks', handleGetTasks);
router.get('/reminders', handleGetReminders);
router.get('/notes', handleGetNotes);
router.patch('/session/:id/task', handleUpdateTask);
router.patch('/session/:id/reminder/:reminderId', handleUpdateReminder);
router.delete('/session/:id', handleDeleteSession);
router.delete('/session/:id/task/:task_index', handleDeleteTask);

export default router;
