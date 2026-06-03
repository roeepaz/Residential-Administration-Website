
import { PlusIcon, DeleteIcon } from '../Icons';

export default function PrioritiesTab({
  state,
  togglePriority,
  deletePriority,
  openAddPriority
}) {
  const priorities = state.priorities || [];

  return (
    <div className="page">
      <div className="glass-panel card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <div className="card-title">🎯 עדיפויות לקדם</div>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={openAddPriority}
          >
            <PlusIcon /> הוסף
          </button>
        </div>

        <div className="task-list">
          {priorities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)' }}>
              אין עדיפויות מוגדרות
            </div>
          ) : (
            priorities.map((p) => (
              <div className={`task-item ${p.done ? 'done' : ''}`} key={p.id}>
                <div
                  className={`task-check ${p.done ? 'checked' : ''}`}
                  onClick={() => togglePriority(p.id)}
                />
                <div className="task-text">{p.text}</div>
                <div className="task-actions">
                  <button
                    className="icon-btn del"
                    onClick={() => deletePriority(p.id)}
                    aria-label="מחק עדיפות"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
