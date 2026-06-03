import { useState } from 'react';
import { TasksIcon } from '../Icons';

export default function TaskModal({ isOpen, task, tenants = [], rooms = {}, onSave, onClose }) {
  const [text, setText] = useState(task?.text || '');
  const [assignedTenantId, setAssignedTenantId] = useState(task?.assignedTenantId || '');
  const [owner, setOwner] = useState(task?.owner || '');
  const [contractorName, setContractorName] = useState(task?.contractorName || '');
  const [contractorPhone, setContractorPhone] = useState(task?.contractorPhone || '');

  if (!isOpen) return null;

  const handleBgClick = (e) => {
    if (e.target.classList.contains('modal-bg')) {
      onClose();
    }
  };

  const handleSave = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    onSave(trimmedText, owner.trim(), assignedTenantId, contractorName.trim(), contractorPhone.trim());
  };

  return (
    <div className="modal-bg open" onClick={handleBgClick}>
      <div className="modal">
        <h3>
          <TasksIcon /> {task ? 'ערוך תקלה / משימה' : 'הוסף תקלה / משימה'}
        </h3>
        <div className="modal-group">
          <label htmlFor="task-text">תיאור המשימה/תקלה</label>
          <input
            id="task-text"
            type="text"
            placeholder="למשל: סתימה בכיור, פינת ישיבה..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="modal-group">
          <label htmlFor="task-assignee">שייך לדייר (אופציונלי)</label>
          <select
            id="task-assignee"
            value={assignedTenantId}
            onChange={(e) => setAssignedTenantId(e.target.value)}
          >
            <option value="">בחר דייר...</option>
            {[...tenants]
              .sort((a, b) => a.name.localeCompare(b.name, 'he'))
              .map(t => {
                const room = t.roomId ? (rooms[t.section] || []).find(r => r.id === t.roomId) : null;
                const label = `${t.name} ${room ? `(חדר ${room.num})` : '(ללא חדר)'} - ${t.section === 'chogerim' ? 'חוגר' : t.section === 'kzinim' ? 'קצין' : 'חוגרת'}`;
                return (
                  <option key={t.id} value={t.id}>
                    {label}
                  </option>
                );
              })}
          </select>
        </div>
        <div className="modal-group">
          <label htmlFor="task-contractor-name">שם בעל המקצוע (אופציונלי)</label>
          <input
            id="task-contractor-name"
            type="text"
            placeholder="למשל: משה האינסטלטור, שירות מזגנים..."
            value={contractorName}
            onChange={(e) => setContractorName(e.target.value)}
          />
        </div>
        <div className="modal-group">
          <label htmlFor="task-contractor-phone">טלפון בעל המקצוע (אופציונלי)</label>
          <input
            id="task-contractor-phone"
            type="tel"
            placeholder="למשל: 052-1234567"
            value={contractorPhone}
            onChange={(e) => setContractorPhone(e.target.value)}
          />
        </div>
        <div className="modal-group">
          <label htmlFor="task-owner">הערת סטטוס / גורם מטפל נוסף (אופציונלי)</label>
          <input
            id="task-owner"
            type="text"
            placeholder="למשל: בתהליך, אצל נתניא, ספק חיצוני..."
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>ביטול</button>
          <button className="btn btn-primary" onClick={handleSave}>שמור</button>
        </div>
      </div>
    </div>
  );
}
