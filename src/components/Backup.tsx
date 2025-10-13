import React, { useRef } from 'react';
import { dbService } from '../services/database';

const Backup: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const data = await dbService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Ошибка при экспорте данных');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (confirm('Вы уверены? Это перезапишет все текущие данные.')) {
        await dbService.importData(data);
        alert('Данные успешно импортированы!');
        window.location.reload(); // Обновляем приложение
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Ошибка при импорте данных');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="backup">
      <button onClick={handleExport}>Экспорт данных</button>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".json"
          style={{ display: 'none' }}
        />
        <button onClick={() => fileInputRef.current?.click()}>
          Импорт данных
        </button>
      </div>
    </div>
  );
};

export default Backup;
