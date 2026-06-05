import { useState } from 'react';
import { RoomsIcon, DeleteIcon } from '../Icons';
import { uid } from '../../utils/helpers';

export default function RoomModal({
  isOpen,
  room,
  section,
  tenants = [],
  rooms = {},
  onSave,
  onClose
}) {
  const [num, setNum] = useState(room?.num || '');
  const [tenantIds, setTenantIds] = useState(() => 
    room?.id ? tenants.filter(t => t.roomId === room.id).map(t => t.id) : []
  );
  const [newTenants, setNewTenants] = useState([]);

  const [selectedTenantToAdd, setSelectedTenantToAdd] = useState('');
  const [quickTenantName, setQuickTenantName] = useState('');
  const [quickTenantPhone, setQuickTenantPhone] = useState('');
  const [quickTenantCity, setQuickTenantCity] = useState('');

  if (!isOpen) return null;

  const handleBgClick = (e) => {
    if (e.target.classList.contains('modal-bg')) {
      onClose();
    }
  };

  const handleSave = () => {
    const trimmedNum = num.trim();
    if (!trimmedNum) return;
    onSave(trimmedNum, tenantIds, newTenants);
  };

  const handleAddExisting = () => {
    if (!selectedTenantToAdd) return;
    if (!tenantIds.includes(selectedTenantToAdd)) {
      setTenantIds(prev => [...prev, selectedTenantToAdd]);
    }
    setSelectedTenantToAdd('');
  };

  const handleQuickCreate = () => {
    const name = quickTenantName.trim();
    if (!name) return;
    const newTenant = {
      id: uid(),
      name,
      phone: quickTenantPhone.trim(),
      city: quickTenantCity.trim(),
      roomId: room?.id || 'temp',
      section: section,
      hanfatsot: 0
    };
    setNewTenants(prev => [...prev, newTenant]);
    setQuickTenantName('');
    setQuickTenantPhone('');
    setQuickTenantCity('');
  };

  const handleRemoveExisting = (tid) => {
    setTenantIds(prev => prev.filter(id => id !== tid));
  };

  const handleRemoveNew = (nid) => {
    setNewTenants(prev => prev.filter(t => t.id !== nid));
  };

  return (
    <div className="modal-bg open" onClick={handleBgClick}>
      <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>
          <RoomsIcon /> {room ? 'ערוך חדר' : 'הוסף חדר'}
        </h3>
        <div className="modal-group">
          <label htmlFor="room-num">מספר חדר</label>
          <input
            id="room-num"
            type="text"
            placeholder="למשל: 104, 5, גיל..."
            value={num}
            onChange={(e) => setNum(e.target.value)}
          />
        </div>

        <div className="modal-group">
          <label>דיירים בחדר</label>
          {tenantIds.length === 0 && newTenants.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              אין דיירים בחדר זה.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {tenantIds.map(tid => {
                const tenant = tenants.find(t => t.id === tid);
                if (!tenant) return null;
                return (
                  <div
                    key={tid}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-tertiary)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>
                      {tenant.name} ({tenant.city || 'אין עיר'})
                    </span>
                    <button
                      type="button"
                      className="icon-btn del"
                      style={{ width: '24px', height: '24px' }}
                      onClick={() => handleRemoveExisting(tid)}
                      aria-label="הסר דייר"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                );
              })}
              {newTenants.map(nt => (
                <div
                  key={nt.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>
                    {nt.name} *חדש* ({nt.city || 'אין עיר'})
                  </span>
                  <button
                    type="button"
                    className="icon-btn del"
                    style={{ width: '24px', height: '24px' }}
                    onClick={() => handleRemoveNew(nt.id)}
                    aria-label="הסר דייר חדש"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-group">
          <label htmlFor="add-existing-tenant">שייך דייר קיים לחדר</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              id="add-existing-tenant"
              value={selectedTenantToAdd}
              onChange={(e) => setSelectedTenantToAdd(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">בחר דייר...</option>
              {tenants
                .filter(t => !tenantIds.includes(t.id) && t.roomId !== room?.id)
                .map(t => {
                  const currentRoom = t.roomId ? (rooms[t.section] || []).find(r => r.id === t.roomId) : null;
                  const locationLabel = currentRoom ? `חדר ${currentRoom.num}` : 'ללא חדר';
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} ({locationLabel})
                    </option>
                  );
                })}
            </select>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: '0 16px' }}
              onClick={handleAddExisting}
            >
              שייך
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '16px' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            או צור דייר חדש ושייך לחדר
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              placeholder="שם הדייר"
              value={quickTenantName}
              onChange={(e) => setQuickTenantName(e.target.value)}
            />
            <input
              type="text"
              placeholder="טלפון"
              value={quickTenantPhone}
              onChange={(e) => setQuickTenantPhone(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="עיר מגורים"
              value={quickTenantCity}
              onChange={(e) => setQuickTenantCity(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-green"
              style={{ fontSize: '0.85rem', padding: '0 16px' }}
              onClick={handleQuickCreate}
            >
              צור ושייך
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>ביטול</button>
          <button className="btn btn-primary" onClick={handleSave}>שמור</button>
        </div>
      </div>
    </div>
  );
}
