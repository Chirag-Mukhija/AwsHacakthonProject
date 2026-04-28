import { createSession, getSessions, getAllTasks, updateTaskStatus, deleteSession, deleteTaskFromSession, getAllReminders, updateReminder, getAllNotes } from '../services/sessionService.js';

export const handleCreateSession = async (req, res) => {
  try {
    const { transcript, source_type = 'text', ai_output } = req.body;
    
    if (!transcript || !ai_output) {
      return res.status(400).json({ error: 'Transcript and ai_output are required' });
    }

    const session = await createSession(transcript, source_type, ai_output);
    res.status(201).json({ success: true, session_id: session._id, data: session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleGetSessions = async (req, res) => {
  try {
    const sessions = await getSessions();
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleGetTasks = async (req, res) => {
  try {
    const tasks = await getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleUpdateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { task_index, completed } = req.body;
    
    if (task_index === undefined || completed === undefined) {
      return res.status(400).json({ error: 'task_index and completed boolean are required' });
    }

    const updatedSession = await updateTaskStatus(id, task_index, completed);
    res.status(200).json({ success: true, session: updatedSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleSeedData = async (req, res) => {
  try {
    const mockSession = {
      transcript: 'Schedule a team sync tomorrow at 10 AM, and remind me to draft the user interview questions. Also, task: review Q3 roadmap.',
      source_type: 'text',
      ai_output: {
        tasks: [
          { title: 'Draft user interview questions', completed: false },
          { title: 'Review Q3 roadmap', completed: false }
        ],
        reminders: [
          { title: 'Draft user interview questions reminder', time: 'tomorrow morning' }
        ],
        calendar_events: [
          { title: 'Team Sync', datetime: 'Tomorrow at 10 AM' }
        ],
        notes: []
      }
    };
    const session = await createSession(mockSession.transcript, mockSession.source_type, mockSession.ai_output);
    res.status(201).json({ success: true, message: 'Mock data seeded successfully', session_id: session._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleDeleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSession(id);
    res.status(200).json({ success: true, message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleDeleteTask = async (req, res) => {
  try {
    const { id, task_index } = req.params;
    await deleteTaskFromSession(id, parseInt(task_index, 10));
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleGetReminders = async (req, res) => {
  try {
    const reminders = await getAllReminders();
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleUpdateReminder = async (req, res) => {
  try {
    const { id, reminderId } = req.params;
    const { scheduledTime, notificationId } = req.body;
    
    const updatedSession = await updateReminder(id, reminderId, scheduledTime, notificationId);
    res.status(200).json({ success: true, session: updatedSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleGetNotes = async (req, res) => {
  try {
    const notes = await getAllNotes();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
