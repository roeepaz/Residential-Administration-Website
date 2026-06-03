import React, { useState, useEffect, useMemo } from 'react';

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

const uid = () => '_' + Math.random().toString(36).substr(2, 9);

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
        return parsed;
      } catch (e) {
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState(() => localStorage.getItem('mgureem_theme') || 'dark');

  // Modals state
  const [taskModal, setTaskModal] = useState({ open: false, id: null, section: '', text: '', owner: '' });
  const [roomModal, setRoomModal] = useState({ open: false, id: null, section: '', num: '', occupants: '' });
  const [priorityModal, setPriorityModal] = useState({ open: false, id: null, text: '' });

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
      return sum + (state.rooms[sec] || []).filter(r => r.occupants && r.occupants.trim()).length;
    }, 0);

    let totalSoldiers = 0;
    ['chogerim', 'kzinim', 'chogrot'].forEach(sec => {
      (state.rooms[sec] || []).forEach(r => {
        if (r.occupants && r.occupants.trim()) {
          totalSoldiers += r.occupants.split(',').filter(name => name.trim()).length;
        }
      });
    });

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
    setTaskModal({ open: true, id: null, section, text: '', owner: '' });
  };

  const openEditTask = (section, id) => {
    const t = state.tasks[section].find(x => x.id === id);
    if (!t) return;
    setTaskModal({ open: true, id, section, text: t.text, owner: t.owner || '' });
  };

  const saveTask = () => {
    const text = taskModal.text.trim();
    if (!text) return;
    const { id, section, owner } = taskModal;

    setState(prev => {
      const list = [...prev.tasks[section]];
      if (id) {
        const idx = list.findIndex(t => t.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], text, owner };
        }
      } else {
        list.push({ id: uid(), text, owner, done: false });
      }
      return { ...prev, tasks: { ...prev.tasks, [section]: list } };
    });
    setTaskModal({ open: false, id: null, section: '', text: '', owner: '' });
  };

  // ─── ACTIONS: ROOMS ───
  const deleteRoom = (section, id) => {
    setState(prev => {
      const list = prev.rooms[section].filter(r => r.id !== id);
      return { ...prev, rooms: { ...prev.rooms, [section]: list } };
    });
  };

  const openAddRoom = (section) => {
    setRoomModal({ open: true, id: null, section, num: '', occupants: '' });
  };

  const openEditRoom = (section, id) => {
    const r = state.rooms[section].find(x => x.id === id);
    if (!r) return;
    setRoomModal({ open: true, id, section, num: r.num, occupants: r.occupants });
  };

  const saveRoom = () => {
    const num = roomModal.num.trim();
    if (!num) return;
    const { id, section, occupants } = roomModal;

    setState(prev => {
      const list = [...prev.rooms[section]];
      if (id) {
        const idx = list.findIndex(r => r.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], num, occupants };
        }
      } else {
        list.push({ id: uid(), num, occupants });
      }
      return { ...prev, rooms: { ...prev.rooms, [section]: list } };
    });
    setRoomModal({ open: false, id: null, section: '', num: '', occupants: '' });
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
    setPriorityModal({ open: true, id: null, text: '' });
  };

  const savePriority = () => {
    const text = priorityModal.text.trim();
    if (!text) return;
    const { id } = priorityModal;

    setState(prev => {
      const list = [...prev.priorities];
      if (id) {
        const idx = list.findIndex(p => p.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], text };
        }
      } else {
        list.push({ id: uid(), text, done: false });
      }
      return { ...prev, priorities: list };
    });
    setPriorityModal({ open: false, id: null, text: '' });
  };

  // ─── SVG ICONS ───
  const Icons = {
    Home: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    Tasks: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/>
      </svg>
    ),
    Rooms: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M9 3v18M3 9h18M3 15h18"/>
      </svg>
    ),
    Rotation: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
      </svg>
    ),
    Priorities: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    Edit: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>
    ),
    Delete: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>
      </svg>
    ),
    Plus: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5v14"/>
      </svg>
    ),
    Moon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
      </svg>
    ),
    Sun: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>
    )
  };

  // Helper render for tasks inside boards
  const renderTaskList = (section, items, isOverview = false) => {
    const list = isOverview ? items.filter(t => !t.done) : items;
    if (list.length === 0) {
      return <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>אין תקלות</div>;
    }
    return (
      <div className="task-list">
        {list.map(t => (
          <div className={`task-item ${t.done ? 'done' : ''}`} key={t.id}>
            <div className={`task-check ${t.done ? 'checked' : ''}`} onClick={() => toggleTask(section, t.id)} />
            <div className="task-text">
              {t.text}
              {t.owner && <span className="task-owner">{t.owner}</span>}
            </div>
            {!isOverview && (
              <div className="task-actions">
                <button className="icon-btn" onClick={() => openEditTask(section, t.id)}><Icons.Edit /></button>
                <button className="icon-btn del" onClick={() => deleteTask(section, t.id)}><Icons.Delete /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
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
              <Icons.Home /> סקירה
            </button>
            <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
              <Icons.Tasks /> תקלות ומשימות
            </button>
            <button className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
              <Icons.Rooms /> חדרים
            </button>
            <button className={`tab-btn ${activeTab === 'rotation' ? 'active' : ''}`} onClick={() => setActiveTab('rotation')}>
              <Icons.Rotation /> סבב תפקידים
            </button>
            <button className={`tab-btn ${activeTab === 'priorities' ? 'active' : ''}`} onClick={() => setActiveTab('priorities')}>
              <Icons.Priorities /> עדיפויות
            </button>
          </div>

          <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </button>
        </div>
      </div>

      <div className="main-container">
        {/* PAGE: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="page">
            <div className="status-grid">
              <div className="glass-panel stat-card">
                <div className="stat-num blue">{stats.openTasks}</div>
                <div className="stat-label">תקלות פתוחות</div>
              </div>
              <div className="glass-panel stat-card success">
                <div className="stat-num green">{stats.occupiedRooms}</div>
                <div className="stat-label">חדרים מאוכלסים</div>
              </div>
              <div className="glass-panel stat-card warning">
                <div className="stat-num amber">{stats.totalSoldiers}</div>
                <div className="stat-label">סך הכל חיילים במגורים</div>
              </div>
            </div>

            <div className="grid-3">
              {/* חוגרים תקלות */}
              <div className="glass-panel card">
                <div className="card-header">
                  <div className="card-title">⚠️ תקלות חוגרים</div>
                  <span className="badge badge-blue">
                    {(state.tasks.chogerim || []).filter(t => !t.done).length} פתוחות
                  </span>
                </div>
                {renderTaskList('chogerim', state.tasks.chogerim, true)}
              </div>

              {/* קצינים תקלות */}
              <div className="glass-panel card">
                <div className="card-header">
                  <div className="card-title">⚠️ תקלות קצינים</div>
                  <span className="badge badge-amber">
                    {(state.tasks.kzinim || []).filter(t => !t.done).length} פתוחות
                  </span>
                </div>
                {renderTaskList('kzinim', state.tasks.kzinim, true)}
              </div>

              {/* חוגרות תקלות */}
              <div className="glass-panel card">
                <div className="card-header">
                  <div className="card-title">⚠️ תקלות חוגרות</div>
                  <span className="badge badge-green">
                    {(state.tasks.chogrot || []).filter(t => !t.done).length} פתוחות
                  </span>
                </div>
                {renderTaskList('chogrot', state.tasks.chogrot, true)}
              </div>
            </div>

            <hr />

            <div className="section-title">🎯 עדיפויות כלליות</div>
            <div className="glass-panel card">
              <div className="task-list">
                {state.priorities.map(p => (
                  <div className={`task-item ${p.done ? 'done' : ''}`} key={p.id}>
                    <div className={`task-check ${p.done ? 'checked' : ''}`} onClick={() => togglePriority(p.id)} />
                    <div className="task-text">{p.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAGE: TASKS */}
        {activeTab === 'tasks' && (
          <div className="page">
            <div className="grid-3">
              {/* חוגרים */}
              <div className="glass-panel card">
                <div className="card-header">
                  <div className="card-title">🔵 חוגרים</div>
                  <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => openAddTask('chogerim')}>
                    <Icons.Plus /> הוסף
                  </button>
                </div>
                {renderTaskList('chogerim', state.tasks.chogerim)}
              </div>

              {/* קצינים */}
              <div className="glass-panel card">
                <div className="card-header">
                  <div className="card-title">🟡 קצינים</div>
                  <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => openAddTask('kzinim')}>
                    <Icons.Plus /> הוסף
                  </button>
                </div>
                {renderTaskList('kzinim', state.tasks.kzinim)}
              </div>

              {/* חוגרות */}
              <div className="glass-panel card">
                <div className="card-header">
                  <div className="card-title">🟢 חוגרות</div>
                  <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => openAddTask('chogrot')}>
                    <Icons.Plus /> הוסף
                  </button>
                </div>
                {renderTaskList('chogrot', state.tasks.chogrot)}
              </div>
            </div>
          </div>
        )}

        {/* PAGE: ROOMS */}
        {activeTab === 'rooms' && (
          <div className="page">
            <div className="grid-3">
              {['chogerim', 'kzinim', 'chogrot'].map((sec) => {
                const title = sec === 'chogerim' ? '🔵 חוגרים' : sec === 'kzinim' ? '🟡 קצינים' : '🟢 חוגרות';
                const rooms = state.rooms[sec] || [];
                const cleanerIdx = state.rotation.cleanerIndex;
                const nextGuardId = nextGuardRoomId;

                return (
                  <div className="glass-panel card" key={sec}>
                    <div className="card-header">
                      <div className="card-title">{title}</div>
                      <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => openAddRoom(sec)}>
                        <Icons.Plus /> חדר
                      </button>
                    </div>
                    <div className="room-list">
                      {rooms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>אין חדרים</div>
                      ) : (
                        rooms.map(r => {
                          const isCleaner = sec === 'chogerim' && state.rooms.chogerim[cleanerIdx]?.id === r.id;
                          const isNextGuard = sec === 'chogerim' && r.id === nextGuardId;

                          return (
                            <div className="room-item" key={r.id}>
                              <div className="room-details">
                                <div className="room-num">חדר {r.num}</div>
                                <div className="room-occupants">
                                  {r.occupants && r.occupants.trim() ? (
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                      {r.occupants.split(',').map((occ, idx) => (
                                        <span className="badge badge-blue" style={{ fontSize: '0.7rem' }} key={idx}>{occ.trim()}</span>
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
                                <button className="icon-btn" onClick={() => openEditRoom(sec, r.id)}><Icons.Edit /></button>
                                <button className="icon-btn del" onClick={() => deleteRoom(sec, r.id)}><Icons.Delete /></button>
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
        )}

        {/* PAGE: ROTATION */}
        {activeTab === 'rotation' && (
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
                    {state.rooms.chogerim.find(r => r.id === nextGuardRoomId) ? `חדר ${state.rooms.chogerim.find(r => r.id === nextGuardRoomId).num}` : '—'}
                  </div>
                </div>
              </div>

              <div className="room-list" style={{ marginBottom: '24px' }}>
                {state.rooms.chogerim.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)' }}>אין חדרים להצגה בסבב</div>
                ) : (
                  [...state.rooms.chogerim]
                    .sort((a, b) => (state.rotation.guardScores[a.id] || 0) - (state.rotation.guardScores[b.id] || 0))
                    .map((r) => {
                      const isClean = currentCleanerRoom?.id === r.id;
                      const isGuard = r.id === nextGuardRoomId;
                      const count = state.rotation.guardScores[r.id] || 0;

                      return (
                        <div className="room-item" key={r.id}>
                          <div className="room-num">חדר {r.num}</div>
                          <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)', paddingRight: '12px' }}>
                            {r.occupants || 'ריק'}
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
        )}

        {/* PAGE: PRIORITIES */}
        {activeTab === 'priorities' && (
          <div className="page">
            <div className="glass-panel card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="card-header">
                <div className="card-title">🎯 עדיפויות לקדם</div>
                <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={openAddPriority}>
                  <Icons.Plus /> הוסף
                </button>
              </div>

              <div className="task-list">
                {state.priorities.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)' }}>אין עדיפויות מוגדרות</div>
                ) : (
                  state.priorities.map((p) => (
                    <div className={`task-item ${p.done ? 'done' : ''}`} key={p.id}>
                      <div className={`task-check ${p.done ? 'checked' : ''}`} onClick={() => togglePriority(p.id)} />
                      <div className="task-text">{p.text}</div>
                      <div className="task-actions">
                        <button className="icon-btn del" onClick={() => deletePriority(p.id)}><Icons.Delete /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Add/Edit Task */}
      <div className={`modal-bg ${taskModal.open ? 'open' : ''}`} onClick={(e) => e.target.classList.contains('modal-bg') && setTaskModal(m => ({ ...m, open: false }))}>
        <div className="modal">
          <h3>
            <Icons.Tasks /> {taskModal.id ? 'ערוך תקלה / משימה' : 'הוסף תקלה / משימה'}
          </h3>
          <div className="modal-group">
            <label htmlFor="task-text">תיאור המשימה/תקלה</label>
            <input
              id="task-text"
              type="text"
              placeholder="למשל: סתימה בכיור, פינת ישיבה..."
              value={taskModal.text}
              onChange={(e) => setTaskModal(m => ({ ...m, text: e.target.value }))}
            />
          </div>
          <div className="modal-group">
            <label htmlFor="task-owner">אחראי (אופציונלי)</label>
            <input
              id="task-owner"
              type="text"
              placeholder="שם האחראי לטיפול..."
              value={taskModal.owner}
              onChange={(e) => setTaskModal(m => ({ ...m, owner: e.target.value }))}
            />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setTaskModal(m => ({ ...m, open: false }))}>ביטול</button>
            <button className="btn btn-primary" onClick={saveTask}>שמור</button>
          </div>
        </div>
      </div>

      {/* MODAL: Add/Edit Room */}
      <div className={`modal-bg ${roomModal.open ? 'open' : ''}`} onClick={(e) => e.target.classList.contains('modal-bg') && setRoomModal(m => ({ ...m, open: false }))}>
        <div className="modal">
          <h3>
            <Icons.Rooms /> {roomModal.id ? 'ערוך חדר' : 'הוסף חדר'}
          </h3>
          <div className="modal-group">
            <label htmlFor="room-num">מספר חדר</label>
            <input
              id="room-num"
              type="text"
              placeholder="למשל: 104, 5, גיל..."
              value={roomModal.num}
              onChange={(e) => setRoomModal(m => ({ ...m, num: e.target.value }))}
            />
          </div>
          <div className="modal-group">
            <label htmlFor="room-occupants">דיירים (מופרדים בפסיק)</label>
            <input
              id="room-occupants"
              type="text"
              placeholder="למשל: יורי, שלומי, אלון..."
              value={roomModal.occupants}
              onChange={(e) => setRoomModal(m => ({ ...m, occupants: e.target.value }))}
            />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setRoomModal(m => ({ ...m, open: false }))}>ביטול</button>
            <button className="btn btn-primary" onClick={saveRoom}>שמור</button>
          </div>
        </div>
      </div>

      {/* MODAL: Add/Edit Priority */}
      <div className={`modal-bg ${priorityModal.open ? 'open' : ''}`} onClick={(e) => e.target.classList.contains('modal-bg') && setPriorityModal(m => ({ ...m, open: false }))}>
        <div className="modal">
          <h3>
            <Icons.Priorities /> הוסף עדיפות
          </h3>
          <div className="modal-group">
            <label htmlFor="priority-text">תיאור העדיפות לקדם</label>
            <input
              id="priority-text"
              type="text"
              placeholder="למשל: גיבוש המגורים, שיפוץ מועדון..."
              value={priorityModal.text}
              onChange={(e) => setPriorityModal(m => ({ ...m, text: e.target.value }))}
            />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setPriorityModal(m => ({ ...m, open: false }))}>ביטול</button>
            <button className="btn btn-primary" onClick={savePriority}>שמור</button>
          </div>
        </div>
      </div>
    </>
  );
}
