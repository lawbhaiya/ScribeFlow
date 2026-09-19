import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  GripVertical,
  Calendar,
  User,
  Flag,
  SlidersHorizontal,
  X,
  Check,
  MoreHorizontal,
} from 'lucide-react';
import { Note, KanbanBoardData, KanbanTask, KanbanColumn } from '../types';
import { DEFAULT_ROOM_DATA, PROJECT_TEMPLATES, ProjectTemplate, TemplateField } from '../templates';
import { PlannerHeader } from './planner/PlannerHeader';
import { WatchlistTrackerCard } from './planner/WatchlistTrackerCard';
import { WorkTrackerCard } from './planner/WorkTrackerCard';
import { RoomTaskDetailModal } from './planner/RoomTaskDetailModal';
import { TemplateDialog } from './planner/TemplateDialog';

export { DEFAULT_ROOM_DATA, PROJECT_TEMPLATES } from '../templates';

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

  const activeTemplate = useMemo<ProjectTemplate>(() => {
    return Object.values(PROJECT_TEMPLATES).find((template) => (
      template.name === boardData.projectName || template.name === note.title
    )) || PROJECT_TEMPLATES.software;
  }, [boardData.projectName, note.title]);

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
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

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
    const completionColumn = boardData.columns.find((column) => (
      ['done', 'completed', 'finished'].includes(column.id.toLowerCase()) ||
      ['done', 'completed', 'finished'].includes(column.title.toLowerCase())
    ));
    const fallbackColumn = boardData.columns.find((column) => column.id !== completionColumn?.id);
    const updatedTasks = boardData.tasks.map(t => {
      if (t.id === taskId) {
        const isCurrentlyDone = Boolean(t.completed || t.progress === 100);
        const newDone = !isCurrentlyDone;
        return {
          ...t,
          completed: newDone,
          columnId: newDone && completionColumn
            ? completionColumn.id
            : (!newDone && completionColumn && t.columnId === completionColumn.id
              ? (fallbackColumn?.id || t.columnId)
              : t.columnId),
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
  const handleApplyTemplate = (templateKey: string) => {
    const template = PROJECT_TEMPLATES[templateKey];
    if (window.confirm(`Load "${template.name}" template? Current rooms will be replaced.`)) {
      saveBoardData({
        projectName: template.name,
        columns: template.columns,
        tasks: template.tasks as KanbanTask[]
      });
      onUpdateNote({ title: template.name, subtitle: template.subtitle });
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

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden select-text transition-colors"
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)'
      }}
    >
      <PlannerHeader
        note={note}
        isRenaming={isRenaming}
        renameValue={renameValue}
        onRenameValueChange={setRenameValue}
        onSaveRename={handleSaveRename}
        onCancelRename={() => setIsRenaming(false)}
        onOpenTemplates={() => setShowTemplateDialog(true)}
        onTogglePinned={() => onUpdateNote({ pinned: !note.pinned })}
        onToggleStarred={() => onUpdateNote({ starred: !note.starred })}
        onStartRename={() => { setRenameValue(note.title || 'Project Planner'); setIsRenaming(true); }}
        onClearAll={handleClearAll}
        onDelete={onDeleteNote ? handleDeleteBoard : undefined}
      />

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
                      const isTrackerCard = activeTemplate.fields.some((field) => ['imageUrl', 'rating', 'status'].includes(field));

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
                          {isTrackerCard && (
                            <WatchlistTrackerCard
                              task={task}
                              badgeColor={badgeColor}
                              isDone={isDone}
                              onToggleDone={handleToggleTaskDone}
                              onDelete={(taskToDelete, event) => {
                                event.stopPropagation();
                                if (window.confirm(`Delete task "${taskToDelete.title || 'Untitled item'}"?`)) handleDeleteTask(taskToDelete.id);
                              }}
                            />
                          )}
                          {!isTrackerCard && (
                            <WorkTrackerCard
                              task={task}
                              badgeColor={badgeColor}
                              isDone={isDone}
                              progress={progressVal}
                              showAssignee={activeTemplate.fields.includes('assignee')}
                              showDeadline={activeTemplate.fields.includes('deadline')}
                              showPriority={activeTemplate.fields.includes('priority')}
                              showProgress={activeTemplate.fields.includes('progress')}
                              showBudget={activeTemplate.fields.includes('budget')}
                              showActualCost={activeTemplate.fields.includes('actualCost')}
                              onToggleDone={handleToggleTaskDone}
                              onDelete={(taskToDelete, event) => {
                                event.stopPropagation();
                                if (window.confirm(`Delete task "${taskToDelete.title || 'Untitled task'}"?`)) handleDeleteTask(taskToDelete.id);
                              }}
                            />
                          )}
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
          fields={activeTemplate.fields}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
      {showTemplateDialog && (
        <TemplateDialog
          templates={PROJECT_TEMPLATES}
          onApply={(templateKey) => {
            handleApplyTemplate(templateKey);
            setShowTemplateDialog(false);
          }}
          onClose={() => setShowTemplateDialog(false)}
        />
      )}
    </div>
  );
};

