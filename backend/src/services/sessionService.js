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
        notes: aiOutput.notes || []
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
