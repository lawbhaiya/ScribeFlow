import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { KanbanBoard, DEFAULT_KANBAN_DATA } from './components/KanbanBoard';
import { Rooms, DEFAULT_ROOM_DATA, PROJECT_TEMPLATES, TemplateDialog } from './components/planner';
import { SettingsModal } from './components/SettingsModal';
import { Note, Theme, VoiceMode, AIAction, AISettings, AIThoughtResult } from './types';
import { DEFAULT_AI_SETTINGS, processTextWithAI } from './services/aiService';
import { voiceManager } from './services/voiceService';

const SAMPLE_ROOM: Note = {
  id: 'room-default',
  type: 'room',
  title: 'Software Project Planner',
  subtitle: 'Full-stack software delivery & sprints',
  content: JSON.stringify(DEFAULT_ROOM_DATA),
  kanbanData: DEFAULT_ROOM_DATA,
  createdAt: Date.now() - 1000 * 60 * 10,
  updatedAt: Date.now() - 1000 * 60 * 10,
  wordCount: 0,
  readingTime: 1
};

const SAMPLE_KANBAN: Note = {
  id: 'kanban-default',
  type: 'kanban',
  title: 'Task Planner',
  subtitle: 'Workflow stages & priority',
  content: JSON.stringify(DEFAULT_KANBAN_DATA),
  kanbanData: DEFAULT_KANBAN_DATA,
  createdAt: Date.now() - 1000 * 60 * 20,
  updatedAt: Date.now() - 1000 * 60 * 20,
  wordCount: 0,
  readingTime: 1
};

const SAMPLE_NOTES: Note[] = [
  SAMPLE_ROOM,
  SAMPLE_KANBAN,
  {
    id: 'note-1',
    title: 'Untitled note',
    subtitle: '',
    content: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    wordCount: 0,
    readingTime: 1
  },
  {
    id: 'note-2',
    title: 'The Architecture of Quiet Speech',
    subtitle: 'How natural speech unlocks structured narrative craft',
    content: `When you speak out loud without staring at an oppressive blank canvas, something remarkable shifts in your cognitive posture. Ideas don't arrive as formal, stiff paragraphs—they emerge as energetic waves of intuition.

Spoken language carries a biological rhythm. It has breath, cadence, and authentic tension that typed text often loses in the agonizing friction of backspacing.

The modern writer's superpower is not typing faster; it is capturing the velocity of unedited speech and molding it with disciplined structure.`,
    createdAt: Date.now() - 1000 * 60 * 47,
    updatedAt: Date.now() - 1000 * 60 * 47,
    wordCount: 197,
    readingTime: 1
  }
];

export default function App() {
  // Theme state: default to 'mocha' as shown in user screenshot
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('scribeflow_theme') as Theme) || 'mocha';
  });

  // Notes persistence
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('scribeflow_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let list = [...parsed];
          const hasRoom = list.some((n: any) => n.type === 'room');
          const hasKanban = list.some((n: any) => n.type === 'kanban');
          if (!hasRoom) {
            list = [SAMPLE_ROOM, ...list];
          }
          if (!hasKanban) {
            list = [SAMPLE_KANBAN, ...list];
          }
          return list;
        }
      } catch (e) {}
    }
    return SAMPLE_NOTES;
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string>(() => {
    return notes[0]?.id || 'room-default';
  });

  // Settings
  const [settings, setSettings] = useState<AISettings>(() => {
    return {
      ...DEFAULT_AI_SETTINGS,
      openRouterApiKey: localStorage.getItem('scribeflow_openrouter_key') || '',
      openRouterModel: localStorage.getItem('scribeflow_openrouter_model') || 'deepseek/deepseek-r1',
      elevenLabsApiKey: localStorage.getItem('scribeflow_elevenlabs_key') || '',
      elevenLabsModelId: localStorage.getItem('scribeflow_elevenlabs_model') || 'scribe_v1',
      activeVoiceMode: (localStorage.getItem('scribeflow_voice_mode') as VoiceMode) || 'native_win_h'
    };
  });

  // UI state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRoomTemplateDialogOpen, setIsRoomTemplateDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<AIThoughtResult | null>(null);

  // Autosaved status toggle state
  const [showAutosavedBadge, setShowAutosavedBadge] = useState(false);
  const isDirtyRef = useRef(false);
  const idleTimerRef = useRef<any>(null);
  const hideTimerRef = useRef<any>(null);
  const notesRef = useRef(notes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Flush save to localStorage and trigger the Autosaved toggle notification
  const triggerAutosaveIndicator = useCallback(() => {
    try {
      localStorage.setItem('scribeflow_notes', JSON.stringify(notesRef.current));
      localStorage.setItem('scribeflow_last_saved', String(Date.now()));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    setShowAutosavedBadge(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowAutosavedBadge(false);
    }, 2400);
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    try {
      localStorage.setItem('scribeflow_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [notes]);

  // Mark changes dirty and start idle debounce timer (trigger autosaved toggle when user stays idle)
  const notifyChange = useCallback(() => {
    isDirtyRef.current = true;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (isDirtyRef.current) {
        triggerAutosaveIndicator();
        isDirtyRef.current = false;
      }
    }, 1200); // Trigger when staying idle for 1.2s after change
  }, [triggerAutosaveIndicator]);

  // Trigger autosaved toggle when screen / note changes
  const prevSelectedNoteIdRef = useRef(selectedNoteId);
  useEffect(() => {
    if (prevSelectedNoteIdRef.current !== selectedNoteId) {
      if (isDirtyRef.current) {
        triggerAutosaveIndicator();
        isDirtyRef.current = false;
      } else {
        // Also ensure data is written and show autosaved reassurance when switching screens
        triggerAutosaveIndicator();
      }
      prevSelectedNoteIdRef.current = selectedNoteId;
    }
  }, [selectedNoteId, triggerAutosaveIndicator]);

  // Also autosave on tab visibility change or window blur
  useEffect(() => {
    const handleVisibilityOrBlur = () => {
      if (isDirtyRef.current) {
        triggerAutosaveIndicator();
        isDirtyRef.current = false;
      }
    };
    window.addEventListener('blur', handleVisibilityOrBlur);
    document.addEventListener('visibilitychange', handleVisibilityOrBlur);
    return () => {
      window.removeEventListener('blur', handleVisibilityOrBlur);
      document.removeEventListener('visibilitychange', handleVisibilityOrBlur);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [triggerAutosaveIndicator]);

  // Active note
  const currentNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  // Apply theme class to document body
  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('scribeflow_theme', theme);
  }, [theme]);

  // Note updates
  const handleUpdateCurrentNote = (updated: Partial<Note>) => {
    notifyChange();
    setNotes((prevNotes) =>
      prevNotes.map((n) => {
        if (n.id === currentNote.id) {
          return { ...n, ...updated, updatedAt: Date.now() };
        }
        return n;
      })
    );
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      type: 'note',
      title: 'Untitled note',
      subtitle: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wordCount: 0,
      readingTime: 1
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setAiResult(null);
  };

  const handleCreateKanban = () => {
    const newKanban: Note = {
      id: `kanban-${Date.now()}`,
      type: 'kanban',
      title: 'New Task Kanban',
      subtitle: 'Workflow stages & priority',
      content: JSON.stringify(DEFAULT_KANBAN_DATA),
      kanbanData: DEFAULT_KANBAN_DATA,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wordCount: 0,
      readingTime: 1
    };
    setNotes([newKanban, ...notes]);
    setSelectedNoteId(newKanban.id);
    setAiResult(null);
  };

  const handleCreateRoom = (templateKey = 'software') => {
    const template = PROJECT_TEMPLATES[templateKey] || PROJECT_TEMPLATES.software;
    const newRoom: Note = {
      id: `room-${Date.now()}`,
      type: 'room',
      title: template.name,
      subtitle: template.subtitle,
      content: JSON.stringify({ projectName: template.name, columns: template.columns, tasks: template.tasks }),
      kanbanData: { projectName: template.name, columns: template.columns, tasks: template.tasks },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wordCount: 0,
      readingTime: 1
    };
    setNotes([newRoom, ...notes]);
    setSelectedNoteId(newRoom.id);
    setAiResult(null);
  };

  const handleOpenRoomTemplateDialog = () => {
    setIsRoomTemplateDialogOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    if (notes.length <= 1) return;
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (selectedNoteId === id) {
      setSelectedNoteId(remaining[0].id);
    }
  };

  const handleDuplicateNote = (noteToDup: Note) => {
    const duplicated: Note = {
      ...noteToDup,
      id: `note-${Date.now()}`,
      title: `${noteToDup.title || 'Untitled note'} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotes([duplicated, ...notes]);
    setSelectedNoteId(duplicated.id);
  };

  const handleTogglePin = (id: string) => {
    notifyChange();
    setNotes((prevNotes) => prevNotes.map((note) => (
      note.id === id ? { ...note, pinned: !note.pinned, updatedAt: Date.now() } : note
    )));
  };

  // Keyboard shortcuts (⌘N for new note)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [notes]);

  const selectedNoteIdRef = useRef(selectedNoteId);
  const currentNoteRef = useRef(currentNote);
  useEffect(() => {
    selectedNoteIdRef.current = selectedNoteId;
    currentNoteRef.current = currentNote;
  }, [selectedNoteId, currentNote]);

  const appendTranscript = (chunk: string) => {
    const text = chunk.trim();
    if (!text) return;
    notifyChange();
    const targetId = selectedNoteIdRef.current;
    setNotes((prevNotes) =>
      prevNotes.map((n) => {
        if (n.id === targetId) {
          const sep = n.content ? (n.content.endsWith('\n') ? '\n' : '\n\n') : '';
          const newContent = `${n.content}${sep}${text}`;
          const words = newContent.trim().split(/\s+/).filter(Boolean).length;
          return {
            ...n,
            content: newContent,
            wordCount: words,
            readingTime: Math.max(1, Math.ceil(words / 200)),
            updatedAt: Date.now()
          };
        }
        return n;
      })
    );
  };

  // Voice recording toggle logic
  const handleToggleRecord = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setAudioLevel(0);
      
      // Commit any lingering interim transcript so words are not lost
      if (interimTranscript && interimTranscript.trim()) {
        appendTranscript(interimTranscript.trim());
      }
      setInterimTranscript('');

      const transcribed = await voiceManager.stopAudioCaptureAndTranscribe(
        settings.elevenLabsApiKey,
        settings.elevenLabsModelId
      );

      if (transcribed && transcribed.trim() !== '') {
        appendTranscript(transcribed.trim());
      }
    } else {
      // If currently viewing a kanban or room board, switch to a text note so user sees their dictation
      if (currentNote.type === 'kanban' || currentNote.type === 'room') {
        const existingNote = notes.find((n) => n.type === 'note' || !n.type);
        if (existingNote) {
          setSelectedNoteId(existingNote.id);
          selectedNoteIdRef.current = existingNote.id;
        } else {
          const newNote: Note = {
            id: `note-${Date.now()}`,
            type: 'note',
            title: 'Voice Note',
            subtitle: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            wordCount: 0,
            readingTime: 1
          };
          setNotes([newNote, ...notes]);
          setSelectedNoteId(newNote.id);
          selectedNoteIdRef.current = newNote.id;
        }
      }

      // Start recording
      setInterimTranscript('');
      const started = await voiceManager.startAudioCapture({
        onTranscriptChunk: (chunk: string, isFinal: boolean) => {
          if (isFinal) {
            setInterimTranscript('');
            appendTranscript(chunk);
          } else {
            setInterimTranscript(chunk);
          }
        },
        onAudioLevel: (level: number) => {
          setAudioLevel(level);
        },
        onError: (err: string) => {
          setIsRecording(false);
          setAudioLevel(0);
          console.warn('Voice recording notification:', err);
        },
        onRecordingStateChange: (rec: boolean) => {
          setIsRecording(rec);
        }
      });
      if (started) {
        setIsRecording(true);
      }
    }
  };

  // AI action execution
  const handleSelectAIAction = async (action: AIAction, customPrompt?: string) => {
    const textToProcess = action === 'new_conversation'
      ? customPrompt?.trim() || ''
      : currentNote.content.trim() || currentNote.title;
    if (!textToProcess) {
      alert(action === 'new_conversation'
        ? 'Please enter a topic for the new conversation.'
        : 'Please speak or type some text first before organizing.');
      return;
    }

    setIsAIProcessing(true);
    setAiResult(null);

    try {
      const result = await processTextWithAI(
        textToProcess,
        action,
        customPrompt,
        settings
      );
      setAiResult(result);
    } catch (err: any) {
      console.error('AI Processing error:', err);
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleAcceptAIResult = (mode: 'replace' | 'append') => {
    if (!aiResult) return;

    let newContent = '';
    if (mode === 'replace') {
      newContent = aiResult.content;
    } else {
      const separator = currentNote.content ? '\n\n' : '';
      newContent = `${currentNote.content}${separator}${aiResult.content}`;
    }

    const words = newContent.trim().split(/\s+/).filter(Boolean).length;
    handleUpdateCurrentNote({
      content: newContent,
      wordCount: words,
      readingTime: Math.max(1, Math.ceil(words / 200))
    });
    setAiResult(null);
  };

  const handleDismissAIResult = () => {
    setAiResult(null);
  };

  // Export handlers
  const handleExportMarkdown = () => {
    const content = `# ${currentNote.title || 'Untitled Note'}\n\n${
      currentNote.subtitle ? `*${currentNote.subtitle}*\n\n` : ''
    }${currentNote.content}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentNote.title || 'untitled-note').toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportText = () => {
    const content = `${currentNote.title || 'Untitled Note'}\n${currentNote.subtitle || ''}\n\n${currentNote.content}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentNote.title || 'untitled-note').toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyNote = () => {
    const content = `${currentNote.title || 'Untitled Note'}\n${
      currentNote.subtitle ? `${currentNote.subtitle}\n\n` : '\n'
    }${currentNote.content}`;
    navigator.clipboard.writeText(content).catch(() => {});
  };

  return (
    <div 
      className="flex flex-col h-screen w-screen overflow-hidden select-text"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* Top Header */}
      <Header
        theme={theme}
        onThemeChange={setTheme}
        wordCount={currentNote.wordCount}
        readingTime={currentNote.readingTime}
        isRecording={isRecording}
        onToggleRecord={handleToggleRecord}
        onSelectAIAction={handleSelectAIAction}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportMarkdown={handleExportMarkdown}
        onExportText={handleExportText}
        onCopyNote={handleCopyNote}
        activeVoiceMode={settings.activeVoiceMode}
        onSelectVoiceMode={(mode) => {
          setSettings((prev) => ({ ...prev, activeVoiceMode: mode }));
          localStorage.setItem('scribeflow_voice_mode', mode);
        }}
        hasOpenRouterKey={!!settings.openRouterApiKey}
        hasElevenLabsKey={!!settings.elevenLabsApiKey}
      />

      {/* Main Workspace: Sidebar + Editor/Kanban */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={(id) => {
            setSelectedNoteId(id);
            setAiResult(null);
          }}
          onCreateNote={handleCreateNote}
          onCreateKanban={handleCreateKanban}
          onCreateRoom={handleOpenRoomTemplateDialog}
          onDeleteNote={handleDeleteNote}
          onDuplicateNote={handleDuplicateNote}
          onTogglePin={handleTogglePin}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {currentNote.type === 'room' ? (
          <Rooms
            note={currentNote}
            onUpdateNote={handleUpdateCurrentNote}
            onDeleteNote={notes.length > 1 ? handleDeleteNote : undefined}
            onDuplicateNote={handleDuplicateNote}
          />
        ) : currentNote.type === 'kanban' ? (
          <KanbanBoard
            note={currentNote}
            onUpdateNote={handleUpdateCurrentNote}
            onDeleteNote={notes.length > 1 ? handleDeleteNote : undefined}
            onDuplicateNote={handleDuplicateNote}
          />
        ) : (
          <Editor
            note={currentNote}
            isSidebarCollapsed={isSidebarCollapsed}
            onDeleteNote={notes.length > 1 ? handleDeleteNote : undefined}
            onUpdateNote={handleUpdateCurrentNote}
            isRecording={isRecording}
            onToggleRecord={handleToggleRecord}
            onSelectAIAction={handleSelectAIAction}
            isAIProcessing={isAIProcessing}
            aiResult={aiResult}
            onAcceptAIResult={handleAcceptAIResult}
            onDismissAIResult={handleDismissAIResult}
            activeVoiceMode={settings.activeVoiceMode}
            audioLevel={audioLevel}
            interimTranscript={interimTranscript}
          />
        )}
      </div>

      {/* Settings & BYOK Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
      />

      {isRoomTemplateDialogOpen && (
        <TemplateDialog
          templates={PROJECT_TEMPLATES}
          onApply={(templateKey) => {
            handleCreateRoom(templateKey);
            setIsRoomTemplateDialogOpen(false);
          }}
          onClose={() => setIsRoomTemplateDialogOpen(false)}
        />
      )}

      {/* Floating Autosaved Status Toggle */}
      <div 
        id="autosave-toggle-status"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border shadow-lg backdrop-blur-xs transition-all duration-300 pointer-events-auto cursor-pointer select-none ${
          showAutosavedBadge 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'rgba(16, 185, 129, 0.4)',
          color: 'var(--text-primary)'
        }}
        onClick={triggerAutosaveIndicator}
        title="Saved locally. Click to force save now."
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-editorial-sans tracking-wide text-emerald-600 dark:text-emerald-400">Autosaved</span>
      </div>
    </div>
  );
}
