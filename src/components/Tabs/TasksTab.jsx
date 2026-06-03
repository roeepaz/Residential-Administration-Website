
import TaskList from '../TaskList';
import { PlusIcon } from '../Icons';

export default function TasksTab({
  state,
  toggleTask,
  deleteTask,
  openAddTask,
  openEditTask,
  openEditTenant
}) {
  return (
    <div className="page">
      <div className="grid-3">
        {/* חוגרים */}
        <div className="glass-panel card">
          <div className="card-header">
            <div className="card-title">🔵 חוגרים</div>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => openAddTask('chogerim')}
            >
              <PlusIcon /> הוסף
            </button>
          </div>
          <TaskList
            section="chogerim"
            items={state.tasks.chogerim}
            tenants={state.tenants}
            rooms={state.rooms}
            isOverview={false}
            toggleTask={toggleTask}
            openEditTenant={openEditTenant}
            openEditTask={openEditTask}
            deleteTask={deleteTask}
          />
        </div>

        {/* קצינים */}
        <div className="glass-panel card">
          <div className="card-header">
            <div className="card-title">🟡 קצינים</div>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => openAddTask('kzinim')}
            >
              <PlusIcon /> הוסף
            </button>
          </div>
          <TaskList
            section="kzinim"
            items={state.tasks.kzinim}
            tenants={state.tenants}
            rooms={state.rooms}
            isOverview={false}
            toggleTask={toggleTask}
            openEditTenant={openEditTenant}
            openEditTask={openEditTask}
            deleteTask={deleteTask}
          />
        </div>

        {/* חוגרות */}
        <div className="glass-panel card">
          <div className="card-header">
            <div className="card-title">🟢 חוגרות</div>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => openAddTask('chogrot')}
            >
              <PlusIcon /> הוסף
            </button>
          </div>
          <TaskList
            section="chogrot"
            items={state.tasks.chogrot}
            tenants={state.tenants}
            rooms={state.rooms}
            isOverview={false}
            toggleTask={toggleTask}
            openEditTenant={openEditTenant}
            openEditTask={openEditTask}
            deleteTask={deleteTask}
          />
        </div>
      </div>
    </div>
  );
}
