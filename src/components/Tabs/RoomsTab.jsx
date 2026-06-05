
import { PlusIcon, EditIcon, DeleteIcon } from '../Icons';

export default function RoomsTab({
  state,
  nextGuardRoomId,
  openAddRoom,
  openEditRoom,
  deleteRoom,
  openEditTenant
}) {
  const sections = ['chogerim', 'kzinim', 'chogrot'];

  return (
    <div className="page">
      <div className="grid-3">
        {sections.map((sec) => {
          const title = sec === 'chogerim' ? '🔵 חוגרים' : sec === 'kzinim' ? '🟡 קצינים' : '🟢 חוגרות';
          const rooms = state.rooms[sec] || [];
          const cleanerIdx = state.rotation.cleanerIndex;
          const nextGuardId = nextGuardRoomId;

          return (
            <div className="glass-panel card" key={sec}>
              <div className="card-header">
                <div className="card-title">{title}</div>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  onClick={() => openAddRoom(sec)}
                >
                  <PlusIcon /> חדר
                </button>
              </div>
              <div className="room-list">
                {rooms.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    אין חדרים
                  </div>
                ) : (
                  rooms.map(r => {
                    const isCleaner = sec === 'chogerim' && state.rooms.chogerim[cleanerIdx]?.id === r.id;
                    const isNextGuard = sec === 'chogerim' && r.id === nextGuardId;
                    const occupants = (state.tenants || []).filter(t => t.roomId === r.id);

                    return (
                      <div className="room-item" key={r.id}>
                        <div className="room-details">
                          <div className="room-num">חדר {r.num}</div>
                          <div className="room-occupants">
                            {occupants.length > 0 ? (
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '2px 0' }}>
                                {occupants.map((occ) => (
                                  <span
                                    className="badge badge-blue"
                                    style={{ fontSize: '0.8rem', padding: '6px 12px', cursor: 'pointer' }}
                                    key={occ.id}
                                    title={`טלפון: ${occ.phone || 'אין'} | עיר: ${occ.city || 'אין'}`}
                                    onClick={() => openEditTenant(occ.id)}
                                  >
                                    {occ.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="room-occupants-empty">חדר ריק</span>
                            )}
                          </div>
                        </div>
                        <div className="room-tags">
                          {isCleaner && <span className="tag tag-cleaner">🧹 מנקה</span>}
                          {isNextGuard && <span className="tag tag-guard">🛡️ לשומר</span>}
                        </div>
                        <div className="task-actions" style={{ opacity: 1 }}>
                          <button
                            className="icon-btn"
                            onClick={() => openEditRoom(sec, r.id)}
                            aria-label="ערוך חדר"
                          >
                            <EditIcon />
                          </button>
                          <button
                            className="icon-btn del"
                            onClick={() => deleteRoom(sec, r.id)}
                            aria-label="מחק חדר"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
