import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit3, 
  Eraser, 
  Trash2, 
  GripVertical,
  Calendar,
  Tag,
  FileText,
  Flag,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Kanban as KanbanIcon
} from 'lucide-react';
import { Note, KanbanBoardData, KanbanTask, KanbanColumnId } from '../types';

interface KanbanBoardProps {
  note: Note;
  onUpdateNote: (updated: Partial<Note>) => void;
  onDeleteNote?: (id: string) => void;
  onDuplicateNote?: (note: Note) => void;
}

export const DEFAULT_KANBAN_DATA: KanbanBoardData = {
  columns: [
    { id: 'none', title: 'Unplanned tasks' },
    { id: 'open', title: 'Open' },
    { id: 'in_progress', title: 'In progress' },
    { id: 'done', title: 'Done' }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Review speech-to-text accuracy benchmarks',
      columnId: 'none',
      scheduled: 'Scheduled for tomorrow',
      tags: ['research', 'ai'],
      priority: 'medium',
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
      updatedAt: Date.now() - 1000 * 60 * 60 * 2
    },
    {
      id: 'task-2',
      title: 'Implement ElevenLabs Scribe integration',
      columnId: 'open',
      scheduled: 'Friday',
      tags: ['audio', 'feature'],
      priority: 'high',
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24
    },
    {
      id: 'task-3',
      title: 'Optimize dark and warm theme contrast ratios',
      columnId: 'in_progress',
      scheduled: 'Today',
      tags: ['ui', 'styling'],
      priority: 'low',
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
      updatedAt: Date.now() - 1000 * 60 * 60 * 2
    },
    {
      id: 'task-4',
      title: 'Configure custom voice shortcuts & markdown export',
      columnId: 'done',
      tags: ['settings', 'export'],
      priority: 'medium',
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
      updatedAt: Date.now() - 1000 * 60 * 60 * 5
    }
  ]
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  note,
  onUpdateNote,
  onDeleteNote
}) => {
  // Initialize kanban data
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
    return DEFAULT_KANBAN_DATA;
  }, [note.kanbanData, note.content]);

  // Rename board state
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(note.title || 'Task Planner');

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [modalTargetColumn, setModalTargetColumn] = useState<string>('open');

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Helper to persist board updates
  const saveBoardData = (newBoardData: KanbanBoardData) => {
    onUpdateNote({
      kanbanData: newBoardData,
      content: JSON.stringify(newBoardData),
      updatedAt: Date.now()
    });
  };

  // Open modal to add new task
  const handleOpenAddTask = (columnId = 'open') => {
    setModalTargetColumn(columnId);
    setSelectedTask({
      id: `task-${Date.now()}`,
      title: '',
      columnId,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    setIsTaskModalOpen(true);
  };

  // Open modal to edit existing task
  const handleOpenEditTask = (task: KanbanTask) => {
    setSelectedTask(task);
    setModalTargetColumn(task.columnId);
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

  // Toggle task completed (Done logic)
  const handleToggleTaskDone = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = boardData.tasks.find(t => t.id === taskId);
    if (!target) return;

    const isCurrentlyDone = target.columnId === 'done' || Boolean(target.completed);
    const newDone = !isCurrentlyDone;

    const updatedTasks = boardData.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: newDone,
          columnId: newDone ? 'done' : (t.columnId === 'done' ? 'open' : t.columnId),
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

  // Clear all tasks
  const handleClearAll = () => {
    if (boardData.tasks.length === 0) return;
    if (window.confirm('Clear all tasks from this task planner?')) {
      saveBoardData({
        ...boardData,
        tasks: []
      });
    }
  };

  // Delete entire board
  const handleDeleteBoard = () => {
    if (onDeleteNote) {
      if (window.confirm(`Delete "${note.title || 'Task Planner'}"?`)) {
        onDeleteNote(note.id);
      }
    }
  };

  // Save board rename
  const handleSaveRename = () => {
    if (renameValue.trim()) {
      onUpdateNote({ title: renameValue.trim(), updatedAt: Date.now() });
    }
    setIsRenaming(false);
  };

  // Drag & drop handlers
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
      const isMovedToDone = columnId === 'done';
      const updatedTasks = boardData.tasks.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              columnId, 
              completed: isMovedToDone ? true : (columnId !== 'done' && t.completed ? false : t.completed),
              updatedAt: Date.now() 
            } 
          : t
      );
      saveBoardData({
        ...boardData,
        tasks: updatedTasks
      });
    }
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden select-text transition-colors"
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Top Header: Breadcrumbs + Direct Action Icons */}
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
              <KanbanIcon className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              <span>Task Planner</span>
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
                  setRenameValue(note.title || 'Task Planner');
                  setIsRenaming(true);
                }}
                className="font-medium hover:underline cursor-pointer flex items-center gap-1"
                title="Click to rename"
              >
                {note.title || 'Task Planner'}
              </span>
            )}
          </div>
        </div>

        {/* Action icons: Add Task, Rename, Clear All, Delete */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-kanban-add-task"
            onClick={() => handleOpenAddTask('open')}
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
            id="btn-kanban-rename"
            onClick={() => {
              setRenameValue(note.title || 'Task Planner');
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
            id="btn-kanban-clear-all"
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
              id="btn-kanban-delete"
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

      {/* 4 Workflow Columns: Unplanned, Open, In progress, Done */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full min-w-[800px]">
          {boardData.columns.map((col) => {
            const columnTasks = boardData.tasks.filter(t => t.columnId === col.id);
            const isDropTarget = dragOverColumnId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col h-full rounded-2xl border transition-all duration-150 overflow-hidden ${
                  isDropTarget ? 'ring-2 ring-[var(--accent-color)] border-transparent' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: isDropTarget ? 'var(--accent-color)' : 'var(--border-color)'
                }}
              >
                {/* Column Header */}
                <div 
                  className="px-4 py-3 border-b flex items-center justify-between text-xs font-medium select-none"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-card-hover)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="opacity-90">{col.title}</span>
                    <span 
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
                      style={{
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenAddTask(col.id)}
                    className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-opacity cursor-pointer"
                    title={`Add task to ${col.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column Tasks */}
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div 
                      onClick={() => handleOpenAddTask(col.id)}
                      className="w-full py-12 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 text-xs opacity-40 hover:opacity-80 transition-opacity cursor-pointer select-none"
                      style={{ 
                        backgroundColor: 'var(--bg-main)',
                        borderColor: 'var(--border-color)' 
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Drop tasks or click to add</span>
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const isDone = task.columnId === 'done' || Boolean(task.completed);

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => handleOpenEditTask(task)}
                          className={`group p-3 rounded-xl border cursor-pointer transition-all duration-150 shadow-2xs text-xs space-y-2 select-none ${
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

                              <p className={`font-medium leading-snug line-clamp-2 transition-colors ${
                                isDone 
                                  ? 'line-through text-emerald-900/60 dark:text-emerald-300/60' 
                                  : 'text-[var(--text-primary)]'
                              }`}>
                                {task.title || 'Untitled task'}
                              </p>
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

                          {/* Scheduled line */}
                          {task.scheduled && (
                            <div className="flex items-center gap-1.5 opacity-60 text-[11px] pl-6">
                              <Calendar className="w-3 h-3 shrink-0" />
                              <span className="truncate">{task.scheduled}</span>
                            </div>
                          )}

                          {/* Priority / Tags */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5 pl-6">
                            {task.priority && (
                              <span 
                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 ${
                                  task.priority === 'high' ? 'bg-red-500/15 text-red-400' :
                                  task.priority === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                                  'bg-blue-500/15 text-blue-400'
                                }`}
                              >
                                <Flag className="w-2.5 h-2.5" />
                                {task.priority}
                              </span>
                            )}

                            {task.tags && task.tags.map((t, idx) => (
                              <span 
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[10px] border flex items-center gap-1 opacity-70"
                                style={{ borderColor: 'var(--border-color)' }}
                              >
                                <Tag className="w-2.5 h-2.5 opacity-60" />
                                {t}
                              </span>
                            ))}

                            {isDone && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                                Done
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Add Task */}
                <div className="p-3 pt-1 select-none">
                  <button
                    onClick={() => handleOpenAddTask(col.id)}
                    className="w-full py-1.5 px-2 rounded-lg border border-dashed flex items-center justify-center gap-1.5 text-xs opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && selectedTask && (
        <TaskKanbanModal
          task={selectedTask}
          columns={boardData.columns}
          initialColumn={modalTargetColumn}
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

// Task Kanban Modal
interface TaskKanbanModalProps {
  task: KanbanTask;
  columns: KanbanBoardData['columns'];
  initialColumn: string;
  onSave: (task: KanbanTask) => void;
  onDelete: (taskId: string) => void;
  onClose: () => void;
}

const TaskKanbanModal: React.FC<TaskKanbanModalProps> = ({
  task,
  columns,
  initialColumn,
  onSave,
  onDelete,
  onClose
}) => {
  const [title, setTitle] = useState(task.title);
  const [columnId, setColumnId] = useState<string>(task.columnId || initialColumn);
  const [completed, setCompleted] = useState<boolean>((task.columnId || initialColumn) === 'done' || Boolean(task.completed));
  const [scheduled, setScheduled] = useState(task.scheduled || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(task.priority);
  const [tagsInput, setTagsInput] = useState((task.tags || []).join(', '));
  const [description, setDescription] = useState(task.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSave({
      ...task,
      title: title.trim(),
      columnId,
      completed,
      scheduled: scheduled.trim() || undefined,
      priority,
      tags,
      description: description.trim() || undefined,
      updatedAt: Date.now()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div 
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-100"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-semibold text-sm">
            {task.title ? 'Edit Task' : 'New Task'}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to get done?"
              autoFocus
              required
              className="w-full px-3 py-2 rounded-xl border outline-none text-xs"
              style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Workflow Stage</label>
              <select
                value={columnId}
                onChange={(e) => {
                  const val = e.target.value;
                  setColumnId(val);
                  if (val === 'done') setCompleted(true);
                  else if (completed) setCompleted(false);
                }}
                className="w-full px-3 py-2 rounded-xl border outline-none text-xs cursor-pointer"
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
              <label className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Priority</label>
              <select
                value={priority || ''}
                onChange={(e) => setPriority(e.target.value ? (e.target.value as 'low' | 'medium' | 'high') : undefined)}
                className="w-full px-3 py-2 rounded-xl border outline-none text-xs cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-main)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Mark as Done Toggle */}
          <div 
            className="flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer select-none"
            style={{ 
              backgroundColor: completed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-main)',
              borderColor: completed ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-color)' 
            }}
            onClick={() => {
              const next = !completed;
              setCompleted(next);
              if (next) setColumnId('done');
              else if (columnId === 'done') setColumnId('open');
            }}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => {
                  const next = e.target.checked;
                  setCompleted(next);
                  if (next) setColumnId('done');
                  else if (columnId === 'done') setColumnId('open');
                }}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
              <span className={`text-xs font-medium ${completed ? 'line-through text-emerald-700 dark:text-emerald-300 font-semibold' : ''}`}>
                Mark task as Done / Completed
              </span>
            </div>
            {completed && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Done
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Scheduled (Optional)</label>
            <input
              type="text"
              value={scheduled}
              onChange={(e) => setScheduled(e.target.value)}
              placeholder="e.g. Scheduled for Friday"
              className="w-full px-3 py-2 rounded-xl border outline-none text-xs"
              style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. design, sprint-1"
              className="w-full px-3 py-2 rounded-xl border outline-none text-xs"
              style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Notes / Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional task context..."
              className="w-full px-3 py-2 rounded-xl border outline-none text-xs resize-none"
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
              <span>Delete</span>
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
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-98 cursor-pointer shadow-xs"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
