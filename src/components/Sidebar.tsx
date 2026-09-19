import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  Pin,
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Heart,
  FileText, 
  Kanban as KanbanIcon,
  FolderGit2
} from 'lucide-react';
import { Note } from '../types';

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onCreateKanban: () => void;
  onCreateRoom: () => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onTogglePin: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onCreateKanban,
  onCreateRoom,
  onDeleteNote,
  onDuplicateNote,
  onTogglePin,
  isCollapsed,
  onToggleCollapse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const filteredNotes = notes.filter(n => {
    const q = searchQuery.toLowerCase();
    return (
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.subtitle && n.subtitle.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q))
    );
  }).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(timestamp));
  };

  if (isCollapsed) {
    return (
      <div 
        className="w-12 border-r flex flex-col items-center py-3 shrink-0 select-none transition-all gap-2 relative z-20"
        style={{
          backgroundColor: 'var(--bg-main)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer mb-1"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Collapsed + Dropdown trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 rounded-lg transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-xs"
            style={{
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-color)'
            }}
            title="Create new..."
          >
            <Plus className="w-4 h-4" />
          </button>

          {isDropdownOpen && (
            <div 
              className="absolute left-full top-0 ml-2 w-52 rounded-xl shadow-2xl border py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              <button
                onClick={() => {
                  onCreateNote();
                  setIsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-left"
              >
                <FileText className="w-4 h-4 opacity-70 text-[var(--accent-color)]" />
                <div>
                  <div className="font-medium">New Note</div>
                  <div className="text-[10px] opacity-50">Document & voice</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onCreateKanban();
                  setIsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-left"
              >
                <KanbanIcon className="w-4 h-4 opacity-70 text-amber-500" />
                <div>
                  <div className="font-medium">New Task Kanban</div>
                  <div className="text-[10px] opacity-50">Workflow board</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onCreateRoom();
                  setIsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-left"
              >
                <FolderGit2 className="w-4 h-4 opacity-70 text-indigo-400" />
                <div>
                  <div className="font-medium">New Project Room</div>
                  <div className="text-[10px] opacity-50">Software & projects</div>
                </div>
              </button>
            </div>
          )}
        </div>
        <div className="mt-auto pt-3 text-[9px] opacity-45" title="Made with love by Nilu @2026">
          <Heart className="w-3 h-3 mx-auto text-rose-400" fill="currentColor" />
          <span className="sr-only">Made with love by Nilu @2026</span>
        </div>
      </div>
    );
  }

  return (
    <aside 
      className="w-72 border-r flex flex-col shrink-0 select-none transition-all relative z-10"
      style={{
        backgroundColor: 'var(--bg-main)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Top Action Header with Dropdown */}
      <div className="p-3 border-b flex flex-col gap-2" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-1.5">
          {/* New Item Dropdown Button */}
          <div className="relative flex-1" ref={dropdownRef}>
            <button
              id="btn-new-dropdown"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:opacity-90 active:scale-98 cursor-pointer shadow-xs"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-color)' }}
                >
                  <Plus className="w-3 h-3" />
                </div>
                <span>New</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-50 transition-transform duration-200" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                className="absolute left-0 top-full mt-1.5 w-full rounded-xl shadow-2xl border py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                {/* 1. New Note */}
                <button
                  onClick={() => {
                    onCreateNote();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 opacity-70 text-[var(--accent-color)]" />
                    <div>
                      <div className="font-medium text-xs">New Note</div>
                      <div className="text-[10px] opacity-50">Document & speech capture</div>
                    </div>
                  </div>
                  <kbd className="text-[9px] px-1 py-0.5 rounded border font-mono opacity-50" style={{ borderColor: 'var(--border-color)' }}>
                    ⌘N
                  </kbd>
                </button>

                {/* 2. New Task Kanban */}
                <button
                  onClick={() => {
                    onCreateKanban();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-left transition-colors"
                >
                  <KanbanIcon className="w-4 h-4 opacity-70 text-amber-500" />
                  <div>
                    <div className="font-medium text-xs">New Task Kanban</div>
                    <div className="text-[10px] opacity-50">Workflow: Unplanned, Open, Doing, Done</div>
                  </div>
                </button>

                {/* 3. New Project Room */}
                <button
                  onClick={() => {
                    onCreateRoom();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-left transition-colors"
                >
                  <FolderGit2 className="w-4 h-4 opacity-70 text-indigo-400" />
                  <div>
                    <div className="font-medium text-xs">New Project Room</div>
                    <div className="text-[10px] opacity-50">Software, sprints, or spaces</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Collapse sidebar button */}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg border hover:opacity-80 transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notes, tasks & rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border outline-none transition-all placeholder:opacity-50"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredNotes.length === 0 ? (
          <div className="py-12 text-center text-xs opacity-50 px-4">
            No items found. Create a note, task kanban, or project room!
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isSelected = note.id === selectedNoteId;
            const isRoom = note.type === 'room';
            const isKanban = note.type === 'kanban';
            const snippet = note.content ? note.content.replace(/[#*`_{}"]/g, '').slice(0, 70) : 'Empty note...';
            
            const taskCount = (isKanban || isRoom) && note.kanbanData?.tasks 
              ? note.kanbanData.tasks.length 
              : 0;

            const columnCount = isRoom && note.kanbanData?.columns 
              ? note.kanbanData.columns.length 
              : (isKanban ? 4 : 0);

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`group relative p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected 
                    ? 'shadow-xs border-opacity-100' 
                    : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 opacity-85 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--bg-card)' : 'transparent',
                  borderColor: isSelected ? 'var(--border-highlight)' : 'transparent'
                }}
              >
                {/* Header: Title + Type Icon */}
                <div className="flex items-center gap-1.5 pr-12">
                  {isRoom ? (
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  ) : isKanban ? (
                    <KanbanIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 opacity-50 shrink-0" />
                  )}
                  <span className="font-medium truncate font-editorial-sans text-xs">
                    {note.title.trim() || (isRoom ? 'Project Room Planner' : isKanban ? 'Task Planner' : 'Untitled note')}
                  </span>
                  {note.pinned && <Pin className="w-3 h-3 shrink-0 text-cyan-500" fill="currentColor" />}
                </div>

                {/* Subtitle / context info */}
                <div className="text-[11px] opacity-60 truncate mt-1">
                  {isRoom 
                    ? `${taskCount} ${taskCount === 1 ? 'task' : 'tasks'} • ${columnCount} ${columnCount === 1 ? 'room' : 'modules'}`
                    : isKanban
                    ? `${taskCount} ${taskCount === 1 ? 'task' : 'tasks'} • 4 stages`
                    : (note.subtitle ? note.subtitle : snippet)}
                </div>

                {/* Footer: timestamp & badge */}
                <div className="flex items-center justify-between text-[10px] opacity-50 mt-2 font-mono">
                  <span>{formatTime(note.updatedAt)}</span>
                  <span>
                    {isRoom 
                      ? 'Project Room' 
                      : isKanban 
                      ? 'Task Kanban' 
                      : `${note.wordCount} words`}
                  </span>
                </div>

                {/* Quick actions on hover */}
                <div className="absolute right-2 top-2.5 hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(note.id);
                    }}
                    className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${note.pinned ? 'text-cyan-500' : ''}`}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className="w-3 h-3" fill={note.pinned ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateNote(note);
                    }}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3 opacity-70" />
                  </button>

                  {notes.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div
        className="shrink-0 border-t px-3 py-2 text-center text-[10px] opacity-50"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <span className="inline-flex items-center gap-1">
          Made with <Heart className="w-3 h-3 text-rose-400" fill="currentColor" /> by Nilu @2026
        </span>
      </div>
    </aside>
  );
};
