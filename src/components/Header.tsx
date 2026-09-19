import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  ExternalLink, 
  Download, 
  Maximize2, 
  Minimize2, 
  SlidersHorizontal, 
  ChevronDown,
  FileText,
  FileDown,
  Check,
  Share2,
  Copy,
  Feather
} from 'lucide-react';
import { Theme, AIAction, VoiceMode } from '../types';

interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  wordCount: number;
  readingTime: number;
  isRecording: boolean;
  onToggleRecord: () => void;
  onSelectAIAction: (action: AIAction, customPrompt?: string) => void;
  onOpenSettings: () => void;
  onExportMarkdown: () => void;
  onExportText: () => void;
  onCopyNote: () => void;
  activeVoiceMode: VoiceMode;
  onSelectVoiceMode: (mode: VoiceMode) => void;
  hasOpenRouterKey: boolean;
  hasElevenLabsKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeChange,
  wordCount,
  readingTime,
  isRecording,
  onToggleRecord,
  onSelectAIAction,
  onOpenSettings,
  onExportMarkdown,
  onExportText,
  onCopyNote,
  activeVoiceMode,
  onSelectVoiceMode,
  hasOpenRouterKey,
  hasElevenLabsKey
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showOrganizeMenu, setShowOrganizeMenu] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [promptAction, setPromptAction] = useState<'rewrite' | 'continue' | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const themeMenuRef = useRef<HTMLDivElement>(null);
  const organizeMenuRef = useRef<HTMLDivElement>(null);
  const voiceMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
      if (organizeMenuRef.current && !organizeMenuRef.current.contains(e.target as Node)) {
        setShowOrganizeMenu(false);
      }
      if (voiceMenuRef.current && !voiceMenuRef.current.contains(e.target as Node)) {
        setShowVoiceMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleCopy = () => {
    onCopyNote();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openPromptDialog = (action: 'rewrite' | 'continue') => {
    setPromptAction(action);
    setCustomPrompt('');
    setShowOrganizeMenu(false);
  };

  const submitPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = customPrompt.trim();
    if (!promptAction || !prompt) return;
    onSelectAIAction(promptAction, prompt);
    setPromptAction(null);
    setCustomPrompt('');
  };

  const getThemeLabel = (t: Theme) => {
    switch (t) {
      case 'mocha': return '🐱 Mocha';
      case 'light': return '☀️ Light';
      case 'warm': return '☕ Warm';
      case 'dark': return '🌙 Dark';
    }
  };

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 select-none shrink-0 transition-colors"
      style={{
        backgroundColor: 'var(--bg-main)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-xs"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-color)' }}
        >
          <Feather className="w-4 h-4" />
        </div>
        <span className="font-semibold tracking-tight text-base font-editorial-sans">
          ScribeFlow
        </span>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Organize Button & Dropdown */}
        <div className="relative" ref={organizeMenuRef}>
          <button
            id="btn-organize"
            onClick={() => setShowOrganizeMenu(!showOrganizeMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:opacity-90 active:scale-98 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span>Organize</span>
            <ChevronDown className="w-3 h-3 text-muted" />
          </button>

          {showOrganizeMenu && (
            <div 
              className="absolute right-0 mt-1.5 w-60 rounded-xl shadow-xl border py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              <div className="px-3 py-1.5 border-b text-[10px] font-semibold uppercase tracking-wider text-muted flex justify-between items-center"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span>AI Organization</span>
                {hasOpenRouterKey && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-color)' }}>
                    BYOK
                  </span>
                )}
              </div>
              
              <button
                onClick={() => { onSelectAIAction('organize'); setShowOrganizeMenu(false); }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-medium">Organize & Flow</div>
                  <div className="text-[11px] opacity-70">Smooth rambling speech into elegant paragraphs</div>
                </div>
              </button>

              <button
                onClick={() => { onSelectAIAction('structure'); setShowOrganizeMenu(false); }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <div>
                  <div className="font-medium">Structure into Sections</div>
                  <div className="text-[11px] opacity-70">Add headings, key bullets & takeaways</div>
                </div>
              </button>

              <button
                onClick={() => { onSelectAIAction('summarize'); setShowOrganizeMenu(false); }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-medium">Summarise & Subtitle</div>
                  <div className="text-[11px] opacity-70">Extract executive summary & subtitle</div>
                </div>
              </button>

              <button
                onClick={() => openPromptDialog('rewrite')}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="text-xs">✍️</span>
                <div>
                  <div className="font-medium">Rewrite (How You Want)</div>
                  <div className="text-[11px] opacity-70">Substack style or custom instructions</div>
                </div>
              </button>

              <button
                onClick={() => openPromptDialog('continue')}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="text-xs">⚡</span>
                <div>
                  <div className="font-medium">Continue Writing</div>
                  <div className="text-[11px] opacity-70">Expand seamlessly from current sentence</div>
                </div>
              </button>

              <button
                onClick={() => { onSelectAIAction('grammar'); setShowOrganizeMenu(false); }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <div>
                  <div className="font-medium">Polish Grammar & Syntax</div>
                  <div className="text-[11px] opacity-70">Preserve original tone and pacing</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Record Voice Button with Integrated Dropdown Inside */}
        <div className="relative" ref={voiceMenuRef}>
          <button
            id="btn-record-voice"
            onClick={(e) => {
              // If user clicked the chevron icon or its container, toggle the voice dropdown
              const target = e.target as HTMLElement;
              if (target.closest('.voice-dropdown-chevron')) {
                e.stopPropagation();
                setShowVoiceMenu((prev) => !prev);
              } else {
                onToggleRecord();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer shadow-xs ${
              isRecording 
                ? 'border-red-500/80 bg-red-500/15 text-red-500 animate-pulse' 
                : 'hover:opacity-90 active:scale-98'
            }`}
            style={{
              backgroundColor: isRecording ? 'var(--mic-soft)' : 'var(--bg-card)',
              borderColor: isRecording ? 'var(--mic-color)' : 'var(--border-color)',
              color: isRecording ? 'var(--mic-color)' : 'var(--text-primary)'
            }}
            title={isRecording ? 'Click to stop recording' : 'Click to start voice recording'}
          >
            {isRecording ? (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                <MicOff className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="font-semibold">Recording...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Record Voice</span>
              </div>
            )}

            {/* Subtle Divider inside button */}
            <span 
              className="w-[1px] h-3.5 mx-0.5 opacity-25 shrink-0"
              style={{ backgroundColor: isRecording ? 'var(--mic-color)' : 'var(--border-color)' }} 
            />

            {/* Dropdown Chevron inside Record Button */}
            <span
              className="voice-dropdown-chevron p-0.5 -mr-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer"
              title="Voice Engine Options"
              onClick={(e) => {
                e.stopPropagation();
                setShowVoiceMenu((prev) => !prev);
              }}
            >
              <ChevronDown 
                className={`w-3 h-3 transition-transform duration-150 ${showVoiceMenu ? 'rotate-180' : ''}`} 
                style={{ opacity: 0.7 }}
              />
            </span>
          </button>

          {showVoiceMenu && (
            <div 
              className="absolute right-0 top-full mt-1.5 w-64 rounded-xl shadow-xl border py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              <div className="px-3 py-1.5 border-b text-[10px] font-semibold uppercase tracking-wider text-muted flex justify-between items-center"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span>Voice Typing Engine</span>
              </div>

              <button
                onClick={() => { onSelectVoiceMode('native_win_h'); setShowVoiceMenu(false); }}
                className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-medium flex items-center gap-1.5">
                    <span>🪟 Windows Voice (Win+H)</span>
                    <span className="text-[10px] px-1 rounded bg-blue-500/20 text-blue-400 font-mono">Native</span>
                  </div>
                  <div className="text-[11px] opacity-70">Focuses editor & enables instant OS dictation</div>
                </div>
                {activeVoiceMode === 'native_win_h' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                onClick={() => { onSelectVoiceMode('elevenlabs_scribe'); setShowVoiceMenu(false); }}
                className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-medium flex items-center gap-1.5">
                    <span>🎙️ ElevenLabs Scribe</span>
                    <span className="text-[10px] px-1 rounded bg-purple-500/20 text-purple-400 font-mono">
                      {hasElevenLabsKey ? 'BYOK' : 'Key Needed'}
                    </span>
                  </div>
                  <div className="text-[11px] opacity-70">Studio-grade transcription & speech intelligence</div>
                </div>
                {activeVoiceMode === 'elevenlabs_scribe' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Theme Selector Dropdown */}
        <div className="relative" ref={themeMenuRef}>
          <button
            id="btn-theme-select"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all hover:opacity-90 active:scale-98 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <span>{getThemeLabel(theme)}</span>
            <ChevronDown className="w-3 h-3 text-muted" />
          </button>

          {showThemeMenu && (
            <div 
              className="absolute right-0 mt-1.5 w-36 rounded-xl shadow-xl border py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              {(['mocha', 'light', 'warm', 'dark'] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { onThemeChange(t); setShowThemeMenu(false); }}
                  className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer capitalize"
                >
                  <span>{getThemeLabel(t)}</span>
                  {theme === t && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Word Count & Reading Time */}
        <div className="text-xs px-2 opacity-70 whitespace-nowrap hidden sm:inline-block">
          {wordCount} words · {readingTime}m read
        </div>

        {/* Share / Copy Markdown */}
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg border transition-all hover:opacity-80 active:scale-95 cursor-pointer relative"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
          title={copied ? 'Copied to clipboard!' : 'Copy formatted text'}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>

        {/* Download Menu */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-1.5 rounded-lg border transition-all hover:opacity-80 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
            title="Export / Download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {showExportMenu && (
            <div 
              className="absolute right-0 mt-1.5 w-44 rounded-xl shadow-xl border py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              <button
                onClick={() => { onExportMarkdown(); setShowExportMenu(false); }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Markdown (.md)</span>
              </button>
              <button
                onClick={() => { onExportText(); setShowExportMenu(false); }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Plain Text (.txt)</span>
              </button>
            </div>
          )}
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg border transition-all hover:opacity-80 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Settings (BYOK, Models, Thought Process) */}
        <button
          id="btn-settings"
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg border transition-all hover:opacity-80 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
          title="Configure BYOK Keys & Thought Process"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
      {promptAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPromptAction(null);
          }}
        >
          <form
            onSubmit={submitPrompt}
            className="w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <div>
              <h2 className="text-base font-semibold">
                {promptAction === 'rewrite' ? 'Rewrite your draft' : 'Continue writing'}
              </h2>
              <p className="mt-1 text-xs opacity-65">
                {promptAction === 'rewrite'
                  ? 'Tell the AI how you want the current draft rewritten.'
                  : 'Describe the direction the next paragraphs should take.'}
              </p>
            </div>

            <textarea
              autoFocus
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setPromptAction(null);
              }}
              placeholder={promptAction === 'rewrite'
                ? 'Make it sharper, warmer, and more conversational...'
                : 'Develop the argument with a practical example...'}
              rows={4}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none"
              style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPromptAction(null)}
                className="rounded-lg border px-3.5 py-2 text-xs hover:opacity-80 cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!customPrompt.trim()}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                {promptAction === 'rewrite' ? 'Rewrite' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};
