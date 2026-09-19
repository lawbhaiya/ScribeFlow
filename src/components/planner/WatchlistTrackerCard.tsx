import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { KanbanTask } from '../../types';

interface WatchlistTrackerCardProps {
  task: KanbanTask;
  badgeColor: string;
  isDone: boolean;
  onToggleDone: (taskId: string, event: React.MouseEvent) => void;
  onDelete: (task: KanbanTask, event: React.MouseEvent) => void;
}

export const WatchlistTrackerCard: React.FC<WatchlistTrackerCardProps> = ({ task, badgeColor, isDone, onToggleDone, onDelete }) => (
  <div className="flex items-start gap-3">
    {task.imageUrl ? <img src={task.imageUrl} alt="" className="w-24 h-24 shrink-0 object-cover rounded-lg border" style={{ borderColor: 'var(--border-color)' }} /> : <div className="w-16 h-16 shrink-0 rounded-lg border flex items-center justify-center text-[10px] opacity-40" style={{ borderColor: 'var(--border-color)' }}>No image</div>}
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        <h4 className={`font-semibold text-sm leading-snug ${isDone ? 'line-through opacity-60' : ''}`}>{task.title || 'Untitled item'}</h4>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={(event) => onToggleDone(task.id, event)} className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-black/25 dark:border-white/30'}`} title={isDone ? 'Mark as incomplete' : 'Mark as complete'}>{isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}</button>
          <button type="button" onClick={(event) => onDelete(task, event)} className="w-5 h-5 rounded flex items-center justify-center text-red-400 hover:bg-red-500/15 cursor-pointer" title="Delete task"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 text-[11px]">{task.status && <span className="px-1.5 py-0.5 rounded border truncate" style={{ borderColor: badgeColor, color: badgeColor }}>{task.status}</span>}{typeof task.rating === 'number' && task.rating > 0 && <span className="text-amber-500">{'★'.repeat(Math.round(task.rating))} <span className="font-mono">{task.rating}/5</span></span>}</div>
      {task.notes && <p className="text-[11px] opacity-65 line-clamp-2 mt-2">{task.notes}</p>}
    </div>
  </div>
);
