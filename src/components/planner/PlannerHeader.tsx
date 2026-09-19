import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eraser,
  FolderGit2,
  LayoutTemplate,
  Pin,
  Star,
  Trash2
} from 'lucide-react';
import { Note } from '../../types';

interface PlannerHeaderProps {
  note: Note;
  isRenaming: boolean;
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onOpenTemplates: () => void;
  onTogglePinned: () => void;
  onToggleStarred: () => void;
  onStartRename: () => void;
  onClearAll: () => void;
  onDelete?: () => void;
}

export const PlannerHeader: React.FC<PlannerHeaderProps> = ({
  note,
  isRenaming,
  renameValue,
  onRenameValueChange,
  onSaveRename,
  onCancelRename,
  onOpenTemplates,
  onTogglePinned,
  onToggleStarred,
  onStartRename,
  onClearAll,
  onDelete
}) => (
  <header className="h-11 px-4 border-b flex items-center justify-between text-xs select-none shrink-0" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex items-center gap-1 opacity-50">
        <button className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer" title="Previous room"><ChevronLeft className="w-3.5 h-3.5" /></button>
        <button className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer" title="Next room"><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
      <div className="flex items-center gap-1.5 opacity-80 text-xs min-w-0">
        <span className="opacity-60 flex items-center gap-1 shrink-0"><FolderGit2 className="w-3.5 h-3.5 text-[var(--accent-color)]" /><span>Project Rooms</span></span>
        <span className="opacity-40">/</span>
        {isRenaming ? (
          <input type="text" value={renameValue} onChange={(event) => onRenameValueChange(event.target.value)} onBlur={onSaveRename} onKeyDown={(event) => { if (event.key === 'Enter') onSaveRename(); if (event.key === 'Escape') onCancelRename(); }} autoFocus className="px-1.5 py-0.5 rounded border bg-transparent outline-none font-medium text-xs" style={{ borderColor: 'var(--border-highlight)' }} />
        ) : (
          <span onClick={onStartRename} className="font-medium hover:underline cursor-pointer truncate" title="Click to rename planner">{note.title || 'Project Planner'}</span>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <button onClick={onOpenTemplates} className="p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} title="Browse templates"><LayoutTemplate className="w-3.5 h-3.5" /></button>
      <button onClick={onTogglePinned} className={`p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer ${note.pinned ? 'text-cyan-500' : ''}`} style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} title={note.pinned ? 'Unpin room' : 'Pin room'}><Pin className="w-3.5 h-3.5" fill={note.pinned ? 'currentColor' : 'none'} /></button>
      <button onClick={onToggleStarred} className={`p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer ${note.starred ? 'text-amber-400' : ''}`} style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} title={note.starred ? 'Unstar room' : 'Star room'}><Star className="w-3.5 h-3.5" fill={note.starred ? 'currentColor' : 'none'} /></button>
      <button onClick={onStartRename} className="p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} title="Rename board"><Edit3 className="w-3.5 h-3.5 opacity-80" /></button>
      <button onClick={onClearAll} className="p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }} title="Clear all tasks"><Eraser className="w-3.5 h-3.5 opacity-80" /></button>
      {onDelete && <button onClick={onDelete} className="p-1.5 rounded-lg border hover:bg-red-500/15 text-red-400 cursor-pointer" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} title="Delete board"><Trash2 className="w-3.5 h-3.5" /></button>}
    </div>
  </header>
);
