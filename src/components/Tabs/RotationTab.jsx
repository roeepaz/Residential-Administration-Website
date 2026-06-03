

export default function RotationTab({
  state,
  nextGuardRoomId,
  currentCleanerRoom,
  advanceCleaner,
  assignGuard
}) {
  const roomsChogerim = state.rooms.chogerim || [];
  const nextGuardRoom = roomsChogerim.find(r => r.id === nextGuardRoomId);

  return (
    <div className="page">
      <div className="glass-panel card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <div className="card-title">🔄 סבב תפקידים — חוגרים</div>
        </div>

        <div className="rotation-info">
          <div className="rotation-box">
            <div className="label">🧹 מנקה שירותים השבוע</div>
            <div className="value green">{currentCleanerRoom ? `חדר ${currentCleanerRoom.num}` : '—'}</div>
          </div>
          <div className="rotation-box">
            <div className="label">🛡️ הבא לקבל שומר</div>
            <div className="value amber">
              {nextGuardRoom ? `חדר ${nextGuardRoom.num}` : '—'}
            </div>
          </div>
        </div>

        <div className="room-list" style={{ marginBottom: '24px' }}>
          {roomsChogerim.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)' }}>
              אין חדרים להצגה בסבב
            </div>
          ) : (
            [...roomsChogerim]
              .sort((a, b) => (state.rotation.guardScores[a.id] || 0) - (state.rotation.guardScores[b.id] || 0))
              .map((r) => {
                const isClean = currentCleanerRoom?.id === r.id;
                const isGuard = r.id === nextGuardRoomId;
                const count = state.rotation.guardScores[r.id] || 0;
                const occupantNames = (state.tenants || [])
                  .filter(t => t.roomId === r.id)
                  .map(t => t.name)
                  .join(', ') || 'ריק';

                return (
                  <div className="room-item" key={r.id}>
                    <div className="room-num">חדר {r.num}</div>
                    <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)', paddingRight: '12px' }}>
                      {occupantNames}
                    </div>
                    <div className="room-tags">
                      {isClean && <span className="tag tag-cleaner">🧹 מנקה השבוע</span>}
                      {isGuard && <span className="tag tag-guard">🛡️ שומר הבא</span>}
                      <span className="badge badge-blue">שמירות: {count}</span>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-green" onClick={advanceCleaner}>⬆️ קדם מנקה</button>
          <button className="btn btn-primary" onClick={assignGuard}>🛡️ הקצה שומר לחדר הבא</button>
        </div>
      </div>
    </div>
  );
}
