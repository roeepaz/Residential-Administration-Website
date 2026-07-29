
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
  deleteTask,
  updateTaskStatus
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

        // color: red for "צריך לפתוח תקלה", green for "נפתחה תקלה", default to blue-ish
        const statusStyle = t.status === 'צריך לפתוח תקלה'
          ? { background: 'rgba(248, 113, 113, 0.12)', color: '#ef4444', borderColor: 'rgba(248, 113, 113, 0.2)' }
          : t.status === 'נפתחה תקלה'
            ? { background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }
            : { background: 'rgba(59, 130, 246, 0.12)', color: 'var(--primary)', borderColor: 'rgba(59, 130, 246, 0.2)' };

        const handleStatusClick = (e) => {
          e.stopPropagation();
          if (!updateTaskStatus) return;
          const newStatus = t.status === 'נפתחה תקלה' ? 'צריך לפתוח תקלה' : 'נפתחה תקלה';
          updateTaskStatus(section, t.id, newStatus);
        };

        return (
          <div className={`task-item ${t.done ? 'done' : ''}`} key={t.id}>
            <div
              className={`task-check ${t.done ? 'checked' : ''}`}
              onClick={() => toggleTask(section, t.id)}
            />
            <div className="task-text">
              {t.text}
              {t.status && (
                <span
                  onClick={(e) => { if (isOverview) handleStatusClick(e); }}
                  title={isOverview ? 'לחץ כדי לשנות סטטוס' : ''}
                  style={{
                    display: 'inline-block',
                    marginRight: '8px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    border: '1px solid',
                    verticalAlign: 'middle',
                    cursor: isOverview && updateTaskStatus ? 'pointer' : 'default',
                    ...statusStyle
                  }}
                >
                  {t.status}
                </span>
              )}
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
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.[...]" />
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
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6[...]" />
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
