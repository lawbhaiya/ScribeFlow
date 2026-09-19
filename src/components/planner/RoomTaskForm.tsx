import React, { useState } from 'react';
import { Calendar, Flag, SlidersHorizontal, Trash2, User } from 'lucide-react';
import { KanbanColumn, KanbanTask } from '../../types';
import { TemplateField } from '../../templates';

interface RoomTaskFormProps {
  task: KanbanTask;
  columns: KanbanColumn[];
  fields: TemplateField[];
  onSave: (task: KanbanTask) => void;
  onDelete: (taskId: string) => void;
  onClose: () => void;
}

export const RoomTaskForm: React.FC<RoomTaskFormProps> = ({ task, columns, fields, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState(task.title);
  const [subtitle, setSubtitle] = useState(task.subtitle || 'In Project');
  const [columnId, setColumnId] = useState(task.columnId || columns[0]?.id || '');
  const [assignee, setAssignee] = useState(task.assignee || '');
  const [deadline, setDeadline] = useState(task.deadline || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task.priority || 'medium');
  const [progress, setProgress] = useState(task.progress || 0);
  const [completed, setCompleted] = useState(Boolean(task.completed || task.progress === 100));
  const [budget, setBudget] = useState(task.budget || '$500');
  const [actualCost, setActualCost] = useState(task.actualCost || '-');
  const [description, setDescription] = useState(task.description || '');
  const [rating, setRating] = useState(task.rating || 0);
  const [imageUrl, setImageUrl] = useState(task.imageUrl || '');
  const [status, setStatus] = useState(task.status || '');
  const [notes, setNotes] = useState(task.notes || '');
  const activeColumn = columns.find((column) => column.id === columnId) || columns[0];
  const has = (field: TemplateField) => fields.includes(field);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSave({ ...task, title: title.trim(), subtitle: has('subtitle') ? subtitle.trim() || undefined : undefined, columnId, assignee: has('assignee') ? assignee.trim() || '-' : undefined, deadline: has('deadline') ? deadline.trim() || '-' : undefined, priority: has('priority') ? priority : undefined, progress: has('progress') ? (completed ? 100 : progress) : undefined, completed: has('completed') ? completed : undefined, budget: has('budget') ? budget.trim() || '$500' : undefined, actualCost: has('actualCost') ? actualCost.trim() || '-' : undefined, description: has('description') ? description.trim() || undefined : undefined, rating: has('rating') ? rating : undefined, imageUrl: has('imageUrl') ? imageUrl.trim() || undefined : undefined, status: has('status') ? status.trim() || undefined : undefined, notes: has('notes') ? notes.trim() || undefined : undefined, updatedAt: Date.now() });
  };

  return <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
    <div className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}><div className="flex items-center gap-2.5">{activeColumn && <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold text-white" style={{ backgroundColor: activeColumn.color || '#3b82f6' }}>{activeColumn.title}</span>}<h3 className="font-semibold text-sm">{task.title ? 'Task Details' : 'New Task'}</h3></div><button onClick={onClose} className="w-7 h-7 rounded-lg opacity-60 hover:opacity-100 cursor-pointer">✕</button></div>
      <form onSubmit={submit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[82vh]">
        <Field label="Task Title"><input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to get done?" className="input" /></Field>
        {has('subtitle') && <div className="grid grid-cols-2 gap-3"><Field label="Module / Section"><select value={columnId} onChange={(event) => setColumnId(event.target.value)} className="input">{columns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}</select></Field><Field label="Context"><input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="Project context" className="input" /></Field></div>}
        {(has('assignee') || has('deadline')) && <div className="grid grid-cols-2 gap-3">{has('assignee') && <Field label="Assignee"><input value={assignee} onChange={(event) => setAssignee(event.target.value)} placeholder="Name or team" className="input" /></Field>}{has('deadline') && <Field label="Deadline"><input value={deadline} onChange={(event) => setDeadline(event.target.value)} placeholder="Date or milestone" className="input" /></Field>}</div>}
        {(has('priority') || has('progress')) && <div className="grid grid-cols-2 gap-3">{has('priority') && <Field label="Priority"><select value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)} className="input"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></Field>}{has('progress') && <Field label={`Progress ${progress}%`}><input type="range" min="0" max="100" step="5" value={progress} onChange={(event) => setProgress(Number(event.target.value))} className="w-full accent-[var(--accent-color)] mt-3" /></Field>}</div>}
        {(has('imageUrl') || has('rating') || has('status') || has('notes')) && <div className="space-y-3 rounded-xl border p-3" style={{ borderColor: 'var(--border-color)' }}>{has('imageUrl') && <input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Image URL" className="input" />}{has('rating') && <Field label={`Rating ${rating || '-'}/5`}><input type="range" min="0" max="5" step="0.5" value={rating} onChange={(event) => setRating(Number(event.target.value))} className="w-full accent-[var(--accent-color)] mt-3" /></Field>}{has('status') && <input value={status} onChange={(event) => setStatus(event.target.value)} placeholder="Status or format" className="input" />}{has('notes') && <textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes" className="input resize-none" />}</div>}
        {has('completed') && <label className="flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer" style={{ borderColor: 'var(--border-color)' }}><input type="checkbox" checked={completed} onChange={(event) => setCompleted(event.target.checked)} className="accent-emerald-500" /><span>Mark as completed</span></label>}
        {(has('budget') || has('actualCost')) && <div className="grid grid-cols-2 gap-3">{has('budget') && <Field label="Budget"><input value={budget} onChange={(event) => setBudget(event.target.value)} className="input" /></Field>}{has('actualCost') && <Field label="Actual cost"><input value={actualCost} onChange={(event) => setActualCost(event.target.value)} className="input" /></Field>}</div>}
        {has('description') && <Field label="Description"><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Additional context" className="input resize-none" /></Field>}
        <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}><button type="button" onClick={() => onDelete(task.id)} className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-1.5 cursor-pointer"><Trash2 className="w-3.5 h-3.5" />Delete</button><div className="flex gap-2"><button type="button" onClick={onClose} className="px-3.5 py-1.5 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>Cancel</button><button type="submit" className="px-5 py-1.5 rounded-lg text-white font-semibold cursor-pointer" style={{ backgroundColor: activeColumn?.color || 'var(--accent-color)' }}>Save Task</button></div></div>
      </form>
    </div>
  </div>;
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => <div className="space-y-1.5"><label className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">{label}</label>{children}</div>;
