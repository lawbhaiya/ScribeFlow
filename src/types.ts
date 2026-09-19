export type Theme = 'mocha' | 'light' | 'warm' | 'dark';

export type VoiceMode = 'native_win_h' | 'elevenlabs_scribe';

export type ItemType = 'note' | 'kanban' | 'room';

export type KanbanColumnId = string;

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string; // badge & accent color, e.g. '#ef4444'
}

export interface KanbanTask {
  id: string;
  title: string;
  columnId: string;
  subtitle?: string; // e.g. "In Home Improvement Project Planner"
  description?: string;
  deadline?: string;
  scheduled?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  progress?: number; // 0 to 100
  budget?: string; // e.g. "$100"
  actualCost?: string; // e.g. "$120"
  tags?: string[];
  fileName?: string;
  completed?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface KanbanBoardData {
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  projectName?: string;
}

export interface Note {
  id: string;
  type?: ItemType;
  title: string;
  subtitle: string;
  content: string;
  kanbanData?: KanbanBoardData;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  readingTime: number;
}

export type AIAction = 
  | 'organize' 
  | 'structure' 
  | 'summarize' 
  | 'rewrite' 
  | 'continue' 
  | 'grammar' 
  | 'custom';

export interface AISettings {
  openRouterApiKey: string;
  openRouterModel: string;
  elevenLabsApiKey: string;
  elevenLabsModelId: string;
  enableThoughtProcess: boolean;
  activeVoiceMode: VoiceMode;
}

export interface AIThoughtResult {
  thoughtProcess: string;
  content: string;
  durationMs: number;
  modelUsed: string;
}
