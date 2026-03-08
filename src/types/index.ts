export interface ExtractedItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task extends ExtractedItem {}
export interface Reminder extends ExtractedItem {}
export interface CalendarEvent extends ExtractedItem {}

export interface TranscriptResult {
  transcript: string;
  tasks: Task[];
  reminders: Reminder[];
  calendar_events: CalendarEvent[];
  notes: string[];
}
