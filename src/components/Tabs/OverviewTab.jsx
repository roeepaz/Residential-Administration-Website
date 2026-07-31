
import TaskList from '../TaskList';

export default function OverviewTab({
  state,
  stats,
  toggleTask,
  togglePriority,
  openEditTenant
}) {
  return (
    <div className="page">
      <div className="status-grid">
        <div className="glass-panel stat-card">
          <div className="stat-num blue">{stats.openTasks}</div>
          <div className="stat-label">תקלות פתוחות</div>
        </div>
        <div className="glass-panel stat-card indigo">
          <div className="stat-num indigo">{stats.totalSoldiers}</div>
          <div className="stat-label">סך הכל חיילים במגורים</div>
        </div>
      </div>

      <div className="grid-3">
        {/* חוגרים תקלות */}
        <div className="glass-panel card fault-section-card">
          <div className="card-header">
            <div className="card-title">🔵 תקלות חוגרים</div>
            <span className="badge badge-blue">
              {(state.tasks.chogerim || []).filter(t => !t.done).length} פתוחות
            </span>
          </div>
          <TaskList
            section="chogerim"
            items={state.tasks.chogerim}
            tenants={state.tenants}
            rooms={state.rooms}
            isOverview={true}
            toggleTask={toggleTask}
            openEditTenant={openEditTenant}
          />
        </div>

        {/* קצינים תקלות */}
        <div className="glass-panel card fault-section-card">
          <div className="card-header">
            <div className="card-title">🟡 תקלות קצינים</div>
            <span className="badge badge-amber">
              {(state.tasks.kzinim || []).filter(t => !t.done).length} פתוחות
            </span>
          </div>
          <TaskList
            section="kzinim"
            items={state.tasks.kzinim}
            tenants={state.tenants}
            rooms={state.rooms}
            isOverview={true}
            toggleTask={toggleTask}
            openEditTenant={openEditTenant}
          />
        </div>

        {/* חוגרות תקלות */}
        <div className="glass-panel card fault-section-card">
          <div className="card-header">
            <div className="card-title">🟢 תקלות חוגרות</div>
            <span className="badge badge-green">
              {(state.tasks.chogrot || []).filter(t => !t.done).length} פתוחות
            </span>
          </div>
          <TaskList
            section="chogrot"
            items={state.tasks.chogrot}
            tenants={state.tenants}
            rooms={state.rooms}
            isOverview={true}
            toggleTask={toggleTask}
            openEditTenant={openEditTenant}
          />
        </div>
      </div>

      <hr style={{ margin: '32px 0', borderColor: 'var(--border-color)' }} />

      <div className="section-title">🎯 עדיפויות כלליות</div>
      <div className="glass-panel card">
        <div className="task-list">
          {(state.priorities || []).map(p => (
            <div className={`task-item ${p.done ? 'done-fault' : 'open-fault'}`} key={p.id}>
              <div className="task-item-top">
                <button
                  type="button"
                  className={`status-toggle-btn ${p.done ? 'status-done' : 'status-open'}`}
                  onClick={() => togglePriority(p.id)}
                >
                  {p.done ? '🟢 הושלם' : '🔴 בביצוע'}
                </button>
              </div>
              <div className="task-text-container">
                <div className={`task-text ${p.done ? 'done-text' : ''}`}>{p.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
