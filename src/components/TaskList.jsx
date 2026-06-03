
import { EditIcon, DeleteIcon } from './Icons';

export default function TaskList({
  section,
  items = [],
  tenants = [],
  rooms = {},
  isOverview = false,
  toggleTask,
  openEditTenant,
  openEditTask,
  deleteTask
}) {
  const list = isOverview ? items.filter(t => !t.done) : items;

  if (list.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        אין תקלות
      </div>
    );
  }

  return (
    <div className="task-list">
      {list.map(t => {
        const tenant = t.assignedTenantId ? tenants.find(x => x.id === t.assignedTenantId) : null;
        const tenantRoom = tenant && tenant.roomId ? (rooms[tenant.section] || []).find(r => r.id === tenant.roomId) : null;

        return (
          <div className={`task-item ${t.done ? 'done' : ''}`} key={t.id}>
            <div
              className={`task-check ${t.done ? 'checked' : ''}`}
              onClick={() => toggleTask(section, t.id)}
            />
            <div className="task-text">
              {t.text}
              {tenant && (
                <span
                  className="task-owner"
                  style={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    color: 'var(--primary)',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    cursor: 'pointer'
                  }}
                  title={`טלפון: ${tenant.phone || 'אין'} | עיר: ${tenant.city || 'אין'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditTenant(tenant.id);
                  }}
                >
                  👤 {tenant.name} {tenantRoom ? `(חדר ${tenantRoom.num})` : '(ללא חדר)'}
                </span>
              )}
              {t.owner && <span className="task-owner">{t.owner}</span>}
            </div>
            {!isOverview && (
              <div className="task-actions">
                <button
                  className="icon-btn"
                  onClick={() => openEditTask(section, t.id)}
                  aria-label="ערוך משימה"
                >
                  <EditIcon />
                </button>
                <button
                  className="icon-btn del"
                  onClick={() => deleteTask(section, t.id)}
                  aria-label="מחק משימה"
                >
                  <DeleteIcon />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
