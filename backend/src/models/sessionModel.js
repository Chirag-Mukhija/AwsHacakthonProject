import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  deadline: { type: String },
  completed: { type: Boolean, default: false }
}, { _id: false });

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String }
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  datetime: { type: String }
}, { _id: false });

const aiOutputSchema = new mongoose.Schema({
  tasks: [taskSchema],
  reminders: [reminderSchema],
  calendar_events: [eventSchema],
  notes: [{ type: String }]
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  transcript: { type: String, required: true },
  source_type: { type: String, enum: ['voice', 'text'], default: 'voice' },
  ai_output: { type: aiOutputSchema, required: true },
  created_at: { type: Date, default: Date.now }
});

export const Session = mongoose.model('Session', sessionSchema);
