
import { PlusIcon, EditIcon, DeleteIcon } from '../Icons';
import { getWhatsAppLink } from '../../utils/helpers';

export default function TenantsTab({
  state,
  tenantSearch,
  setTenantSearch,
  tenantSectionFilter,
  setTenantSectionFilter,
  filteredTenants = [],
  toggleTask,
  openAddTenant,
  openEditTenant,
  deleteTenant,
  incrementHanfatsot,
  decrementHanfatsot
}) {
  return (
    <div className="page">
      <div className="card-header" style={{ borderBottom: 'none', marginBottom: '16px' }}>
        <div className="card-title">👥 ניהול דיירים</div>
        <button className="btn btn-primary" onClick={openAddTenant}>
          <PlusIcon /> הוסף דייר
        </button>
      </div>

      {/* Search and Filter bar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          className="search-bar"
          placeholder="חיפוש דייר לפי שם, טלפון, עיר, חדר..."
          value={tenantSearch}
          onChange={(e) => setTenantSearch(e.target.value)}
        />

        <div className="tabs" style={{ background: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          {['all', 'chogerim', 'kzinim', 'chogrot'].map((sec) => (
            <button
              key={sec}
              className={`tab-btn ${tenantSectionFilter === sec ? 'active' : ''}`}
              onClick={() => setTenantSectionFilter(sec)}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {sec === 'all' ? 'הכל' : sec === 'chogerim' ? 'חוגרים' : sec === 'kzinim' ? 'קצינים' : 'חוגרות'}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="grid-3">
        {filteredTenants.length === 0 ? (
          <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
            לא נמצאו דיירים תואמים
          </div>
        ) : (
          filteredTenants.map(t => {
            const room = t.roomId ? (state.rooms[t.section] || []).find(r => r.id === t.roomId) : null;
            const tenantTasks = ['chogerim', 'kzinim', 'chogrot'].reduce((acc, sec) => {
              const tasks = (state.tasks[sec] || []).filter(task => task.assignedTenantId === t.id && !task.done);
              return [...acc, ...tasks.map(task => ({ ...task, section: sec }))];
            }, []);

            return (
              <div className="glass-panel card tenant-card" key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px' }}>
                {/* Row 1: Header (Name, Population Badge, Room Number, Edit button) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800' }}>{t.name}</h4>
                    <span className={`badge ${t.section === 'chogerim' ? 'badge-blue' : t.section === 'kzinim' ? 'badge-amber' : 'badge-green'}`} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                      {t.section === 'chogerim' ? 'חוגר' : t.section === 'kzinim' ? 'קצין' : 'חוגרת'}
                    </span>
                    <span className="badge badge-blue num-font" style={{ padding: '2px 8px', fontSize: '0.72rem', background: 'rgba(59, 130, 246, 0.08)' }} title="חדר">
                      🔑 {room ? room.num : 'ללא חדר'}
                    </span>
                  </div>
                  <button 
                    className="icon-btn" 
                    style={{ width: '32px', height: '32px' }} 
                    onClick={() => openEditTenant(t.id)} 
                    aria-label="ערוך דייר"
                  >
                    <EditIcon />
                  </button>
                </div>

                {/* Row 2: Phone & City (Compact horizontal list) */}
                {(t.phone || t.city) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {t.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📞 <a href={`tel:${t.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>{t.phone}</a>
                        {getWhatsAppLink(t.phone) && (
                          <a href={getWhatsAppLink(t.phone)} target="_blank" rel="noreferrer" className="whatsapp-link" style={{ width: '22px', height: '22px', marginInlineStart: '4px' }} title="WhatsApp">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.028 14.12 1.001 11.49 1c-5.447 0-9.873 4.372-9.877 9.802-.001 1.77.469 3.5 1.36 5.009L2.094 21.8l6.183-1.614c1.554.849 3.2 1.291 4.793 1.291z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                    {t.phone && t.city && <span style={{ opacity: 0.4 }}>•</span>}
                    {t.city && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📍 {t.city}
                      </div>
                    )}
                  </div>
                )}

                {/* Row 3: Hanfatsot (Compact) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.015)',
                  border: '1px solid var(--border-color)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '2px'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                    🪖 הנפצות שבוצעו:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      className="icon-btn"
                      style={{ width: '26px', height: '26px', fontSize: '0.9rem', fontWeight: '700' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        decrementHanfatsot(t.id);
                      }}
                      title="הורד הנפצה"
                    >
                      -
                    </button>
                    <span className="num-font" style={{ fontWeight: '800', fontSize: '0.95rem', minWidth: '16px', textAlign: 'center' }}>
                      {t.hanfatsot || 0}
                    </span>
                    <button
                      className="icon-btn"
                      style={{ width: '26px', height: '26px', fontSize: '0.9rem', fontWeight: '700', color: 'var(--success)', borderColor: 'rgba(34,197,94,0.3)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        incrementHanfatsot(t.id);
                      }}
                      title="הוסף הנפצה"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
