import React, { useState, useEffect } from 'react';
import type { CalendarEvent } from '../types';
import { dbService } from '../services/database';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadEvents();
  }, [selectedDate]);

  const loadEvents = async () => {
    try {
      const eventsData = await dbService.getEvents(selectedDate);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const addEvent = async (title: string, description: string) => {
    try {
      await dbService.addEvent({
        title,
        description,
        date: selectedDate,
        color: '#3b82f6',
        createdAt: new Date()
      });
      loadEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      await dbService.deleteEvent(id);
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="calendar">
      <h2>Календарь</h2>

      <div className="date-selector">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="events-list">
        <h3>События на {selectedDate}</h3>
        {events.map(event => (
          <div key={event.id} className="event-item">
            <strong>{event.title}</strong>
            {event.description && <p>{event.description}</p>}
            <button onClick={() => deleteEvent(event.id!)}>Удалить</button>
          </div>
        ))}
        {events.length === 0 && <p>Нет событий на эту дату</p>}
      </div>

      <AddEventForm onAddEvent={addEvent} />
    </div>
  );
};

interface AddEventFormProps {
  onAddEvent: (title: string, description: string) => void;
}

const AddEventForm: React.FC<AddEventFormProps> = ({ onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddEvent(title.trim(), description.trim());
      setTitle('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-event-form">
      <input
        type="text"
        placeholder="Название события"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Описание (необязательно)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Добавить событие</button>
    </form>
  );
};

export default Calendar;
