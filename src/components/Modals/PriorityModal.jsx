import { useState } from 'react';
import { PrioritiesIcon } from '../Icons';

export default function PriorityModal({ isOpen, priority, onSave, onClose }) {
  const [text, setText] = useState(priority?.text || '');

  if (!isOpen) return null;

  const handleBgClick = (e) => {
    if (e.target.classList.contains('modal-bg')) {
      onClose();
    }
  };

  const handleSave = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    onSave(trimmedText);
  };

  return (
    <div className="modal-bg open" onClick={handleBgClick}>
      <div className="modal">
        <h3>
          <PrioritiesIcon /> {priority ? 'ערוך עדיפות' : 'הוסף עדיפות'}
        </h3>
        <div className="modal-group">
          <label htmlFor="priority-text">תיאור העדיפות לקדם</label>
          <input
            id="priority-text"
            type="text"
            placeholder="למשל: גיבוש המגורים, שיפוץ מועדון..."
            value={text}
            onChange={(e) => setText(e.target.value)}
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
