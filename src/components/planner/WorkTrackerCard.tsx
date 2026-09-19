import React from 'react';
import { Calendar, Check, Flag, GripVertical, SlidersHorizontal, Trash2, User } from 'lucide-react';
import { KanbanTask } from '../../types';

interface WorkTrackerCardProps {
  task: KanbanTask;
  badgeColor: string;
  isDone: boolean;
  progress: number;
  showAssignee: boolean;
  showDeadline: boolean;
  showPriority: boolean;
  showProgress: boolean;
  showBudget: boolean;
  showActualCost: boolean;
  onToggleDone: (taskId: string, event: React.MouseEvent) => void;
  onDelete: (task: KanbanTask, event: React.MouseEvent) => void;
}

export const WorkTrackerCard: React.FC<WorkTrackerCardProps> = ({ task, badgeColor, isDone, progress, showAssignee, showDeadline, showPriority, showProgress, showBudget, showActualCost, onToggleDone, onDelete }) => (
  <>
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-start gap-2 min-w-0 flex-1">
        <button type="button" onClick={(event) => onToggleDone(task.id, event)} className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-black/25 dark:border-white/30'}`} title={isDone ? 'Mark as incomplete' : 'Mark as done'}>{isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}</button>
        <div className="min-w-0 flex-1"><h4 className={`font-semibold text-xs leading-snug ${isDone ? 'line-through opacity-60' : ''}`}>{task.title || 'Untitled task'}</h4><p className="text-[11px] opacity-60 mt-0.5 truncate">{task.subtitle || 'In Project'}</p></div>
      </div>
      <div className="flex items-center gap-1 shrink-0"><button type="button" onClick={(event) => onDelete(task, event)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/15 text-red-400 cursor-pointer" title="Delete task"><Trash2 className="w-3.5 h-3.5" /></button><GripVertical className="w-3.5 h-3.5 opacity-20 group-hover:opacity-60 cursor-grab" /></div>
    </div>
    <div className="space-y-1 text-[11px] opacity-75 font-sans">
      {showAssignee && <div className="flex items-center gap-2"><User className="w-3 h-3 opacity-40" /><span>{task.assignee || '-'}</span></div>}
      {showDeadline && <div className="flex items-center gap-2"><Calendar className="w-3 h-3 opacity-40" /><span>{task.deadline || task.scheduled || '-'}</span></div>}
      {showPriority && <div className="flex items-center gap-2"><Flag className="w-3 h-3 opacity-40" /><span>{task.priority ? `${task.priority[0].toUpperCase()}${task.priority.slice(1)}` : '-'}</span></div>}
      {showProgress && <div className="flex items-center gap-2"><SlidersHorizontal className="w-3 h-3 opacity-40" /><div className="flex-1 h-1.5 rounded-full bg-black/15 dark:bg-white/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: isDone ? '#10b981' : progress > 0 ? badgeColor : 'transparent' }} /></div><span className="font-mono w-7 text-right">{progress}%</span></div>}
      {(showBudget || showActualCost) && <div className="pt-0.5 space-y-0.5">{showBudget && <div className="flex items-center gap-1.5"><span className="opacity-40 font-mono">$</span><span>{task.budget || '-'}</span></div>}{showActualCost && task.actualCost && task.actualCost !== '-' && <div className="flex items-center gap-1.5"><span className="opacity-40 font-mono">$</span><span>{task.actualCost}</span></div>}</div>}
    </div>
  </>
);
