import { useState, useEffect, useMemo } from 'react';

// Icons
import {
  HomeIcon,
  TasksIcon,
  RoomsIcon,
  TenantsIcon,
  RotationIcon,
  PrioritiesIcon,
  SunIcon,
  MoonIcon
} from './components/Icons';

// Tabs
import OverviewTab from './components/Tabs/OverviewTab';
import TasksTab from './components/Tabs/TasksTab';
import RoomsTab from './components/Tabs/RoomsTab';
import TenantsTab from './components/Tabs/TenantsTab';
import RotationTab from './components/Tabs/RotationTab';
import PrioritiesTab from './components/Tabs/PrioritiesTab';

// Modals
import TaskModal from './components/Modals/TaskModal';
import RoomModal from './components/Modals/RoomModal';
import PriorityModal from './components/Modals/PriorityModal';
import TenantModal from './components/Modals/TenantModal';

// Helpers
import { uid } from './utils/helpers';

// ─── DEFAULT DATA ───
const DEFAULT_DATA = {
  tasks: {
    chogerim: [
      { id: 't1', text: 'קו מים', owner: 'בתהליך', done: false },
      { id: 't2', text: 'פינת ישיבה', owner: 'אצל נתניא', done: false }
    ],
    kzinim: [
      { id: 't3', text: 'תקלה מתמשכת של הפסקות חשמל', owner: '', done: false },
      { id: 't4', text: 'באחד החדרים יש רק שתי מיטות יחיד', owner: '', done: false },
      { id: 't5', text: 'בעיית מקום — צריך לדלל אנשים', owner: '', done: false },
      { id: 't6', text: 'לקדם מקום ישיבה — לדבר עם האנשים שם', owner: '', done: false }
    ],
    chogrot: [
      { id: 't7', text: 'חדר חדש — הזמנת רכש ברגע שקדוש יאשר', owner: '', done: false }
    ]
  },
  rooms: {
    chogerim: [
      { id: 'r1', num: '1', occupants: 'עידו, רועי, יוני' },
      { id: 'r2', num: '2', occupants: 'שון, אסף, שי' },
      { id: 'r3', num: '3', occupants: 'אליה, יהלי, בר' },
      { id: 'r4', num: '4', occupants: '' },
      { id: 'r5', num: '6', occupants: 'דביר, אוריאל, שי' }
    ],
    kzinim: [
      { id: 'r6', num: '1', occupants: 'ברברה' },
      { id: 'r7', num: '2', occupants: 'נדב, נועם' },
      { id: 'r8', num: '3', occupants: 'עומר פורת, יואב' },
      { id: 'r9', num: '4', occupants: 'אופק, סער' },
      { id: 'r10', num: '5', occupants: 'עומר, ורד, אנדי, אורי' }
    ],
    chogrot: [
      { id: 'r11', num: '1', occupants: 'עינב, רומי, אדוה, שירה' },
      { id: 'r12', num: '2', occupants: 'שימחה, שחר' },
      { id: 'r13', num: '3', occupants: 'יובל, גל, אביב' }
    ]
  },
  priorities: [
    { id: 'p1', text: 'אורח חיים תקין ונעים לכל חייל וחייל במגורים', done: false },
    { id: 'p2', text: 'עזרה הדדית', done: false },
    { id: 'p3', text: 'אווירה טובה בכל מתחם', done: false },
    { id: 'p4', text: 'אפשרות למפגש במתחם וביחד', done: false },
    { id: 'p5', text: 'גיבוש המגורים (אירוע ארוחת ערב)', done: false }
  ],
  rotation: {
    cleanerIndex: 0,
    guardScores: {}
  }
};

export default function App() {
  // ─── STATE ───
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('mgureem_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure proper keys exist
        if (!parsed.rotation) parsed.rotation = DEFAULT_DATA.rotation;
        if (!parsed.rotation.guardScores) parsed.rotation.guardScores = {};
        if (!parsed.tasks) parsed.tasks = DEFAULT_DATA.tasks;
        if (!parsed.rooms) parsed.rooms = DEFAULT_DATA.rooms;
        if (!parsed.priorities) parsed.priorities = DEFAULT_DATA.priorities;

        // --- Migration to Tenant Entities ---
        if (!parsed.tenants) {
          parsed.tenants = [];
          ['chogerim', 'kzinim', 'chogrot'].forEach(sec => {
            (parsed.rooms[sec] || []).forEach(room => {
              if (room.occupants && typeof room.occupants === 'string' && room.occupants.trim()) {
                const names = room.occupants.split(',').map(n => n.trim()).filter(Boolean);
                names.forEach(name => {
                  let t = parsed.tenants.find(x => x.name.toLowerCase() === name.toLowerCase());
                  if (!t) {
                    t = {
                      id: 'ten_' + Math.random().toString(36).substring(2, 11),
                      name,
                      phone: '',
                      city: '',
                      roomId: room.id,
                      section: sec
                    };
                    parsed.tenants.push(t);
                  } else {
                    t.roomId = room.id;
                  }
                });
              }
              delete room.occupants;
            });
          });

          // Migrate task owners to assigned tenants if names match
          ['chogerim', 'kzinim', 'chogrot'].forEach(sec => {
            (parsed.tasks[sec] || []).forEach(task => {
              if (task.owner && typeof task.owner === 'string') {
                const trimmedOwner = task.owner.trim();
                const matchedTenant = parsed.tenants.find(t => t.name.toLowerCase() === trimmedOwner.toLowerCase());
                if (matchedTenant) {
                  task.assignedTenantId = matchedTenant.id;
                  task.owner = '';
                }
              }
            });
          });
        }

        return parsed;
      } catch {
        // Fall back to new state
      }
    }

    // For default initial load, do the same migration on DEFAULT_DATA
    const initial = JSON.parse(JSON.stringify(DEFAULT_DATA));
    initial.tenants = [];
    ['chogerim', 'kzinim', 'chogrot'].forEach(sec => {
      (initial.rooms[sec] || []).forEach(room => {
        if (room.occupants && typeof room.occupants === 'string' && room.occupants.trim()) {
          const names = room.occupants.split(',').map(n => n.trim()).filter(Boolean);
          names.forEach(name => {
            const t = {
              id: 'ten_' + Math.random().toString(36).substring(2, 11),
              name,
              phone: '',
              city: '',
              roomId: room.id,
              section: sec
            };
            initial.tenants.push(t);
          });
        }
        delete room.occupants;
      });
    });

    ['chogerim', 'kzinim', 'chogrot'].forEach(sec => {
      (initial.tasks[sec] || []).forEach(task => {
        if (task.owner && typeof task.owner === 'string') {
          const trimmed = task.owner.trim();
          const matched = initial.tenants.find(t => t.name === trimmed);
          if (matched) {
            task.assignedTenantId = matched.id;
            task.owner = '';
          }
        }
      });
    });

    return initial;
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState(() => localStorage.getItem('mgureem_theme') || 'dark');

  // Modals trigger state
  const [taskModal, setTaskModal] = useState({ open: false, task: null, section: '' });
  const [roomModal, setRoomModal] = useState({ open: false, room: null, section: '' });
  const [priorityModal, setPriorityModal] = useState({ open: false, priority: null });
  const [tenantModal, setTenantModal] = useState({ open: false, tenant: null });

  // Tenant search & filters
  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantSectionFilter, setTenantSectionFilter] = useState('all');

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('mgureem_state', JSON.stringify(state));
  }, [state]);

  // Sync theme
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('mgureem_theme', theme);
  }, [theme]);

  // Escape key handler to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setTaskModal(m => ({ ...m, open: false }));
        setRoomModal(m => ({ ...m, open: false }));
        setPriorityModal(m => ({ ...m, open: false }));
        setTenantModal(m => ({ ...m, open: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── COMPUTED STATS ───
  const stats = useMemo(() => {
    const openTasks = ['chogerim', 'kzinim', 'chogrot'].reduce((sum, sec) => {
      return sum + (state.tasks[sec] || []).filter(t => !t.done).length;
    }, 0);

    const occupiedRooms = ['chogerim', 'kzinim', 'chogrot'].reduce((sum, sec) => {
      return sum + (state.rooms[sec] || []).filter(r => (state.tenants || []).some(t => t.roomId === r.id)).length;
    }, 0);

    const totalSoldiers = (state.tenants || []).length;

    return { openTasks, occupiedRooms, totalSoldiers };
  }, [state]);

  // ─── ROTATION LOGIC ───
  const nextGuardRoomId = useMemo(() => {
    const rooms = state.rooms.chogerim || [];
    if (rooms.length === 0) return null;
    let minScore = Infinity;
    let minId = null;
    rooms.forEach(r => {
      const score = state.rotation.guardScores[r.id] || 0;
      if (score < minScore) {
        minScore = score;
        minId = r.id;
      }
    });
    return minId;
  }, [state.rooms.chogerim, state.rotation.guardScores]);

  const currentCleanerRoom = useMemo(() => {
    const rooms = state.rooms.chogerim || [];
    const index = state.rotation.cleanerIndex;
    return rooms[index] || null;
  }, [state.rooms.chogerim, state.rotation.cleanerIndex]);

  const filteredTenants = useMemo(() => {
    let list = state.tenants || [];
    if (tenantSectionFilter !== 'all') {
      list = list.filter(t => t.section === tenantSectionFilter);
    }
    const q = tenantSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(t => {
        const room = t.roomId ? (state.rooms[t.section] || []).find(r => r.id === t.roomId) : null;
        const roomNum = room ? `חדר ${room.num}` : '';
        return (
          t.name.toLowerCase().includes(q) ||
          (t.phone && t.phone.toLowerCase().includes(q)) ||
          (t.city && t.city.toLowerCase().includes(q)) ||
          roomNum.toLowerCase().includes(q)
        );
      });
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'he'));
  }, [state.tenants, tenantSectionFilter, tenantSearch, state.rooms]);

  const advanceCleaner = () => {
    const roomsLength = (state.rooms.chogerim || []).length;
    if (roomsLength === 0) return;
    setState(prev => ({
      ...prev,
      rotation: {
        ...prev.rotation,
        cleanerIndex: (prev.rotation.cleanerIndex + 1) % roomsLength
      }
    }));
  };

  const assignGuard = () => {
    if (!nextGuardRoomId) return;
    setState(prev => {
      const currentScore = prev.rotation.guardScores[nextGuardRoomId] || 0;
      return {
        ...prev,
        rotation: {
          ...prev.rotation,
          guardScores: {
            ...prev.rotation.guardScores,
            [nextGuardRoomId]: currentScore + 1
          }
        }
      };
    });
  };

  // ─── ACTIONS: TASKS ───
  const toggleTask = (section, id) => {
    setState(prev => {
      const list = prev.tasks[section].map(t => t.id === id ? { ...t, done: !t.done } : t);
      return { ...prev, tasks: { ...prev.tasks, [section]: list } };
    });
  };

  const deleteTask = (section, id) => {
    setState(prev => {
      const list = prev.tasks[section].filter(t => t.id !== id);
      return { ...prev, tasks: { ...prev.tasks, [section]: list } };
    });
  };

  const openAddTask = (section) => {
    setTaskModal({ open: true, task: null, section });
  };

  const openEditTask = (section, id) => {
    const t = state.tasks[section].find(x => x.id === id);
    if (!t) return;
    setTaskModal({ open: true, task: t, section });
  };

  const handleSaveTask = (text, owner, assignedTenantId) => {
    const { task, section } = taskModal;

    setState(prev => {
      const list = [...(prev.tasks[section] || [])];
      if (task?.id) {
        const idx = list.findIndex(t => t.id === task.id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], text, owner, assignedTenantId };
        }
      } else {
        list.push({ id: uid(), text, owner, assignedTenantId, done: false });
      }
      return { ...prev, tasks: { ...prev.tasks, [section]: list } };
    });
    setTaskModal({ open: false, task: null, section: '' });
  };

  // ─── ACTIONS: ROOMS ───
  const deleteRoom = (section, id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק חדר זה?')) {
      setState(prev => {
        const list = prev.rooms[section].filter(r => r.id !== id);
        const tenantsList = (prev.tenants || []).map(t => {
          if (t.roomId === id) {
            return { ...t, roomId: '' };
          }
          return t;
        });
        return {
          ...prev,
          rooms: { ...prev.rooms, [section]: list },
          tenants: tenantsList
        };
      });
    }
  };

  const openAddRoom = (section) => {
    setRoomModal({ open: true, room: null, section });
  };

  const openEditRoom = (section, id) => {
    const r = state.rooms[section].find(x => x.id === id);
    if (!r) return;
    setRoomModal({ open: true, room: r, section });
  };

  const handleSaveRoom = (num, tenantIds, newTenants) => {
    const { room, section } = roomModal;
    const roomId = room?.id || uid();

    setState(prev => {
      // 1. Update/Add room in rooms list
      const roomsList = [...(prev.rooms[section] || [])];
      if (room?.id) {
        const idx = roomsList.findIndex(r => r.id === room.id);
        if (idx !== -1) {
          roomsList[idx] = { ...roomsList[idx], num };
        }
      } else {
        roomsList.push({ id: roomId, num });
      }

      // 2. Prepare new tenants list
      let tenantsList = prev.tenants ? [...prev.tenants] : [];

      // 2a. Add newly created tenants
      newTenants.forEach(nt => {
        tenantsList.push({
          ...nt,
          roomId: roomId
        });
      });

      // 2b. Update roomId for existing tenants
      tenantsList = tenantsList.map(t => {
        if (tenantIds.includes(t.id)) {
          return { ...t, roomId: roomId, section: section };
        }
        if (t.roomId === roomId && !tenantIds.includes(t.id)) {
          return { ...t, roomId: '' }; // Unassign
        }
        return t;
      });

      return {
        ...prev,
        rooms: { ...prev.rooms, [section]: roomsList },
        tenants: tenantsList
      };
    });

    setRoomModal({ open: false, room: null, section: '' });
  };

  // ─── ACTIONS: PRIORITIES ───
  const togglePriority = (id) => {
    setState(prev => {
      const list = prev.priorities.map(p => p.id === id ? { ...p, done: !p.done } : p);
      return { ...prev, priorities: list };
    });
  };

  const deletePriority = (id) => {
    setState(prev => {
      const list = prev.priorities.filter(p => p.id !== id);
      return { ...prev, priorities: list };
    });
  };

  const openAddPriority = () => {
    setPriorityModal({ open: true, priority: null });
  };

  const handleSavePriority = (text) => {
    const { priority } = priorityModal;

    setState(prev => {
      const list = [...prev.priorities];
      if (priority?.id) {
        const idx = list.findIndex(p => p.id === priority.id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], text };
        }
      } else {
        list.push({ id: uid(), text, done: false });
      }
      return { ...prev, priorities: list };
    });
    setPriorityModal({ open: false, priority: null });
  };

  // ─── ACTIONS: TENANTS ───
  const openAddTenant = () => {
    setTenantModal({ open: true, tenant: null });
  };

  const openEditTenant = (id) => {
    const t = (state.tenants || []).find(x => x.id === id);
    if (!t) return;
    setTenantModal({ open: true, tenant: t });
  };

  const handleSaveTenant = (name, phone, city, roomId, section) => {
    const { tenant } = tenantModal;

    setState(prev => {
      const list = prev.tenants ? [...prev.tenants] : [];
      if (tenant?.id) {
        const idx = list.findIndex(t => t.id === tenant.id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], name, phone, city, roomId, section };
        }
      } else {
        list.push({ id: uid(), name, phone, city, roomId, section });
      }
      return { ...prev, tenants: list };
    });
    setTenantModal({ open: false, tenant: null });
  };

  const deleteTenant = (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק דייר זה?')) {
      setState(prev => {
        const list = (prev.tenants || []).filter(t => t.id !== id);
        // Clean up task assignments for this tenant
        const updatedTasks = { ...prev.tasks };
        ['chogerim', 'kzinim', 'chogrot'].forEach(sec => {
          if (updatedTasks[sec]) {
            updatedTasks[sec] = updatedTasks[sec].map(t => {
              if (t.assignedTenantId === id) {
                const updatedTask = { ...t };
                delete updatedTask.assignedTenantId;
                return updatedTask;
              }
              return t;
            });
          }
        });
        return { ...prev, tenants: list, tasks: updatedTasks };
      });
    }
  };

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-right">
          <div className="topbar-title">🏠 ניהול מגורים <span>צה״ל</span></div>
        </div>
        <div className="topbar-left">
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <HomeIcon /> סקירה
            </button>
            <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
              <TasksIcon /> תקלות ומשימות
            </button>
            <button className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
              <RoomsIcon /> חדרים
            </button>
            <button className={`tab-btn ${activeTab === 'tenants' ? 'active' : ''}`} onClick={() => setActiveTab('tenants')}>
              <TenantsIcon /> דיירים
            </button>
            <button className={`tab-btn ${activeTab === 'rotation' ? 'active' : ''}`} onClick={() => setActiveTab('rotation')}>
              <RotationIcon /> סבב תפקידים
            </button>
            <button className={`tab-btn ${activeTab === 'priorities' ? 'active' : ''}`} onClick={() => setActiveTab('priorities')}>
              <PrioritiesIcon /> עדיפויות
            </button>
          </div>

          <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      <div className="main-container">
        {/* TAB RENDERING */}
        {activeTab === 'overview' && (
          <OverviewTab
            state={state}
            stats={stats}
            toggleTask={toggleTask}
            togglePriority={togglePriority}
            openEditTenant={openEditTenant}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab
            state={state}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            openAddTask={openAddTask}
            openEditTask={openEditTask}
            openEditTenant={openEditTenant}
          />
        )}

        {activeTab === 'rooms' && (
          <RoomsTab
            state={state}
            nextGuardRoomId={nextGuardRoomId}
            openAddRoom={openAddRoom}
            openEditRoom={openEditRoom}
            deleteRoom={deleteRoom}
            openEditTenant={openEditTenant}
          />
        )}

        {activeTab === 'tenants' && (
          <TenantsTab
            state={state}
            tenantSearch={tenantSearch}
            setTenantSearch={setTenantSearch}
            tenantSectionFilter={tenantSectionFilter}
            setTenantSectionFilter={setTenantSectionFilter}
            filteredTenants={filteredTenants}
            toggleTask={toggleTask}
            openAddTenant={openAddTenant}
            openEditTenant={openEditTenant}
            deleteTenant={deleteTenant}
          />
        )}

        {activeTab === 'rotation' && (
          <RotationTab
            state={state}
            nextGuardRoomId={nextGuardRoomId}
            currentCleanerRoom={currentCleanerRoom}
            advanceCleaner={advanceCleaner}
            assignGuard={assignGuard}
          />
        )}

        {activeTab === 'priorities' && (
          <PrioritiesTab
            state={state}
            togglePriority={togglePriority}
            deletePriority={deletePriority}
            openAddPriority={openAddPriority}
          />
        )}
      </div>

      {/* MODALS */}
      <TaskModal
        key={taskModal.open ? `task-${taskModal.task?.id || 'new'}` : 'closed'}
        isOpen={taskModal.open}
        task={taskModal.task}
        tenants={state.tenants}
        rooms={state.rooms}
        onSave={handleSaveTask}
        onClose={() => setTaskModal({ open: false, task: null, section: '' })}
      />

      <RoomModal
        key={roomModal.open ? `room-${roomModal.room?.id || 'new'}-${roomModal.section}` : 'closed'}
        isOpen={roomModal.open}
        room={roomModal.room}
        section={roomModal.section}
        tenants={state.tenants}
        rooms={state.rooms}
        onSave={handleSaveRoom}
        onClose={() => setRoomModal({ open: false, room: null, section: '' })}
      />

      <PriorityModal
        key={priorityModal.open ? `priority-${priorityModal.priority?.id || 'new'}` : 'closed'}
        isOpen={priorityModal.open}
        priority={priorityModal.priority}
        onSave={handleSavePriority}
        onClose={() => setPriorityModal({ open: false, priority: null })}
      />

      <TenantModal
        key={tenantModal.open ? `tenant-${tenantModal.tenant?.id || 'new'}` : 'closed'}
        isOpen={tenantModal.open}
        tenant={tenantModal.tenant}
        rooms={state.rooms}
        onSave={handleSaveTenant}
        onClose={() => setTenantModal({ open: false, tenant: null })}
      />
    </>
  );
}
