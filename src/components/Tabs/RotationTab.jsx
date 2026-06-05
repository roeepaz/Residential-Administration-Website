

// WhatsApp group invite link
const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/EQ5XDj7Y6KaHcwM6eHRLlb';

export default function RotationTab({
  state,
  nextGuardRoomId,
  currentCleanerRoom,
  advanceCleaner,
  assignGuard
}) {
  const roomsChogerim = state.rooms.chogerim || [];
  const nextGuardRoom = roomsChogerim.find(r => r.id === nextGuardRoomId);

  const handleCleanerClick = () => {
    if (!currentCleanerRoom) return;

    const occupantNames = (state.tenants || [])
      .filter(t => t.roomId === currentCleanerRoom.id)
      .map(t => t.name)
      .join(', ');

    const roomDetails = occupantNames
      ? `חדר ${currentCleanerRoom.num} (${occupantNames})`
      : `חדר ${currentCleanerRoom.num}`;

    const confirmMessage = `האם ברצונך לשלוח הודעת WhatsApp לגבי ${roomDetails}?`;

    if (window.confirm(confirmMessage)) {
      const messageText = `חדר ${currentCleanerRoom.num} מנקה השבוע.

ביום שני- פחים פלוס לכלוך באזור הכיורים.
יום רביעי- פחים, שטיפה מלאה, כיורים`;

      // Copy to clipboard, alert user, and open group chat link
      navigator.clipboard.writeText(messageText)
        .then(() => {
          alert('ההודעה הועתקה ללוח! כעת תיפתח קבוצת הוואטסאפ, אנא הדבק (Ctrl+V) ושלח.');
          window.open(WHATSAPP_GROUP_LINK, '_blank', 'noopener,noreferrer');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          // Fallback in case navigator.clipboard is not supported or blocked
          const encodedText = encodeURIComponent(messageText);
          const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        });
    }
  };

  return (
    <div className="page">
      <div className="glass-panel card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title">🔄 סבב תפקידים — חוגרים</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="icon-btn"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(34, 197, 94, 0.16)',
                border: '2.5px solid var(--success)',
                color: 'var(--success)',
                cursor: 'pointer',
                transition: 'all 200ms ease'
              }}
              onClick={advanceCleaner}
              title="קדם מנקה"
            >
              🧹
            </button>
            <button
              className="icon-btn"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(251, 191, 36, 0.16)',
                border: '2.5px solid var(--warning)',
                color: 'var(--warning)',
                cursor: 'pointer',
                transition: 'all 200ms ease'
              }}
              onClick={assignGuard}
              title="קדם שומר"
            >
              🛡️
            </button>
          </div>
        </div>

        <div className="rotation-info" style={{ gap: '12px', marginBottom: '16px' }}>
          <div
            className={`rotation-box ${currentCleanerRoom ? 'clickable' : ''}`}
            onClick={currentCleanerRoom ? handleCleanerClick : undefined}
            title={currentCleanerRoom ? "לחץ כדי לשלוח הודעה בוואטסאפ" : undefined}
            style={{
              padding: '8px 12px',
              gap: '2px',
              background: 'rgba(34, 197, 94, 0.05)',
              borderColor: 'rgba(34, 197, 94, 0.25)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div className="label" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>🧹 מנקה שירותים השבוע</div>
            <div className="value green" style={{ fontSize: '1.05rem', color: 'var(--success)' }}>{currentCleanerRoom ? `חדר ${currentCleanerRoom.num}` : '—'}</div>
          </div>
          <div 
            className="rotation-box"
            style={{
              padding: '8px 12px',
              gap: '2px',
              background: 'rgba(251, 191, 36, 0.05)',
              borderColor: 'rgba(251, 191, 36, 0.25)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div className="label" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>🛡️ הבא לקבל שומר</div>
            <div className="value amber" style={{ fontSize: '1.05rem', color: 'var(--warning)' }}>
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
              .sort((a, b) => a.num.localeCompare(b.num, 'he', { numeric: true }))
              .map((r) => {
                const isClean = currentCleanerRoom?.id === r.id;
                const isGuard = r.id === nextGuardRoomId;
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
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
