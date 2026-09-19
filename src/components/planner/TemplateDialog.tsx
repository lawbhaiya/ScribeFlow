import React, { useState } from 'react';
import {
  BookOpen,
  BriefcaseBusiness,
  Clapperboard,
  FileText,
  Film,
  Gamepad2,
  HeartPulse,
  Home,
  LayoutTemplate,
  MonitorPlay,
  Palette,
  PlaySquare,
  Sparkles,
  X
} from 'lucide-react';
import { ProjectTemplate } from '../../templates';

interface TemplateDialogProps {
  templates: Record<string, ProjectTemplate>;
  onApply: (key: string) => void;
  onClose: () => void;
}

type TemplateCategory = 'trackers' | 'productivity' | 'work' | 'creators';

const categories: Array<{ id: TemplateCategory; label: string; icon: React.ReactNode }> = [
  { id: 'trackers', label: 'Trackers', icon: <LayoutTemplate className="w-3.5 h-3.5" /> },
  { id: 'productivity', label: 'Productivity', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'work', label: 'Work', icon: <BriefcaseBusiness className="w-3.5 h-3.5" /> },
  { id: 'creators', label: 'Creators', icon: <Palette className="w-3.5 h-3.5" /> }
];

const categoryKeys: Record<TemplateCategory, string[]> = {
  trackers: ['blank', 'moviesShows', 'animeManga', 'reading', 'generalTemplate', 'jobSearch', 'finance', 'habits'],
  productivity: ['home', 'studentSyllabus', 'examPreparation', 'assignments', 'studyPlanner', 'placementPreparation', 'jobApplications', 'dsaTracker', 'academicProject', 'collegeDeadlines'],
  work: ['software'],
  creators: ['contentCreator', 'youtubeCreator', 'blogWriter']
};

const icons: Record<string, React.ReactNode> = {
  moviesShows: <Film className="w-5 h-5" />,
  animeManga: <Gamepad2 className="w-5 h-5" />,
  reading: <BookOpen className="w-5 h-5" />,
  generalTemplate: <FileText className="w-5 h-5" />,
  jobSearch: <BriefcaseBusiness className="w-5 h-5" />,
  finance: <HeartPulse className="w-5 h-5" />,
  habits: <Sparkles className="w-5 h-5" />,
  home: <Home className="w-5 h-5" />,
  software: <MonitorPlay className="w-5 h-5" />,
  contentCreator: <Palette className="w-5 h-5" />,
  youtubeCreator: <PlaySquare className="w-5 h-5" />,
  blogWriter: <Clapperboard className="w-5 h-5" />
};

export const TemplateDialog: React.FC<TemplateDialogProps> = ({ templates, onApply, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('trackers');
  const visibleKeys = categoryKeys[activeCategory].filter((key) => templates[key]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2"><LayoutTemplate className="w-4 h-4" style={{ color: 'var(--accent-color)' }} /> Project templates</h2>
            <p className="mt-1 text-[11px] opacity-60">Choose a blank structure for your room.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer" title="Close templates"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex min-h-[420px]">
          <nav className="w-36 shrink-0 border-r p-2 space-y-1" style={{ borderColor: 'var(--border-color)' }}>
            {categories.map((category) => (
              <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left cursor-pointer ${activeCategory === category.id ? 'font-semibold' : 'opacity-65 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'}`} style={activeCategory === category.id ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent-color)' } : undefined}>
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </nav>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleKeys.map((key) => {
                const template = templates[key];
                return (
                  <button key={key} onClick={() => onApply(key)} className="group text-left rounded-xl border p-4 hover:border-[var(--border-highlight)] hover:shadow-sm transition-all cursor-pointer" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-color)' }}>{icons[key] || <LayoutTemplate className="w-5 h-5" />}</span>
                      <span className="min-w-0"><span className="block text-xs font-semibold truncate">{template.name}</span><span className="block text-[11px] opacity-60 mt-1 line-clamp-2">{template.subtitle}</span></span>
                    </div>
                    <span className="block mt-3 text-[10px] opacity-45">{template.columns.length} sections · blank tasks</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
