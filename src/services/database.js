import { openDB } from 'idb';

const DB_NAME = 'DailyPlanner';
const DB_VERSION = 1;

class DatabaseService {
  constructor() {
    this.db = null;
  }

  async initDB() {
    if (this.db) return this.db;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Events store
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', {
            keyPath: 'id',
            autoIncrement: true
          });
          eventsStore.createIndex('by-date', 'date');
        }

        // Reminders store
        if (!db.objectStoreNames.contains('reminders')) {
          const remindersStore = db.createObjectStore('reminders', {
            keyPath: 'id',
            autoIncrement: true
          });
          remindersStore.createIndex('by-timestamp', 'timestamp');
        }
      },
    });

    return this.db;
  }

  // Events methods
  async addEvent(event) {
    const db = await this.initDB();
    return db.add('events', {
      ...event,
      createdAt: new Date()
    });
  }

  async getEvents(date) {
    const db = await this.initDB();
    return db.getAllFromIndex('events', 'by-date', date);
  }

  async getAllEvents() {
    const db = await this.initDB();
    return db.getAll('events');
  }

  async updateEvent(event) {
    const db = await this.initDB();
    await db.put('events', event);
  }

  async deleteEvent(id) {
    const db = await this.initDB();
    await db.delete('events', id);
  }

  // Reminders methods
  async addReminder(reminder) {
    const db = await this.initDB();
    return db.add('reminders', {
      ...reminder,
      createdAt: new Date()
    });
  }

  async getReminders() {
    const db = await this.initDB();
    return db.getAll('reminders');
  }

  async getUpcomingReminders() {
    const db = await this.initDB();
    const allReminders = await db.getAll('reminders');
    const now = new Date();
    return allReminders
      .filter(reminder => !reminder.completed && reminder.timestamp > now)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async updateReminder(reminder) {
    const db = await this.initDB();
    await db.put('reminders', reminder);
  }

  async deleteReminder(id) {
    const db = await this.initDB();
    await db.delete('reminders', id);
  }

  // Backup methods
  async exportData() {
    const events = await this.getAllEvents();
    const reminders = await this.getReminders();

    return {
      events,
      reminders,
      exportDate: new Date().toISOString()
    };
  }

  async importData(data) {
    const db = await this.initDB();

    // Clear existing data
    await db.clear('events');
    await db.clear('reminders');

    // Import new data
    for (const event of data.events) {
      await db.add('events', event);
    }
    for (const reminder of data.reminders) {
      await db.add('reminders', reminder);
    }
  }
}

export const dbService = new DatabaseService();
