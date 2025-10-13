import React from 'react';
import Calendar from './components/Calendar';
import Reminders from './components/Reminders';
import Backup from './components/Backup';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>📅 Мой Ежедневник</h1>
        <Backup />
      </header>

      <main className="app-main">
        <div className="app-column">
          <Calendar />
        </div>
        <div className="app-column">
          <Reminders />
        </div>
      </main>
    </div>
  );
};

export default App;
