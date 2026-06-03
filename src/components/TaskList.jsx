
import { EditIcon, DeleteIcon } from './Icons';
import { getWhatsAppLink } from '../utils/helpers';

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
                <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                  {isOverview ? (
                    <a
                      className="task-owner"
                      href={tenant.phone ? `tel:${tenant.phone}` : '#'}
                      style={{
                        background: 'rgba(59, 130, 246, 0.12)',
                        color: 'var(--primary)',
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                        cursor: tenant.phone ? 'pointer' : 'not-allowed',
                        textDecoration: 'none'
                      }}
                      title={tenant.phone ? `התקשר אל ${tenant.name}: ${tenant.phone}` : 'אין מספר טלפון מעודכן'}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!tenant.phone) {
                          e.preventDefault();
                          alert(`לא עודכן מספר טלפון עבור ${tenant.name}`);
                        }
                      }}
                    >
                      👤 {tenant.name} {tenantRoom ? `(חדר ${tenantRoom.num})` : '(ללא חדר)'}
                    </a>
                  ) : (
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
                  {tenant.phone && getWhatsAppLink(tenant.phone) && (
                    <a
                      href={getWhatsAppLink(tenant.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="whatsapp-link"
                      title={`שלח הודעת WhatsApp ל-${tenant.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.028 14.12 1.001 11.49 1c-5.447 0-9.873 4.372-9.877 9.802-.001 1.77.469 3.5 1.36 5.009L2.094 21.8l6.183-1.614c1.554.849 3.2 1.291 4.793 1.291z" />
                      </svg>
                    </a>
                  )}
                </span>
              )}
              {(t.contractorName || t.contractorPhone) && (
                <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', marginRight: '8px' }}>
                  {t.contractorPhone ? (
                    <a
                      className="task-owner"
                      href={`tel:${t.contractorPhone}`}
                      style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--success)',
                        borderColor: 'rgba(16, 185, 129, 0.2)',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        marginRight: 0
                      }}
                      title={`התקשר לבעל מקצוע (${t.contractorName || 'ללא שם'}): ${t.contractorPhone}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      🔧 {t.contractorName || 'בעל מקצוע'} 📞
                    </a>
                  ) : (
                    <span
                      className="task-owner"
                      style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--success)',
                        borderColor: 'rgba(16, 185, 129, 0.2)',
                        marginRight: 0
                      }}
                      title="שם בעל המקצוע"
                    >
                      🔧 {t.contractorName}
                    </span>
                  )}
                  {t.contractorPhone && getWhatsAppLink(t.contractorPhone) && (
                    <a
                      href={getWhatsAppLink(t.contractorPhone)}
                      target="_blank"
                      rel="noreferrer"
                      className="whatsapp-link"
                      title={`שלח הודעת WhatsApp ל-${t.contractorName || 'בעל המקצוע'}`}
                      style={{ marginRight: '6px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.028 14.12 1.001 11.49 1c-5.447 0-9.873 4.372-9.877 9.802-.001 1.77.469 3.5 1.36 5.009L2.094 21.8l6.183-1.614c1.554.849 3.2 1.291 4.793 1.291z" />
                      </svg>
                    </a>
                  )}
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
