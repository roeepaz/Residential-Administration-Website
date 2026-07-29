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

        // status badge styling
        const statusStyle = {
          display: 'inline-block',
          marginRight: '8px',
          padding: '2px 8px',
          borderRadius: '999px',
          fontSize: '0.75rem',
          lineHeight: '1',
          verticalAlign: 'middle',
          border: '1px solid transparent'
        };
        const statusColors = {
          'צריך לפתוח תקלה': { background: 'rgba(239, 68, 68, 0.08)', color: '#dc2626', borderColor: 'rgba(220,34,34,0.12)' },
          'נפתחה תקלה': { background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', borderColor: 'rgba(16,185,129,0.12)' }
        };
        const appliedStatusStyle = { ...statusStyle, ...(statusColors[t.status] || {}) };

        return (
          <div className={`task-item ${t.done ? 'done' : ''}`} key={t.id}>
            <div
              className={`task-check ${t.done ? 'checked' : ''}`}
              onClick={() => toggleTask(section, t.id)}
            />
            <div className="task-text">
              {t.text}
              {/* show status badge */}
              {t.status && <span style={appliedStatusStyle}>{t.status}</span>}

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
                      style={{ marginLeft: 6 }}
                    >
                      💬
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
                      💬
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
