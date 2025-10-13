import React, { useState, useEffect } from 'react';
import type { Reminder } from '../types';
import { dbService } from '../services/database';

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const allReminders = await dbService.getReminders();
      const upcoming = await dbService.getUpcomingReminders();
      setReminders(allReminders);
      setUpcomingReminders(upcoming);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const addReminder = async (title: string, timestamp: Date, description: string) => {
    try {
      await dbService.addReminder({
        title,
        timestamp,
        description,
        completed: false,
        createdAt: new Date()
      });
      loadReminders();
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const toggleReminder = async (reminder: Reminder) => {
    try {
      await dbService.updateReminder({
        ...reminder,
        completed: !reminder.completed
      });
      loadReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const deleteReminder = async (id: number) => {
    try {
      await dbService.deleteReminder(id);
      loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  return (
    <div className="reminders">
      <h2>Напоминания</h2>

      <div className="reminders-lists">
        <div className="upcoming-reminders">
          <h3>Предстоящие</h3>
          {upcomingReminders.map(reminder => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onToggle={toggleReminder}
              onDelete={deleteReminder}
            />
          ))}
        </div>

        <div className="all-reminders">
          <h3>Все напоминания</h3>
          {reminders.map(reminder => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onToggle={toggleReminder}
              onDelete={deleteReminder}
            />
          ))}
        </div>
      </div>

      <AddReminderForm onAddReminder={addReminder} />
    </div>
  );
};

interface ReminderItemProps {
  reminder: Reminder;
  onToggle: (reminder: Reminder) => void;
  onDelete: (id: number) => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({
                                                     reminder,
                                                     onToggle,
                                                     onDelete
                                                   }) => {
  return (
    <div className={`reminder-item ${reminder.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={reminder.completed}
        onChange={() => onToggle(reminder)}
      />
      <div className="reminder-content">
        <strong>{reminder.title}</strong>
        <span>{reminder.timestamp.toLocaleString()}</span>
        {reminder.description && <p>{reminder.description}</p>}
      </div>
      <button onClick={() => onDelete(reminder.id!)}>Удалить</button>
    </div>
  );
};

interface AddReminderFormProps {
  onAddReminder: (title: string, timestamp: Date, description: string) => void;
}

const AddReminderForm: React.FC<AddReminderFormProps> = ({ onAddReminder }) => {
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && datetime) {
      onAddReminder(title.trim(), new Date(datetime), description.trim());
      setTitle('');
      setDatetime('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-reminder-form">
      <input
        type="text"
        placeholder="Название напоминания"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
        required
      />
      <textarea
        placeholder="Описание (необязательно)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Добавить напоминание</button>
    </form>
  );
};

export default Reminders;
