import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Eraser, 
  Trash2, 
  GripVertical,
  Calendar,
  User,
  Flag,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  MoreHorizontal,
  FolderGit2,
  Sparkles
} from 'lucide-react';
import { Note, KanbanBoardData, KanbanTask, KanbanColumn } from '../types';

interface RoomPlannerProps {
  note: Note;
  onUpdateNote: (updated: Partial<Note>) => void;
  onDeleteNote?: (id: string) => void;
  onDuplicateNote?: (note: Note) => void;
}

export const COLUMN_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Indigo', value: '#6366f1' },
];

export const PROJECT_TEMPLATES = {
  software: {
    name: 'Software Engineering Project',
    subtitle: 'Full-stack software delivery & sprints',
    columns: [
      { id: 'arch', title: 'Architecture & Design', color: '#6366f1' },
      { id: 'frontend', title: 'Frontend & UI', color: '#06b6d4' },
      { id: 'backend', title: 'Backend & APIs', color: '#a855f7' },
      { id: 'qa', title: 'QA & Testing', color: '#f59e0b' },
      { id: 'devops', title: 'DevOps & Launch', color: '#10b981' }
    ],
    tasks: [
      {
        id: 'task-sw-1',
        title: 'Design token system & dark mode',
        subtitle: 'In Core App Architecture',
        columnId: 'frontend',
        assignee: 'Sarah C.',
        deadline: 'Tomorrow',
        priority: 'high',
        progress: 80,
        budget: '$1,200',
        actualCost: '$1,050',
        description: 'Implement semantic CSS variables, responsive typography scale, and accessible color contrast.',
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24
      },
      {
        id: 'task-sw-2',
        title: 'Setup Redis caching & rate limiter',
        subtitle: 'In Core App Architecture',
        columnId: 'backend',
        assignee: 'Devon M.',
        deadline: 'Next Friday',
        priority: 'medium',
        progress: 40,
        budget: '$800',
        actualCost: '-',
        description: 'Token bucket rate limiting on auth endpoints with distributed Redis lock.',
        createdAt: Date.now() - 1000 * 60 * 60 * 36,
        updatedAt: Date.now() - 1000 * 60 * 60 * 12
      },
      {
        id: 'task-sw-3',
        title: 'End-to-End Playwright test suite',
        subtitle: 'In Core App Architecture',
        columnId: 'qa',
        assignee: 'Elena R.',
        deadline: 'Oct 24',
        priority: 'high',
        progress: 25,
        budget: '$900',
        actualCost: '-',
        description: 'Cover login flow, note editing, real-time sync, and offline persistence state.',
        createdAt: Date.now() - 1000 * 60 * 60 * 48,
        updatedAt: Date.now() - 1000 * 60 * 60 * 18
      },
      {
        id: 'task-sw-4',
        title: 'CI/CD pipeline with GitHub Actions',
        subtitle: 'In Core App Architecture',
        columnId: 'devops',
        assignee: 'Devon M.',
        deadline: 'Oct 28',
        priority: 'medium',
        progress: 100,
        budget: '$600',
        actualCost: '$550',
        description: 'Automated linting, unit test matrix, Docker container build, and Cloud Run blue-green deploy.',
        createdAt: Date.now() - 1000 * 60 * 60 * 60,
        updatedAt: Date.now() - 1000 * 60 * 60 * 6
      }
    ]
  },
  home: {
    name: 'Home Improvement Project Planner',
    subtitle: 'Space renovation & contractor milestones',
    columns: [
      { id: 'porch', title: 'Porch', color: '#ef4444' },
      { id: 'living-room', title: 'Living Room', color: '#a855f7' },
      { id: 'kitchen', title: 'Kitchen', color: '#06b6d4' },
      { id: 'bathroom', title: 'Bathroom', color: '#f59e0b' },
      { id: 'bedroom', title: 'Bedroom', color: '#3b82f6' },
      { id: 'study', title: 'Study', color: '#10b981' }
    ],
    tasks: [
      {
        id: 'task-h-1',
        title: 'Install solar lamps',
        subtitle: 'In Home Improvement Project Planner',
        columnId: 'porch',
        assignee: '-',
        deadline: '-',
        priority: 'low',
        progress: 0,
        budget: '$100',
        actualCost: '-',
        description: 'Set up weather-proof solar LED lanterns along the front porch steps and railings.',
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24
      },
      {
        id: 'task-h-2',
        title: 'Change the flooring',
        subtitle: 'In Home Improvement Project Planner',
        columnId: 'living-room',
        assignee: '-',
        deadline: '-',
        priority: 'medium',
        progress: 100,
        budget: '$200',
        actualCost: '-',
        description: 'Complete hardwood vinyl plank installation across living room area.',
        createdAt: Date.now() - 1000 * 60 * 60 * 48,
        updatedAt: Date.now() - 1000 * 60 * 60 * 12
      },
      {
        id: 'task-h-3',
        title: 'Upgrade kitchen cabinets',
        subtitle: 'In Home Improvement Project Planner',
        columnId: 'kitchen',
        assignee: '-',
        deadline: '-',
        priority: 'high',
        progress: 0,
        budget: '$200',
        actualCost: '-',
        description: 'Paint cabinet faces, install modern matte black pulls, and realign soft-close hinges.',
        createdAt: Date.now() - 1000 * 60 * 60 * 18,
        updatedAt: Date.now() - 1000 * 60 * 60 * 18
      }
    ]
  }
};

export const DEFAULT_ROOM_DATA: KanbanBoardData = {
  projectName: PROJECT_TEMPLATES.software.name,
  columns: PROJECT_TEMPLATES.software.columns,
  tasks: PROJECT_TEMPLATES.software.tasks as KanbanTask[]
};

export const RoomPlanner: React.FC<RoomPlannerProps> = ({
  note,
  onUpdateNote,
  onDeleteNote
}) => {
  // Parse room board data
  const boardData: KanbanBoardData = useMemo(() => {
    if (note.kanbanData && Array.isArray(note.kanbanData.columns) && note.kanbanData.columns.length > 0) {
      return note.kanbanData;
    }
    if (note.content && note.content.startsWith('{')) {
      try {
        const parsed = JSON.parse(note.content);
        if (parsed && Array.isArray(parsed.columns) && parsed.columns.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_ROOM_DATA;
  }, [note.kanbanData, note.content]);

  // Rename board state
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(note.title || boardData.projectName || 'Project Room Planner');

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);

  // Column editing state
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState('');
  const [editingColumnColor, setEditingColumnColor] = useState('#3b82f6');
  const [showSectionsPopover, setShowSectionsPopover] = useState(false);
  const sectionsPopoverRef = useRef<HTMLDivElement>(null);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Close sections popover on click outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (sectionsPopoverRef.current && !sectionsPopoverRef.current.contains(e.target as Node)) {
        setShowSectionsPopover(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  // Update board helper
  const saveBoardData = (newBoardData: KanbanBoardData) => {
    onUpdateNote({
      kanbanData: newBoardData,
      content: JSON.stringify(newBoardData),
      updatedAt: Date.now()
    });
  };

  // Open task creator modal
  const handleOpenAddTask = (columnId?: string) => {
    const targetColumn = columnId || (boardData.columns[0] ? boardData.columns[0].id : 'general');
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title: '',
      subtitle: `In ${note.title || boardData.projectName || 'Project'}`,
      columnId: targetColumn,
      assignee: '-',
      deadline: '-',
      priority: 'medium',
      progress: 0,
      budget: '$500',
      actualCost: '-',
      description: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setSelectedTask(newTask);
    setIsTaskModalOpen(true);
  };

  // Open task editor modal on card click
  const handleOpenEditTask = (task: KanbanTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Save task
  const handleSaveTask = (savedTask: KanbanTask) => {
    const exists = boardData.tasks.some(t => t.id === savedTask.id);
    let updatedTasks: KanbanTask[];
    if (exists) {
      updatedTasks = boardData.tasks.map(t => 
        t.id === savedTask.id ? { ...savedTask, updatedAt: Date.now() } : t
      );
    } else {
      updatedTasks = [...boardData.tasks, savedTask];
    }

    saveBoardData({
      ...boardData,
      tasks: updatedTasks
    });
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = boardData.tasks.filter(t => t.id !== taskId);
    saveBoardData({
      ...boardData,
      tasks: updatedTasks
    });
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  // Toggle task completion (Done logic)
  const handleToggleTaskDone = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updatedTasks = boardData.tasks.map(t => {
      if (t.id === taskId) {
        const isCurrentlyDone = Boolean(t.completed || t.progress === 100);
        const newDone = !isCurrentlyDone;
        return {
          ...t,
          completed: newDone,
          progress: newDone ? 100 : (t.progress === 100 ? 0 : (t.progress || 0)),
          updatedAt: Date.now()
        };
      }
      return t;
    });
    saveBoardData({
      ...boardData,
      tasks: updatedTasks
    });
  };

  // Add Column / Room
  const handleAddColumn = (title = 'New Module') => {
    const newId = `col-${Date.now()}`;
    const nextColor = COLUMN_COLORS[boardData.columns.length % COLUMN_COLORS.length].value;
    const newColumn: KanbanColumn = {
      id: newId,
      title,
      color: nextColor
    };

    saveBoardData({
      ...boardData,
      columns: [...boardData.columns, newColumn]
    });
    setShowSectionsPopover(false);
  };

  // Start editing column
  const handleStartEditColumn = (col: KanbanColumn) => {
    setEditingColumnId(col.id);
    setEditingColumnTitle(col.title);
    setEditingColumnColor(col.color || '#3b82f6');
  };

  // Save edited column
  const handleSaveEditColumn = () => {
    if (!editingColumnId || !editingColumnTitle.trim()) {
      setEditingColumnId(null);
      return;
    }

    const updatedColumns = boardData.columns.map(c => 
      c.id === editingColumnId 
        ? { ...c, title: editingColumnTitle.trim(), color: editingColumnColor }
        : c
    );

    saveBoardData({
      ...boardData,
      columns: updatedColumns
    });
    setEditingColumnId(null);
  };

  // Delete Column
  const handleDeleteColumn = (colId: string) => {
    if (boardData.columns.length <= 1) return;
    if (window.confirm('Delete this section? Tasks in this room/module will also be removed.')) {
      const updatedColumns = boardData.columns.filter(c => c.id !== colId);
      const updatedTasks = boardData.tasks.filter(t => t.columnId !== colId);
      saveBoardData({
        ...boardData,
        columns: updatedColumns,
        tasks: updatedTasks
      });
      setEditingColumnId(null);
    }
  };

  // Apply Template
  const handleApplyTemplate = (templateKey: 'software' | 'home') => {
    const template = PROJECT_TEMPLATES[templateKey];
    if (window.confirm(`Load "${template.name}" template? Current rooms will be replaced.`)) {
      saveBoardData({
        projectName: template.name,
        columns: template.columns,
        tasks: template.tasks as KanbanTask[]
      });
      onUpdateNote({ title: template.name, subtitle: template.subtitle });
      setShowSectionsPopover(false);
    }
  };

  // Clear all tasks
  const handleClearAll = () => {
    if (boardData.tasks.length === 0) return;
    if (window.confirm('Clear all tasks from this project room planner?')) {
      saveBoardData({
        ...boardData,
        tasks: []
      });
    }
  };

  // Delete entire board
  const handleDeleteBoard = () => {
    if (onDeleteNote) {
      if (window.confirm(`Delete "${note.title || 'Project Room Planner'}"?`)) {
        onDeleteNote(note.id);
      }
    }
  };

  // Rename board
  const handleSaveRename = () => {
    if (renameValue.trim()) {
      onUpdateNote({ title: renameValue.trim(), updatedAt: Date.now() });
    }
    setIsRenaming(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumnId(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumnId(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = boardData.tasks.find(t => t.id === taskId);
    if (task && task.columnId !== columnId) {
      const updatedTasks = boardData.tasks.map(t => 
        t.id === taskId ? { ...t, columnId, updatedAt: Date.now() } : t
      );
      saveBoardData({
        ...boardData,
        tasks: updatedTasks
      });
    }
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const scrollToColumn = (colId: string) => {
    const el = document.getElementById(`column-${colId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    setShowSectionsPopover(false);
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden select-text transition-colors"
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)'
      }}
    >
      {/* 1. TOP HEADER: Breadcrumbs + Sections Popover + Quick Actions */}
      <header 
        className="h-11 px-4 border-b flex items-center justify-between text-xs select-none shrink-0"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-main)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 opacity-50">
            <button className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 opacity-80 text-xs">
            <span className="opacity-60 flex items-center gap-1">
              <FolderGit2 className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              <span>Project Rooms</span>
            </span>
            <span className="opacity-40">/</span>
            {isRenaming ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                autoFocus
                className="px-1.5 py-0.5 rounded border bg-transparent outline-none font-medium text-xs"
                style={{ borderColor: 'var(--border-highlight)' }}
              />
            ) : (
              <span 
                onClick={() => {
                  setRenameValue(note.title || 'Project Planner');
                  setIsRenaming(true);
                }}
                className="font-medium hover:underline cursor-pointer flex items-center gap-1"
                title="Click to rename planner"
              >
                {note.title || 'Project Planner'}
              </span>
            )}
          </div>

          {/* Sections + Popover */}
          <div className="relative" ref={sectionsPopoverRef}>
            <button
              onClick={() => setShowSectionsPopover(!showSectionsPopover)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all hover:opacity-90 cursor-pointer text-xs font-medium"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              title="Manage Rooms & Project Sections"
            >
              <span>Sections</span>
              <Plus className="w-3 h-3 text-[var(--accent-color)]" />
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>

            {showSectionsPopover && (
              <div 
                className="absolute left-0 top-full mt-1.5 w-64 rounded-xl shadow-2xl border py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <div className="px-3 pb-2 border-b flex items-center justify-between font-semibold" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-[11px] uppercase tracking-wider opacity-60">Rooms / Modules</span>
                  <button 
                    onClick={() => handleAddColumn()}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-[var(--accent-color)]"
                    title="Add new section"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                  {boardData.columns.map((col) => {
                    const count = boardData.tasks.filter(t => t.columnId === col.id).length;
                    return (
                      <div
                        key={col.id}
                        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group"
                        onClick={() => scrollToColumn(col.id)}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: col.color || '#3b82f6' }} 
                          />
                          <span className="truncate">{col.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono opacity-50">
                            {count}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEditColumn(col);
                              setShowSectionsPopover(false);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer"
                            title="Edit section"
                          >
                            <Edit3 className="w-3 h-3 opacity-70" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Templates Quick Switch */}
                <div className="pt-2 px-3 border-t mt-1 space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-[10px] uppercase font-semibold opacity-50 tracking-wider">Project Templates</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleApplyTemplate('software')}
                      className="px-2 py-1 rounded border text-[11px] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer truncate text-left flex items-center gap-1"
                      style={{ borderColor: 'var(--border-color)' }}
                      title="Software Engineering Template"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Software</span>
                    </button>
                    <button
                      onClick={() => handleApplyTemplate('home')}
                      className="px-2 py-1 rounded border text-[11px] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer truncate text-left flex items-center gap-1"
                      style={{ borderColor: 'var(--border-color)' }}
                      title="Home & Space Planner Template"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>Home / Space</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 px-2 border-t mt-1.5" style={{ borderColor: 'var(--border-color)' }}>
                  <button
                    onClick={() => handleAddColumn()}
                    className="w-full py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Section</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-room-add-task"
            onClick={() => handleOpenAddTask()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all hover:opacity-85 active:scale-95 cursor-pointer text-xs font-medium shadow-2xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--accent-color)'
            }}
            title="Add task"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          <button
            id="btn-room-add-section"
            onClick={() => handleAddColumn()}
            className="p-1.5 rounded-lg border transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
            title="Add new section / room"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-room-rename"
            onClick={() => {
              setRenameValue(note.title || 'Project Planner');
              setIsRenaming(true);
            }}
            className="p-1.5 rounded-lg border transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
            title="Rename board"
          >
            <Edit3 className="w-3.5 h-3.5 opacity-80" />
          </button>

          <button
            id="btn-room-clear-all"
            onClick={handleClearAll}
            className="p-1.5 rounded-lg border transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
            title="Clear all tasks"
          >
            <Eraser className="w-3.5 h-3.5 opacity-80" />
          </button>

          {onDeleteNote && (
            <button
              id="btn-room-delete"
              onClick={handleDeleteBoard}
              className="p-1.5 rounded-lg border transition-all hover:bg-red-500/15 text-red-400 cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)'
              }}
              title="Delete board"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. ROOM / MODULE GRID */}
      <div className="flex-1 overflow-x-auto p-4 md:p-5">
        <div className="flex items-start gap-4 h-full min-w-max pb-2">
          {boardData.columns.map((col) => {
            const columnTasks = boardData.tasks.filter(t => t.columnId === col.id);
            const isDropTarget = dragOverColumnId === col.id;
            const isEditing = editingColumnId === col.id;
            const badgeColor = col.color || '#3b82f6';

            return (
              <div
                key={col.id}
                id={`column-${col.id}`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`w-72 md:w-80 flex flex-col shrink-0 max-h-full rounded-2xl border transition-all duration-150 overflow-hidden ${
                  isDropTarget ? 'ring-2 ring-[var(--accent-color)] border-transparent' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: isDropTarget ? 'var(--accent-color)' : 'var(--border-color)'
                }}
              >
                {/* Column Header */}
                <div 
                  className="px-3.5 py-3 border-b flex items-center justify-between text-xs font-medium select-none"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-card-hover)'
                  }}
                >
                  {isEditing ? (
                    <div className="w-full flex flex-col gap-2 py-1">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingColumnTitle}
                          onChange={(e) => setEditingColumnTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditColumn();
                            if (e.key === 'Escape') setEditingColumnId(null);
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1 rounded border outline-none text-xs"
                          style={{
                            backgroundColor: 'var(--bg-main)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)'
                          }}
                          placeholder="Module/Room name..."
                        />
                        <button
                          onClick={handleSaveEditColumn}
                          className="p-1 rounded bg-[var(--accent-color)] text-white cursor-pointer"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingColumnId(null)}
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1">
                          {COLUMN_COLORS.map(c => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => setEditingColumnColor(c.value)}
                              className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                                editingColumnColor === c.value ? 'scale-125 ring-2 ring-white/50' : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: c.value }}
                              title={c.name}
                            />
                          ))}
                        </div>

                        {boardData.columns.length > 1 && (
                          <button
                            onClick={() => handleDeleteColumn(col.id)}
                            className="text-red-400 hover:text-red-500 text-[11px] p-1 flex items-center gap-1 cursor-pointer"
                            title="Delete this section"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div 
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => handleStartEditColumn(col)}
                        title="Click to edit name & color"
                      >
                        <GripVertical className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70" />
                        <span 
                          className="px-2.5 py-0.5 rounded-md font-semibold text-xs text-white shadow-2xs"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {col.title}
                        </span>
                        <span 
                          className="font-semibold text-xs"
                          style={{ color: badgeColor }}
                        >
                          {columnTasks.length}
                        </span>
                      </div>

                      <button
                        onClick={() => handleStartEditColumn(col)}
                        className="p-1 rounded opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-opacity cursor-pointer"
                        title="Edit name & color"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Column Tasks */}
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto min-h-[140px]">
                  {columnTasks.length === 0 ? (
                    <div 
                      onClick={() => handleOpenAddTask(col.id)}
                      className="w-full py-8 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 text-xs opacity-40 hover:opacity-90 transition-opacity cursor-pointer select-none"
                      style={{ 
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--border-color)' 
                      }}
                    >
                      <Plus className="w-4 h-4" style={{ color: badgeColor }} />
                      <span className="font-medium">No tasks in {col.title}</span>
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const isDone = Boolean(task.completed || task.progress === 100);
                      const progressVal = isDone ? 100 : (typeof task.progress === 'number' ? task.progress : 0);

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => handleOpenEditTask(task)}
                          className={`group p-3.5 rounded-xl border cursor-pointer transition-all duration-150 shadow-2xs text-xs space-y-2.5 ${
                            isDone 
                              ? 'border-emerald-500/40 hover:border-emerald-500/60' 
                              : 'hover:border-[var(--border-highlight)]'
                          }`}
                          style={{
                            backgroundColor: isDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-main)',
                            borderColor: isDone ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-color)'
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                              {/* Done checkbox toggle */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleTaskDone(task.id, e)}
                                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                                  isDone 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                                    : 'border-black/25 dark:border-white/30 hover:border-emerald-500 bg-black/5 dark:bg-white/5'
                                }`}
                                title={isDone ? 'Mark as incomplete' : 'Mark as done'}
                              >
                                {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </button>

                              <div className="min-w-0 flex-1">
                                <h4 className={`font-semibold text-xs leading-snug tracking-tight transition-colors ${
                                  isDone 
                                    ? 'line-through text-emerald-900/60 dark:text-emerald-300/60' 
                                    : 'text-[var(--text-primary)]'
                                }`}>
                                  {task.title || 'Untitled task'}
                                </h4>
                                <p className="text-[11px] opacity-60 mt-0.5 truncate">
                                  {task.subtitle || boardData.projectName || 'In Project'}
                                </p>
                              </div>
                            </div>

                            {/* Direct Delete button & Drag handle */}
                            <div className="flex items-center gap-1 shrink-0 -mt-0.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete task "${task.title || 'Untitled task'}"?`)) {
                                    handleDeleteTask(task.id);
                                  }
                                }}
                                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/15 text-red-400 hover:text-red-500 transition-opacity cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <GripVertical className="w-3.5 h-3.5 opacity-20 group-hover:opacity-60 cursor-grab" />
                            </div>
                          </div>

                          <div className="space-y-1 text-[11px] opacity-75 font-sans">
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3 opacity-40 shrink-0" />
                              <span className="opacity-70">{task.assignee || '-'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 opacity-40 shrink-0" />
                              <span className="opacity-70">{task.deadline || task.scheduled || '-'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Flag className="w-3 h-3 opacity-40 shrink-0" />
                              <span className="opacity-70">
                                {task.priority ? (task.priority.charAt(0).toUpperCase() + task.priority.slice(1)) : '-'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 pt-0.5">
                              <SlidersHorizontal className="w-3 h-3 opacity-40 shrink-0" />
                              <div className="flex-1 h-1.5 rounded-full bg-black/15 dark:bg-white/10 overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${progressVal}%`,
                                    backgroundColor: isDone ? '#10b981' : (progressVal > 0 ? (badgeColor) : 'transparent')
                                  }} 
                                />
                              </div>
                              <span className={`text-[10px] font-mono w-7 text-right shrink-0 ${
                                isDone ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'opacity-70'
                              }`}>
                                {progressVal}%
                              </span>
                            </div>

                            <div className="pt-0.5 space-y-0.5">
                              <div className="flex items-center gap-1.5 opacity-80">
                                <span className="opacity-40 font-mono text-[10px]">$</span>
                                <span className="font-medium text-[11px]">{task.budget || '-'}</span>
                              </div>
                              {task.actualCost && task.actualCost !== '-' && (
                                <div className="flex items-center gap-1.5 opacity-70">
                                  <span className="opacity-40 font-mono text-[10px]">$</span>
                                  <span className="font-medium text-[11px]">{task.actualCost}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Add Task */}
                <div className="p-3 pt-1 select-none border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <button
                    onClick={() => handleOpenAddTask(col.id)}
                    className="w-full py-1.5 px-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold hover:opacity-85 transition-opacity cursor-pointer"
                    style={{ color: badgeColor }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
            );
          })}

          <div className="w-72 md:w-80 shrink-0 flex flex-col justify-center">
            <button
              onClick={() => handleAddColumn()}
              className="w-full py-12 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 text-xs opacity-50 hover:opacity-100 transition-all cursor-pointer select-none group"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)' 
              }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-color)' }}
              >
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-medium text-[var(--text-primary)]">Add Room / Section</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. TASK DETAIL & EDIT MODAL */}
      {isTaskModalOpen && selectedTask && (
        <RoomTaskDetailModal
          task={selectedTask}
          columns={boardData.columns}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

interface RoomTaskDetailModalProps {
  task: KanbanTask;
  columns: KanbanColumn[];
  onSave: (task: KanbanTask) => void;
  onDelete: (taskId: string) => void;
  onClose: () => void;
}

const RoomTaskDetailModal: React.FC<RoomTaskDetailModalProps> = ({
  task,
  columns,
  onSave,
  onDelete,
  onClose
}) => {
  const [title, setTitle] = useState(task.title);
  const [subtitle, setSubtitle] = useState(task.subtitle || 'In Project');
  const [columnId, setColumnId] = useState<string>(task.columnId || (columns[0] ? columns[0].id : ''));
  const [assignee, setAssignee] = useState(task.assignee || '');
  const [deadline, setDeadline] = useState(task.deadline || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task.priority || 'medium');
  const [progress, setProgress] = useState<number>(typeof task.progress === 'number' ? task.progress : 0);
  const [completed, setCompleted] = useState<boolean>(Boolean(task.completed || task.progress === 100));
  const [budget, setBudget] = useState(task.budget || '$500');
  const [actualCost, setActualCost] = useState(task.actualCost || '-');
  const [description, setDescription] = useState(task.description || '');

  const activeColumn = columns.find(c => c.id === columnId) || columns[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...task,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      columnId,
      assignee: assignee.trim() || '-',
      deadline: deadline.trim() || '-',
      priority,
      progress: completed ? 100 : progress,
      completed,
      budget: budget.trim() || '$500',
      actualCost: actualCost.trim() || '-',
      description: description.trim() || undefined,
      updatedAt: Date.now()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div 
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-100"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2.5">
            {activeColumn && (
              <span 
                className="px-2.5 py-0.5 rounded-md text-xs font-semibold text-white"
                style={{ backgroundColor: activeColumn.color || '#3b82f6' }}
              >
                {activeColumn.title}
              </span>
            )}
            <h3 className="font-semibold text-sm truncate max-w-xs">
              {task.title ? 'Task Details' : 'New Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[82vh]">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth2 client"
              autoFocus
              required
              className="w-full px-3 py-2 rounded-xl border outline-none text-sm font-medium transition-all"
              style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Module / Section</label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border outline-none text-xs cursor-pointer font-medium"
                style={{
                  backgroundColor: 'var(--bg-main)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                {columns.map(col => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Project Subsystem / Context</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. In AI Platform v2.0"
                className="w-full px-3 py-2 rounded-xl border outline-none text-xs"
                style={{
                  backgroundColor: 'var(--bg-main)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold opacity-80 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 opacity-60" />
                <span>Assignee</span>
              </label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="e.g. Alex, Designer, or -"
                className="w-full px-3 py-2 rounded-xl border outline-none text-xs"
                style={{
                  backgroundColor: 'var(--bg-main)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold opacity-80 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 opacity-60" />
                <span>Deadline</span>
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. Sprint End, Oct 28, or -"
                className="w-full px-3 py-2 rounded-xl border outline-none text-xs"
                style={{
                  backgroundColor: 'var(--bg-main)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold opacity-80 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 opacity-60" />
                <span>Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 rounded-xl border outline-none text-xs cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-main)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold opacity-80 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 opacity-60" />
                  <span>Progress</span>
                </label>
                <span className="font-mono font-semibold text-xs" style={{ color: activeColumn?.color || 'var(--accent-color)' }}>
                  {progress}%
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progress}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setProgress(val);
                    if (val === 100) setCompleted(true);
                    else if (completed && val < 100) setCompleted(false);
                  }}
                  className="flex-1 accent-[var(--accent-color)] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Mark as completed toggle */}
          <div 
            className="flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer select-none"
            style={{ 
              backgroundColor: completed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-main)',
              borderColor: completed ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-color)' 
            }}
            onClick={() => {
              const next = !completed;
              setCompleted(next);
              if (next) setProgress(100);
              else if (progress === 100) setProgress(0);
            }}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => {
                  const next = e.target.checked;
                  setCompleted(next);
                  if (next) setProgress(100);
                  else if (progress === 100) setProgress(0);
                }}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
              <span className={`text-xs font-medium ${completed ? 'line-through text-emerald-700 dark:text-emerald-300 font-semibold' : ''}`}>
                Mark task as Done / Completed
              </span>
            </div>
            {completed && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Completed
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold opacity-80">Budget / Estimate</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. $800 or 12 pts"
                className="w-full px-3 py-2 rounded-xl border outline-none text-xs font-mono"
                style={{
                  backgroundColor: 'var(--bg-main)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold opacity-80">Actual Cost / Effort</label>
              <input
                type="text"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="e.g. $720 or -"
                className="w-full px-3 py-2 rounded-xl border outline-none text-xs font-mono"
                style={{
                  backgroundColor: 'var(--bg-main)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold opacity-80">Description & Specifications</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add technical acceptance criteria, architecture links, materials, or contractor notes..."
              className="w-full px-3 py-2.5 rounded-xl border outline-none text-xs resize-none"
              style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Task</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl border text-xs hover:opacity-80 transition-opacity cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-98 cursor-pointer shadow-xs"
                style={{ backgroundColor: activeColumn?.color || 'var(--accent-color)' }}
              >
                Save Task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
