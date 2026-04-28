import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  deadline: { type: String },
  completed: { type: Boolean, default: false }
}, { _id: false });

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String }, // Old field, maybe time_hint
  scheduledTime: { type: String },
  notificationId: { type: String }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start_iso: { type: String },
  end_iso: { type: String }
}, { _id: false });

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const aiOutputSchema = new mongoose.Schema({
  tasks: [taskSchema],
  reminders: [reminderSchema],
  calendar_events: [eventSchema],
  notes: [noteSchema]
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  transcript: { type: String, required: true },
  source_type: { type: String, enum: ['voice', 'text'], default: 'voice' },
  ai_output: { type: aiOutputSchema, required: true },
  created_at: { type: Date, default: Date.now }
});

export const Session = mongoose.model('Session', sessionSchema);
