import { Session } from '../models/sessionModel.js';

export const createSession = async (transcript, sourceType, aiOutput) => {
  try {
    const session = new Session({
      transcript,
      source_type: sourceType,
      ai_output: {
        tasks: aiOutput.tasks?.map(t => typeof t === 'string' ? { title: t } : t) || [],
        reminders: aiOutput.reminders?.map(t => typeof t === 'string' ? { title: t } : t) || [],
        calendar_events: aiOutput.calendar_events?.map(t => typeof t === 'string' ? { title: t } : t) || [],
        notes: aiOutput.notes?.map(n => typeof n === 'string' ? { content: n } : n) || []
      }
    });
    
    await session.save();
    return session;
  } catch (error) {
    console.error('Error saving session to DB:', error);
    throw new Error('Failed to save session to database');
  }
};

export const getSessions = async () => {
  try {
    const sessions = await Session.find().sort({ created_at: -1 });
    return sessions.map(session => ({
      id: session._id,
      transcript: session.transcript,
      ai_output: session.ai_output,
      created_at: session.created_at,
      task_count: session.ai_output.tasks.length,
      reminder_count: session.ai_output.reminders.length,
      event_count: session.ai_output.calendar_events.length
    }));
  } catch (error) {
    throw new Error('Failed to fetch sessions');
  }
};

export const getAllTasks = async () => {
  try {
    const sessions = await Session.find({ 'ai_output.tasks': { $exists: true, $not: {$size: 0} } });
    
    const allTasks = [];
    
    sessions.forEach(session => {
      session.ai_output.tasks.forEach((task, index) => {
        allTasks.push({
          session_id: session._id,
          task_index: index,
          title: task.title,
          deadline: task.deadline,
          completed: task.completed,
          created_at: session.created_at
        });
      });
    });
    
    return allTasks.sort((a, b) => b.created_at - a.created_at);
  } catch (error) {
    throw new Error('Failed to fetch tasks');
  }
};

export const updateTaskStatus = async (sessionId, taskIndex, completed) => {
  try {
    const session = await Session.findById(sessionId);
    if (!session) throw new Error('Session not found');
    
    if (session.ai_output.tasks[taskIndex]) {
      session.ai_output.tasks[taskIndex].completed = completed;
      await session.save();
    }
    
    return session;
  } catch (error) {
    throw new Error('Failed to update task status');
  }
};

export const deleteSession = async (sessionId) => {
  try {
    await Session.findByIdAndDelete(sessionId);
    return true;
  } catch (error) {
    throw new Error('Failed to delete session');
  }
};

export const deleteTaskFromSession = async (sessionId, taskIndex) => {
  try {
    const session = await Session.findById(sessionId);
    if (!session) throw new Error('Session not found');
    
    if (session.ai_output.tasks[taskIndex]) {
      session.ai_output.tasks.splice(taskIndex, 1);
      await session.save();
    }
    return session;
  } catch (error) {
    throw new Error('Failed to delete task');
  }
};

export const getAllReminders = async () => {
  try {
    const sessions = await Session.find({ 'ai_output.reminders': { $exists: true, $not: {$size: 0} } });
    
    const allReminders = [];
    
    sessions.forEach(session => {
      session.ai_output.reminders.forEach(reminder => {
        allReminders.push({
          session_id: session._id,
          reminder_id: reminder._id,
          title: reminder.title,
          time: reminder.time,
          scheduledTime: reminder.scheduledTime,
          notificationId: reminder.notificationId,
          created_at: session.created_at
        });
      });
    });
    
    // Sort by scheduled time if exists, else created_at
    return allReminders.sort((a, b) => {
      if (a.scheduledTime && b.scheduledTime) return new Date(a.scheduledTime) - new Date(b.scheduledTime);
      if (a.scheduledTime) return -1;
      if (b.scheduledTime) return 1;
      return b.created_at - a.created_at;
    });
  } catch (error) {
    throw new Error('Failed to fetch reminders');
  }
};

export const updateReminder = async (sessionId, reminderId, scheduledTime, notificationId) => {
  try {
    const session = await Session.findById(sessionId);
    if (!session) throw new Error('Session not found');
    
    const reminder = session.ai_output.reminders.id(reminderId);
    if (reminder) {
      if (scheduledTime !== undefined) reminder.scheduledTime = scheduledTime;
      if (notificationId !== undefined) reminder.notificationId = notificationId;
      await session.save();
    }
    
    return session;
  } catch (error) {
    throw new Error('Failed to update reminder');
  }
};

export const getAllNotes = async () => {
  try {
    const sessions = await Session.find({ 'ai_output.notes': { $exists: true, $not: {$size: 0} } }).sort({ created_at: -1 });
    
    const allNotes = [];
    
    sessions.forEach(session => {
      const sessionNotes = session.ai_output.notes.map(note => ({
        session_id: session._id,
        note_id: note._id,
        content: note.content,
        created_at: note.createdAt || session.created_at
      }));
      allNotes.push(...sessionNotes);
    });
    
    return allNotes;
  } catch (error) {
    throw new Error('Failed to fetch notes');
  }
};
