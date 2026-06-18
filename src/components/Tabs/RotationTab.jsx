

import { useState } from 'react';
import { createPortal } from 'react-dom';

// WhatsApp group invite link
const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/DGD1ChySZXFKTZDsDgpMn8';
const WHATSAPP_MISDAR_LINK = 'https://chat.whatsapp.com/I0xTb8z2dyRAdgYltapEAz';

export default function RotationTab({
  state,
  nextGuardRoomId,
  currentCleanerRoom,
  advanceCleaner,
  assignGuard
}) {
  const [isMisdarModalOpen, setIsMisdarModalOpen] = useState(false);
  const [misdarName, setMisdarName] = useState('');
  const [misdarTime, setMisdarTime] = useState('08:30');

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
      const messageText = `*תורנות ניקיון שבועית*

*חדר ${currentCleanerRoom.num}* מנקה השבוע!

*הנחיות:*
• *יום שני:* פחים + לכלוך באזור הכיורים.
• *יום רביעי:* פחים, שטיפה מלאה, כיורים ואסלות.

תהיו חברים אחד של השני! ❤️`;

      // Copy to clipboard, alert user, and open group chat link
      navigator.clipboard.writeText(messageText)
        .then(() => {
          alert('ההודעה הועתקה ללוח! כעת תיפתח קבוצת הוואטסאפ, אנא הדבק (Ctrl+V) ושלח.');
          window.open(WHATSAPP_GROUP_LINK, '_blank', 'noopener,noreferrer');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          // Fallback in case navigator.clipboard is not supported or blocked
        });
    }
  };

  const handleSendMisdarMessage = () => {
    const trimmedName = misdarName.trim();
    if (!trimmedName || !misdarTime) return;

    const messageText = `📢 *תזכורת למסדר מגורים* 📢

שלום לכולם 🤩

🏡 *ביום חמישי בבוקר יתבצע מסדר מגורים עם ${trimmedName}*

⏰ *שעת התחלה:* ${misdarTime} במגורי החוגרים.
🫡 *הנוכחות חובה!*

• חדר עם פערים למסדר - מוזמנים לפנות אליי כמו תמיד.
• אם יש היעדרות - נא לעדכן בהקדם.`;

    // Copy to clipboard, alert user, and open group chat link
    navigator.clipboard.writeText(messageText)
      .then(() => {
        alert('הודעת המסדר הועתקה ללוח! כעת תיפתח קבוצת הוואטסאפ של המסדר, אנא הדבק (Ctrl+V) ושלח.');
        window.open(WHATSAPP_MISDAR_LINK, '_blank', 'noopener,noreferrer');
        setIsMisdarModalOpen(false);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        const encodedText = encodeURIComponent(messageText);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        setIsMisdarModalOpen(false);
      });
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
                background: 'rgba(129, 140, 248, 0.16)',
                border: '2.5px solid var(--indigo)',
                color: 'var(--indigo)',
                cursor: 'pointer',
                transition: 'all 200ms ease'
              }}
              onClick={() => setIsMisdarModalOpen(true)}
              title="הודעה על מסדר"
            >
              🫡
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

      {isMisdarModalOpen && createPortal(
        <div className="modal-bg open" onClick={(e) => {
          if (e.target.classList.contains('modal-bg')) {
            setIsMisdarModalOpen(false);
          }
        }}>
          <div className="modal" style={{ direction: 'rtl' }}>
            <h3>📋 תזכורת למסדר מגורים</h3>
            
            <div className="modal-group">
              <label htmlFor="misdar-name">שם הגורם הממסדר</label>
              <input
                id="misdar-name"
                type="text"
                placeholder="לדוגמא: לירן, נתניא"
                value={misdarName}
                onChange={(e) => setMisdarName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-group">
              <label htmlFor="misdar-time">שעת המסדר (החל מ-08:30)</label>
              <input
                id="misdar-time"
                type="time"
                min="08:30"
                value={misdarTime}
                onChange={(e) => setMisdarTime(e.target.value)}
                style={{
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setIsMisdarModalOpen(false)}>
                ביטול
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSendMisdarMessage}
                disabled={!misdarName.trim() || !misdarTime}
              >
                העתק ושלח
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
