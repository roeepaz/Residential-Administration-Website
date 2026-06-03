import { useState } from 'react';
import { TenantsIcon } from '../Icons';

export default function TenantModal({ isOpen, tenant, rooms = {}, onSave, onClose }) {
  const [name, setName] = useState(tenant?.name || '');
  const [phone, setPhone] = useState(tenant?.phone || '');
  const [city, setCity] = useState(tenant?.city || '');
  const [section, setSection] = useState(tenant?.section || 'chogerim');
  const [roomId, setRoomId] = useState(tenant?.roomId || '');

  if (!isOpen) return null;

  const handleBgClick = (e) => {
    if (e.target.classList.contains('modal-bg')) {
      onClose();
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave(trimmedName, phone.trim(), city.trim(), roomId, section);
  };

  const handleSectionChange = (e) => {
    const newSec = e.target.value;
    setSection(newSec);
    setRoomId(''); // Reset room assignment if section changes
  };

  return (
    <div className="modal-bg open" onClick={handleBgClick}>
      <div className="modal">
        <h3>
          <TenantsIcon /> {tenant ? 'ערוך דייר' : 'הוסף דייר'}
        </h3>
        <div className="modal-group">
          <label htmlFor="tenant-name">שם הדייר</label>
          <input
            id="tenant-name"
            type="text"
            placeholder="שם מלא..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="modal-group">
          <label htmlFor="tenant-phone">מספר טלפון</label>
          <input
            id="tenant-phone"
            type="text"
            placeholder="למשל: 050-1234567..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="modal-group">
          <label htmlFor="tenant-city">עיר מגורים</label>
          <input
            id="tenant-city"
            type="text"
            placeholder="למשל: תל אביב, חיפה..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div className="modal-group">
          <label htmlFor="tenant-section">סוג אוכלוסייה</label>
          <select
            id="tenant-section"
            value={section}
            onChange={handleSectionChange}
          >
            <option value="chogerim">חוגר</option>
            <option value="kzinim">קצין</option>
            <option value="chogrot">חוגרת</option>
          </select>
        </div>
        <div className="modal-group">
          <label htmlFor="tenant-room">שיוך לחדר (אופציונלי)</label>
          <select
            id="tenant-room"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          >
            <option value="">ללא חדר</option>
            {(rooms[section] || []).map(r => (
              <option key={r.id} value={r.id}>
                חדר {r.num}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>ביטול</button>
          <button className="btn btn-primary" onClick={handleSave}>שמור</button>
        </div>
      </div>
    </div>
  );
}
