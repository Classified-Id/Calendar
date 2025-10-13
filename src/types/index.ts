export interface CalendarEvent {
  id?: number;
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
  color?: string;
  createdAt: Date;
}

export interface Reminder {
  id?: number;
  title: string;
  timestamp: Date;
  description?: string;
  completed: boolean;
  createdAt: Date;
}

export interface BackupData {
  events: CalendarEvent[];
  reminders: Reminder[];
  exportDate: string;
}
