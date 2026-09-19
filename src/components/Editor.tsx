import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Mic, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Code, 
  Minus, 
  Image as ImageIcon, 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Highlighter,
  Check, 
  Copy, 
  Trash2, 
  Wand2,
  FileText,
  RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Note, AIThoughtResult, AIAction, VoiceMode } from '../types';
import { 
  RichBlock, 
  BlockType, 
  parseMarkdownToBlocks, 
  serializeBlocksToMarkdown, 
  generateBlockId 
} from '../lib/blockUtils';

interface EditorProps {
  note: Note;
  isSidebarCollapsed: boolean;
  onUpdateNote: (updated: Partial<Note>) => void;
  isRecording: boolean;
  onToggleRecord: () => void;
  onSelectAIAction: (action: AIAction, customPrompt?: string) => void;
  isAIProcessing: boolean;
  aiResult: AIThoughtResult | null;
  onAcceptAIResult: (mode: 'replace' | 'append') => void;
  onDismissAIResult: () => void;
  activeVoiceMode: VoiceMode;
  audioLevel?: number;
  interimTranscript: string;
}

interface SlashCommand {
  id: string;
  title: string;
  subtitle: string;
  category: 'format' | 'ai';
  keywords: string[];
  icon: React.ReactNode;
  action: (blockId: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
  note,
  isSidebarCollapsed,
  onUpdateNote,
  isRecording,
  onToggleRecord,
  onSelectAIAction,
  isAIProcessing,
  aiResult,
  onAcceptAIResult,
  onDismissAIResult,
  interimTranscript
}) => {
  // Document Blocks State
  const [blocks, setBlocks] = useState<RichBlock[]>(() => parseMarkdownToBlocks(note.content));
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const noteIdRef = useRef(note.id);
  const isSelfEditingRef = useRef(false);

  // Slash Command State
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashBlockId, setSlashBlockId] = useState<string | null>(null);

  // Selection Floating Toolbar
  const [selectionRange, setSelectionRange] = useState<{
    blockId: string;
    start: number;
    end: number;
    text: string;
  } | null>(null);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);

  // Modals & UI States
  const [showImageModal, setShowImageModal] = useState(false);
  const [targetImageBlockId, setTargetImageBlockId] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');

  const [showCustomPromptModal, setShowCustomPromptModal] = useState(false);
  const [customPromptText, setCustomPromptText] = useState('');
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  // Refs
  const blockRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);

  // Sync external changes (e.g. note switch, AI replacement)
  useEffect(() => {
    if (note.id !== noteIdRef.current || !isSelfEditingRef.current) {
      setBlocks(parseMarkdownToBlocks(note.content));
      noteIdRef.current = note.id;
    }
    isSelfEditingRef.current = false;
  }, [note.id, note.content]);

  // Adjust textarea heights automatically
  useEffect(() => {
    blocks.forEach((b) => {
      const el = blockRefs.current[b.id];
      if (el) {
        el.style.height = 'auto';
        el.style.height = `${Math.max(b.type === 'code' ? 64 : 26, el.scrollHeight)}px`;
      }
    });
  }, [blocks]);

  useEffect(() => {
    const titleElement = titleRef.current;
    if (titleElement) {
      titleElement.style.height = 'auto';
      titleElement.style.height = `${titleElement.scrollHeight}px`;
    }
  }, [note.title]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) {
        setShowSlashMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync blocks back to parent note
  const syncBlocks = (newBlocks: RichBlock[]) => {
    isSelfEditingRef.current = true;
    setBlocks(newBlocks);
    const newMarkdown = serializeBlocksToMarkdown(newBlocks);
    const words = newMarkdown.trim().split(/\s+/).filter(Boolean).length;
    onUpdateNote({
      content: newMarkdown,
      wordCount: words,
      readingTime: Math.max(1, Math.ceil(words / 200)),
      updatedAt: Date.now()
    });
  };

  const focusBlock = (id: string, cursorPosition: 'start' | 'end' = 'end') => {
    setActiveBlockId(id);
    setTimeout(() => {
      const el = blockRefs.current[id];
      if (el) {
        el.focus();
        if (cursorPosition === 'start') {
          el.setSelectionRange(0, 0);
        } else {
          const len = el.value.length;
          el.setSelectionRange(len, len);
        }
      }
    }, 10);
  };

  // Change block type (e.g. from paragraph to heading)
  const setBlockType = (id: string, type: BlockType, extra?: Partial<RichBlock>) => {
    const newBlocks = blocks.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          type,
          ...extra
        };
      }
      return b;
    });
    syncBlocks(newBlocks);
    focusBlock(id, 'end');
  };

  // Insert a new block after the specified one
  const insertBlockAfter = (afterId: string, type: BlockType = 'p', initialContent = '') => {
    const idx = blocks.findIndex((b) => b.id === afterId);
    const newBlock: RichBlock = {
      id: generateBlockId(),
      type,
      content: initialContent
    };
    const nextBlocks = [...blocks];
    nextBlocks.splice(idx + 1, 0, newBlock);
    syncBlocks(nextBlocks);
    focusBlock(newBlock.id, 'start');
  };

  // Delete a block
  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      syncBlocks([{ id: generateBlockId(), type: 'p', content: '' }]);
      return;
    }
    const idx = blocks.findIndex((b) => b.id === id);
    const prevBlock = idx > 0 ? blocks[idx - 1] : blocks[idx + 1];
    const nextBlocks = blocks.filter((b) => b.id !== id);
    syncBlocks(nextBlocks);
    if (prevBlock) {
      focusBlock(prevBlock.id, 'end');
    }
  };

  // Slash Commands Definition
  const slashCommands: SlashCommand[] = useMemo(() => [
    {
      id: 'heading-1',
      title: 'Heading',
      subtitle: 'Large title or section heading',
      category: 'format',
      keywords: ['heading', 'h1', 'title', 'large'],
      icon: <Heading1 className="w-4 h-4 text-indigo-500" />,
      action: (blockId) => {
        setBlockType(blockId, 'h1');
      }
    },
    {
      id: 'heading-2',
      title: 'Subheading',
      subtitle: 'Medium section subtitle',
      category: 'format',
      keywords: ['subheading', 'heading', 'h2', 'medium', 'subtitle'],
      icon: <Heading2 className="w-4 h-4 text-blue-500" />,
      action: (blockId) => {
        setBlockType(blockId, 'h2');
      }
    },
    {
      id: 'heading-3',
      title: 'Small Heading',
      subtitle: 'Small subsection header',
      category: 'format',
      keywords: ['small', 'h3', 'section'],
      icon: <Heading3 className="w-4 h-4 text-sky-500" />,
      action: (blockId) => {
        setBlockType(blockId, 'h3');
      }
    },
    {
      id: 'quote',
      title: 'Quote',
      subtitle: 'Editorial callout blockquote',
      category: 'format',
      keywords: ['quote', 'blockquote', 'cite', 'callout'],
      icon: <Quote className="w-4 h-4 text-amber-500" />,
      action: (blockId) => {
        setBlockType(blockId, 'quote');
      }
    },
    {
      id: 'bullet',
      title: 'Bulleted List',
      subtitle: 'Simple unordered list',
      category: 'format',
      keywords: ['bullet', 'list', 'ul', 'points'],
      icon: <List className="w-4 h-4 text-emerald-500" />,
      action: (blockId) => {
        setBlockType(blockId, 'bullet');
      }
    },
    {
      id: 'number',
      title: 'Numbered List',
      subtitle: 'Ordered step-by-step list',
      category: 'format',
      keywords: ['numbered', 'list', 'ol', 'numbers', 'order'],
      icon: <ListOrdered className="w-4 h-4 text-teal-500" />,
      action: (blockId) => {
        setBlockType(blockId, 'number');
      }
    },
    {
      id: 'todo',
      title: 'Checklist',
      subtitle: 'Track tasks with checkboxes',
      category: 'format',
      keywords: ['todo', 'task', 'checklist', 'checkbox'],
      icon: <CheckSquare className="w-4 h-4 text-purple-500" />,
      action: (blockId) => {
        setBlockType(blockId, 'todo', { checked: false });
      }
    },
    {
      id: 'code',
      title: 'Code Block',
      subtitle: 'Monospaced code snippet',
      category: 'format',
      keywords: ['code', 'snippet', 'syntax', 'ts', 'js', 'py'],
      icon: <Code className="w-4 h-4 text-gray-500" />,
      action: (blockId) => {
        setBlockType(blockId, 'code', { language: 'typescript' });
      }
    },
    {
      id: 'divider',
      title: 'Divider',
      subtitle: 'Subtle section separator',
      category: 'format',
      keywords: ['divider', 'line', 'hr', 'separator'],
      icon: <Minus className="w-4 h-4 text-gray-400" />,
      action: (blockId) => {
        const idx = blocks.findIndex((b) => b.id === blockId);
        const dividerBlock: RichBlock = { id: blockId, type: 'divider', content: '' };
        const nextBlock: RichBlock = { id: generateBlockId(), type: 'p', content: '' };
        const newBlocks = [...blocks];
        newBlocks.splice(idx, 1, dividerBlock, nextBlock);
        syncBlocks(newBlocks);
        focusBlock(nextBlock.id, 'start');
      }
    },
    {
      id: 'image',
      title: 'Image',
      subtitle: 'Embed an image with caption',
      category: 'format',
      keywords: ['image', 'photo', 'picture', 'banner'],
      icon: <ImageIcon className="w-4 h-4 text-pink-500" />,
      action: (blockId) => {
        setTargetImageBlockId(blockId);
        setShowImageModal(true);
      }
    },
    // AI Commands
    {
      id: 'ai-organize',
      title: '✨ AI Organize',
      subtitle: 'Turn thoughts into clean structured prose',
      category: 'ai',
      keywords: ['organize', 'clean', 'ai', 'speech', 'polish'],
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      action: () => {
        onSelectAIAction('organize');
      }
    },
    {
      id: 'ai-summarize',
      title: '📝 AI Summarise',
      subtitle: 'Generate key takeaways and subtitle',
      category: 'ai',
      keywords: ['summarize', 'summary', 'tldr', 'ai'],
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      action: () => {
        onSelectAIAction('summarize');
      }
    },
    {
      id: 'ai-voice',
      title: '🎙️ Voice Dictation',
      subtitle: isRecording ? 'Stop recording voice' : 'Start speaking your thoughts',
      category: 'ai',
      keywords: ['voice', 'record', 'mic', 'dictate', 'speak'],
      icon: <Mic className="w-4 h-4 text-red-500" />,
      action: () => {
        onToggleRecord();
      }
    },
    {
      id: 'ai-custom',
      title: '🪄 Custom Rewrite',
      subtitle: 'Give custom instructions to AI',
      category: 'ai',
      keywords: ['custom', 'prompt', 'instruct', 'rewrite'],
      icon: <Wand2 className="w-4 h-4 text-purple-500" />,
      action: () => {
        setShowCustomPromptModal(true);
      }
    },
    {
      id: 'ai-continue',
      title: '🔄 Continue Writing',
      subtitle: 'Generate next logical paragraphs',
      category: 'ai',
      keywords: ['continue', 'next', 'extend', 'more'],
      icon: <RefreshCw className="w-4 h-4 text-emerald-500" />,
      action: () => {
        onSelectAIAction('continue');
      }
    }
  ], [blocks, isRecording, onSelectAIAction, onToggleRecord]);

  // Filter slash commands by query
  const filteredSlashCommands = useMemo(() => {
    if (!slashQuery) return slashCommands;
    const q = slashQuery.toLowerCase().trim();
    return slashCommands.filter((cmd) => {
      return (
        cmd.title.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.includes(q))
      );
    });
  }, [slashCommands, slashQuery]);

  // Execute selected command
  const executeSlashCommand = (cmd: SlashCommand) => {
    if (!slashBlockId) return;
    // Clean slash token from content
    const currentBlock = blocks.find((b) => b.id === slashBlockId);
    if (currentBlock) {
      const cleaned = currentBlock.content.replace(/(?:^|\s)\/[a-zA-Z0-9_-]*$/, '');
      const newBlocks = blocks.map((b) => (b.id === slashBlockId ? { ...b, content: cleaned } : b));
      syncBlocks(newBlocks);
    }
    setShowSlashMenu(false);
    setSlashQuery('');
    cmd.action(slashBlockId);
  };

  // Handle typing inside any block
  const handleBlockChange = (id: string, val: string) => {
    // 1. Instant Markdown shorthands (like Substack)
    if (val === '# ' || val.startsWith('# ')) {
      setBlockType(id, 'h1', { content: val.startsWith('# ') ? val.slice(2) : '' });
      return;
    }
    if (val === '## ' || val.startsWith('## ')) {
      setBlockType(id, 'h2', { content: val.startsWith('## ') ? val.slice(3) : '' });
      return;
    }
    if (val === '### ' || val.startsWith('### ')) {
      setBlockType(id, 'h3', { content: val.startsWith('### ') ? val.slice(4) : '' });
      return;
    }
    if (val === '> ' || val.startsWith('> ')) {
      setBlockType(id, 'quote', { content: val.startsWith('> ') ? val.slice(2) : '' });
      return;
    }
    if (val === '- ' || val === '* ' || val.startsWith('- ') || val.startsWith('* ')) {
      setBlockType(id, 'bullet', { content: (val.startsWith('- ') || val.startsWith('* ')) ? val.slice(2) : '' });
      return;
    }
    if (/^\d+\.\s/.test(val)) {
      setBlockType(id, 'number', { content: val.replace(/^\d+\.\s/, '') });
      return;
    }
    if (val.startsWith('[] ') || val.startsWith('[ ] ')) {
      setBlockType(id, 'todo', { checked: false, content: val.replace(/^\[\s?\]\s/, '') });
      return;
    }
    if (val === '---' || val === '***') {
      const idx = blocks.findIndex((b) => b.id === id);
      const dividerBlock: RichBlock = { id, type: 'divider', content: '' };
      const nextBlock: RichBlock = { id: generateBlockId(), type: 'p', content: '' };
      const newBlocks = [...blocks];
      newBlocks.splice(idx, 1, dividerBlock, nextBlock);
      syncBlocks(newBlocks);
      focusBlock(nextBlock.id, 'start');
      return;
    }
    if (val.startsWith('```')) {
      const lang = val.slice(3).trim() || 'typescript';
      setBlockType(id, 'code', { content: '', language: lang });
      return;
    }

    // 2. Detect Slash Command trigger
    const textarea = blockRefs.current[id];
    const cursor = textarea?.selectionStart ?? val.length;
    const textBeforeCursor = val.slice(0, cursor);
    const slashMatch = textBeforeCursor.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);

    if (slashMatch) {
      setShowSlashMenu(true);
      setSlashQuery(slashMatch[1]);
      setSlashIndex(0);
      setSlashBlockId(id);
    } else if (showSlashMenu && slashBlockId === id) {
      setShowSlashMenu(false);
      setSlashQuery('');
    }

    // Standard block content update
    const newBlocks = blocks.map((b) => (
      b.id === id ? { ...b, content: val, highlights: undefined } : b
    ));
    syncBlocks(newBlocks);
  };

  // Keyboard navigation & behavior
  const handleKeyDown = (id: string, e: React.KeyboardEvent<HTMLTextAreaElement>, blockType: BlockType) => {
    // If slash menu is active
    if (showSlashMenu && filteredSlashCommands.length > 0 && slashBlockId === id) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashIndex((prev) => (prev + 1) % filteredSlashCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashIndex((prev) => (prev - 1 + filteredSlashCommands.length) % filteredCommandsLength(filteredSlashCommands.length));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const chosen = filteredSlashCommands[slashIndex] || filteredSlashCommands[0];
        if (chosen) {
          executeSlashCommand(chosen);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
        return;
      }
    }

    // Code block tab indent
    if (blockType === 'code') {
      if (e.key === 'Tab') {
        e.preventDefault();
        const el = e.currentTarget;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const val = el.value;
        const newVal = val.substring(0, start) + '  ' + val.substring(end);
        handleBlockChange(id, newVal);
        setTimeout(() => {
          el.selectionStart = el.selectionEnd = start + 2;
        }, 0);
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        return; // Allow newlines within code blocks
      }
    }

    // Enter creates next block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const currentBlock = blocks.find((b) => b.id === id);
      if (!currentBlock) return;

      // In lists, pressing enter on empty item reverts to normal paragraph
      if (['bullet', 'number', 'todo'].includes(blockType)) {
        if (!currentBlock.content.trim()) {
          setBlockType(id, 'p');
          return;
        }
        insertBlockAfter(id, blockType);
        return;
      }

      insertBlockAfter(id, 'p');
      return;
    }

    // Backspace at start reverts block or deletes empty block
    if (e.key === 'Backspace') {
      const el = e.currentTarget;
      const currentBlock = blocks.find((b) => b.id === id);
      if (!currentBlock) return;

      if (el.selectionStart === 0 && el.selectionEnd === 0) {
        if (blockType !== 'p') {
          e.preventDefault();
          setBlockType(id, 'p');
          return;
        }
        if (!currentBlock.content && blocks.length > 1) {
          e.preventDefault();
          deleteBlock(id);
          return;
        }
      }
    }

    // Arrow keys between blocks
    if (e.key === 'ArrowUp') {
      const el = e.currentTarget;
      if (el.selectionStart === 0) {
        const idx = blocks.findIndex((b) => b.id === id);
        if (idx > 0) {
          e.preventDefault();
          focusBlock(blocks[idx - 1].id, 'end');
        }
      }
    }

    if (e.key === 'ArrowDown') {
      const el = e.currentTarget;
      if (el.selectionStart === el.value.length) {
        const idx = blocks.findIndex((b) => b.id === id);
        if (idx < blocks.length - 1) {
          e.preventDefault();
          focusBlock(blocks[idx + 1].id, 'start');
        }
      }
    }
  };

  const filteredCommandsLength = (len: number) => Math.max(1, len);

  // Format selection
  const applySelectionFormat = (prefix: string, suffix = prefix) => {
    if (!selectionRange) return;
    const { blockId, start, end } = selectionRange;
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    const original = block.content;
    const selected = original.slice(start, end);
    const replacement = `${prefix}${selected}${suffix}`;
    const nextContent = original.slice(0, start) + replacement + original.slice(end);

    const nextBlocks = blocks.map((b) => (
      b.id === blockId ? { ...b, content: nextContent, highlights: undefined } : b
    ));
    syncBlocks(nextBlocks);
    setSelectionRange(null);

    setTimeout(() => {
      focusBlock(blockId);
      const el = blockRefs.current[blockId];
      if (el) {
        el.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 10);
  };

  const applyHighlight = (color: 'yellow' | 'green' | 'blue' | 'pink') => {
    if (!selectionRange) return;
    const { blockId, start, end } = selectionRange;
    const block = blocks.find((item) => item.id === blockId);
    if (!block) return;

    const nextBlocks = blocks.map((item) => (
      item.id === blockId
        ? {
            ...item,
            highlights: [...(item.highlights || []), { start, end, color }]
          }
        : item
    ));

    syncBlocks(nextBlocks);
    setSelectionRange(null);
    setShowHighlightMenu(false);
  };

  const renderHighlightedContent = (content: string, highlights: RichBlock['highlights'] = []) => {
    if (!highlights.length) return content;

    const colors = {
      yellow: { backgroundColor: '#fde047', color: '#422006' },
      green: { backgroundColor: '#4ade80', color: '#052e16' },
      blue: { backgroundColor: '#60a5fa', color: '#172554' },
      pink: { backgroundColor: '#f472b6', color: '#500724' }
    };
    const segments: React.ReactNode[] = [];
    let cursor = 0;

    [...highlights]
      .filter((highlight) => highlight.start >= cursor && highlight.end <= content.length)
      .sort((a, b) => a.start - b.start)
      .forEach((highlight, index) => {
        if (highlight.start > cursor) {
          segments.push(content.slice(cursor, highlight.start));
        }
        segments.push(
          <mark
            key={`highlight-${index}`}
            className="rounded-sm px-0.5"
            style={colors[highlight.color]}
          >
            {content.slice(highlight.start, highlight.end)}
          </mark>
        );
        cursor = highlight.end;
      });

    if (cursor < content.length) segments.push(content.slice(cursor));
    return segments;
  };

  // Image insertion
  const handleConfirmInsertImage = () => {
    const url = imageUrlInput.trim() || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200';
    const caption = imageCaptionInput.trim();

    if (targetImageBlockId) {
      const nextBlocks = blocks.map((b) => {
        if (b.id === targetImageBlockId) {
          return {
            ...b,
            type: 'image' as BlockType,
            content: '',
            url,
            caption
          };
        }
        return b;
      });
      syncBlocks(nextBlocks);
      insertBlockAfter(targetImageBlockId, 'p');
    }

    setShowImageModal(false);
    setImageUrlInput('');
    setImageCaptionInput('');
    setTargetImageBlockId(null);
  };

  return (
    <main 
      id="main-editor-canvas"
      className={`flex-1 overflow-y-auto flex flex-col px-6 sm:px-10 md:px-12 lg:px-16 py-10 relative transition-colors select-text ${isSidebarCollapsed ? 'items-center' : 'items-start'}`}
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)'
      }}
    >
      <div className="w-full max-w-5xl flex flex-col relative pb-20">

        {/* AI Result Review Banner (Clean, Minimalist Card) */}
        {aiResult && aiResult.content && (
          <div 
            className="mb-8 p-4 rounded-xl border text-xs space-y-3 animate-in fade-in duration-150 shadow-sm"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--accent-color)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-color)]" />
                <span>AI Polished Draft ({aiResult.modelUsed})</span>
              </div>
              <button
                onClick={onDismissAIResult}
                className="opacity-60 hover:opacity-100 text-xs cursor-pointer"
              >
                ✕ Dismiss
              </button>
            </div>

            <div 
              className="p-3.5 rounded-lg border font-editorial text-sm leading-relaxed max-h-48 overflow-y-auto"
              style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}
            >
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-1 first:mt-0">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 last:mb-0">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 last:mb-0">{children}</ol>,
                  li: ({ children }) => <li className="mb-0.5">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                  mark: ({ children, ...props }) => {
                    const color = (props as { 'data-highlight'?: string })['data-highlight'];
                    const highlightStyle = {
                      yellow: { backgroundColor: '#fde047', color: '#422006' },
                      green: { backgroundColor: '#4ade80', color: '#052e16' },
                      blue: { backgroundColor: '#60a5fa', color: '#172554' },
                      pink: { backgroundColor: '#f472b6', color: '#500724' }
                    }[color || 'yellow'] || { backgroundColor: '#fde047', color: '#422006' };
                    return <mark {...props} className="rounded-sm px-0.5" style={highlightStyle}>{children}</mark>;
                  },
                }}
              >
                {aiResult.content}
              </ReactMarkdown>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => onAcceptAIResult('append')}
                className="px-3 py-1.5 rounded-lg border text-xs hover:opacity-80 transition-opacity cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
              >
                Append to Note
              </button>
              <button
                onClick={() => onAcceptAIResult('replace')}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Replace Content</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Voice Recording Pill */}
        {isRecording && (
          <div 
            className="mb-6 px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs animate-pulse shadow-sm"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="font-medium text-red-500">Listening to your thoughts...</span>
              {interimTranscript && (
                <span className="italic opacity-70 truncate max-w-xs sm:max-w-md">"{interimTranscript}"</span>
              )}
            </div>
            <button
              onClick={onToggleRecord}
              className="px-2.5 py-1 rounded bg-red-500 text-white font-medium text-[11px] hover:bg-red-600 transition-colors cursor-pointer"
            >
              Done Speaking
            </button>
          </div>
        )}

        {/* AI Synthesis Indicator */}
        {isAIProcessing && (
          <div 
            className="mb-6 px-4 py-3 rounded-xl border flex items-center justify-between text-xs animate-pulse shadow-sm"
            style={{
              backgroundColor: 'var(--accent-soft)',
              borderColor: 'var(--accent-color)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 animate-spin text-[var(--accent-color)]" />
              <span>Structuring & organizing your draft...</span>
            </div>
          </div>
        )}

        {/* Substack Style Header: Clean Title */}
        <textarea
          ref={titleRef}
          value={note.title}
          onChange={(e) => onUpdateNote({ title: e.target.value, updatedAt: Date.now() })}
          placeholder="Title"
          rows={1}
          className={`w-full text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-editorial font-bold tracking-tight bg-transparent border-none outline-none resize-none overflow-hidden break-words placeholder:text-[var(--text-secondary)] placeholder:opacity-40 transition-colors mb-2 ${isSidebarCollapsed ? 'text-center' : ''}`}
          style={{ color: 'var(--text-primary)', overflowWrap: 'anywhere' }}
        />

        {/* Substack Style Header: Subtitle */}
        <input
          type="text"
          value={note.subtitle}
          onChange={(e) => onUpdateNote({ subtitle: e.target.value, updatedAt: Date.now() })}
          placeholder="Add a subtitle..."
          className={`w-full text-lg sm:text-xl font-editorial italic bg-transparent border-none outline-none placeholder:text-[var(--text-secondary)] placeholder:opacity-40 transition-colors mb-6 ${isSidebarCollapsed ? 'text-center' : ''}`}
          style={{ color: 'var(--text-secondary)' }}
        />

        {/* Clean subtle horizontal line */}
        <div 
          className="w-12 h-[1px] mb-8 transition-colors"
          style={{ backgroundColor: 'var(--border-highlight)' }}
        />

        {/* Floating Text Selection Bar (Substack Style) */}
        {selectionRange && (
          <div 
            className="sticky top-6 self-center z-40 flex items-center gap-1 px-2.5 py-1.5 rounded-full shadow-lg border backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <button
              onClick={() => applySelectionFormat('**', '**')}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer text-xs font-bold"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applySelectionFormat('*', '*')}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer text-xs italic"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applySelectionFormat('`', '`')}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer text-xs font-mono"
              title="Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applySelectionFormat('[', '](https://)')}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer text-xs"
              title="Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowHighlightMenu((open) => !open)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                title="Highlight selection"
              >
                <Highlighter className="w-3.5 h-3.5" />
              </button>
              {showHighlightMenu && (
                <div
                  className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 flex items-center gap-1 rounded-lg border p-1.5 shadow-lg"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                >
                  {([
                    ['yellow', 'bg-yellow-300'],
                    ['green', 'bg-green-300'],
                    ['blue', 'bg-blue-300'],
                    ['pink', 'bg-pink-300']
                  ] as const).map(([color, swatch]) => (
                    <button
                      key={color}
                      onClick={() => applyHighlight(color)}
                      className={`h-4 w-4 rounded-full ${swatch} ring-1 ring-black/10 hover:scale-110 transition-transform cursor-pointer`}
                      title={`Highlight ${color}`}
                      aria-label={`Highlight ${color}`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="w-[1px] h-3.5 mx-1" style={{ backgroundColor: 'var(--border-color)' }} />
            <button
              onClick={() => setSelectionRange(null)}
              className="p-1 opacity-50 hover:opacity-100 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Substack Document Body */}
        <div className="w-full space-y-0 relative font-editorial text-lg leading-relaxed">
          {blocks.map((block, idx) => {
            return (
              <div 
                key={block.id}
                className="w-full relative group"
              >
                {/* PARAGRAPH */}
                {block.type === 'p' && (
                  <div className="relative w-full">
                    {!!block.highlights?.length && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words font-editorial text-lg sm:text-[1.15rem] leading-relaxed"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {renderHighlightedContent(block.content, block.highlights)}
                      </div>
                    )}
                    <textarea
                      ref={(el) => { blockRefs.current[block.id] = el; }}
                      value={block.content}
                      onChange={(e) => handleBlockChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(block.id, e, 'p')}
                      onFocus={() => setActiveBlockId(block.id)}
                      onSelect={(e) => {
                        const t = e.currentTarget;
                        if (t.selectionStart !== t.selectionEnd) {
                          setSelectionRange({
                            blockId: block.id,
                            start: t.selectionStart,
                            end: t.selectionEnd,
                            text: block.content.slice(t.selectionStart, t.selectionEnd)
                          });
                        }
                      }}
                      placeholder={idx === 0 ? "Tell your story or type / for commands..." : ""}
                      rows={1}
                      className={`relative w-full font-editorial text-lg sm:text-[1.15rem] leading-relaxed bg-transparent border-none outline-none resize-none placeholder:opacity-40 ${block.highlights?.length ? 'text-transparent caret-[var(--text-primary)]' : ''}`}
                      style={{ color: block.highlights?.length ? 'transparent' : 'var(--text-primary)' }}
                    />
                  </div>
                )}

                {/* HEADING 1 */}
                {block.type === 'h1' && (
                  <textarea
                    ref={(el) => { blockRefs.current[block.id] = el; }}
                    value={block.content}
                    onChange={(e) => handleBlockChange(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(block.id, e, 'h1')}
                    onFocus={() => setActiveBlockId(block.id)}
                    placeholder="Heading"
                    rows={1}
                    className="w-full text-2xl sm:text-3xl font-bold font-editorial tracking-tight bg-transparent border-none outline-none resize-none mt-4 mb-1 placeholder:opacity-40"
                    style={{ color: 'var(--text-primary)' }}
                  />
                )}

                {/* HEADING 2 */}
                {block.type === 'h2' && (
                  <textarea
                    ref={(el) => { blockRefs.current[block.id] = el; }}
                    value={block.content}
                    onChange={(e) => handleBlockChange(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(block.id, e, 'h2')}
                    onFocus={() => setActiveBlockId(block.id)}
                    placeholder="Subheading"
                    rows={1}
                    className="w-full text-xl sm:text-2xl font-semibold font-editorial tracking-tight bg-transparent border-none outline-none resize-none mt-3 mb-1 placeholder:opacity-40"
                    style={{ color: 'var(--text-primary)' }}
                  />
                )}

                {/* HEADING 3 */}
                {block.type === 'h3' && (
                  <textarea
                    ref={(el) => { blockRefs.current[block.id] = el; }}
                    value={block.content}
                    onChange={(e) => handleBlockChange(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(block.id, e, 'h3')}
                    onFocus={() => setActiveBlockId(block.id)}
                    placeholder="Section header"
                    rows={1}
                    className="w-full text-lg sm:text-xl font-medium font-editorial bg-transparent border-none outline-none resize-none mt-2 mb-1 placeholder:opacity-40"
                    style={{ color: 'var(--text-primary)' }}
                  />
                )}

                {/* QUOTE */}
                {block.type === 'quote' && (
                  <div 
                    className="w-full pl-5 py-1.5 my-2 border-l-3 transition-colors"
                    style={{ borderColor: 'var(--accent-color)' }}
                  >
                    <textarea
                      ref={(el) => { blockRefs.current[block.id] = el; }}
                      value={block.content}
                      onChange={(e) => handleBlockChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(block.id, e, 'quote')}
                      onFocus={() => setActiveBlockId(block.id)}
                      placeholder="Pull quote..."
                      rows={1}
                      className="w-full text-lg sm:text-xl italic font-editorial leading-relaxed bg-transparent border-none outline-none resize-none placeholder:opacity-40"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                )}

                {/* BULLETED LIST */}
                {block.type === 'bullet' && (
                  <div className="flex items-start gap-3 pl-2">
                    <span className="text-base select-none mt-0.5 opacity-50">•</span>
                    <textarea
                      ref={(el) => { blockRefs.current[block.id] = el; }}
                      value={block.content}
                      onChange={(e) => handleBlockChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(block.id, e, 'bullet')}
                      onFocus={() => setActiveBlockId(block.id)}
                      placeholder="List item"
                      rows={1}
                      className="flex-1 font-editorial text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder:opacity-40"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                )}

                {/* NUMBERED LIST */}
                {block.type === 'number' && (
                  <div className="flex items-start gap-3 pl-2">
                    <span className="text-base select-none font-mono opacity-50 mt-0.5 min-w-5">
                      {idx + 1}.
                    </span>
                    <textarea
                      ref={(el) => { blockRefs.current[block.id] = el; }}
                      value={block.content}
                      onChange={(e) => handleBlockChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(block.id, e, 'number')}
                      onFocus={() => setActiveBlockId(block.id)}
                      placeholder="Numbered item"
                      rows={1}
                      className="flex-1 font-editorial text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder:opacity-40"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                )}

                {/* CHECKLIST */}
                {block.type === 'todo' && (
                  <div className="flex items-start gap-3 pl-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nextBlocks = blocks.map((b) => (b.id === block.id ? { ...b, checked: !b.checked } : b));
                        syncBlocks(nextBlocks);
                      }}
                      className={`w-4 h-4 rounded mt-1.5 flex items-center justify-center border transition-all cursor-pointer ${
                        block.checked ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'border-gray-400 dark:border-gray-600'
                      }`}
                    >
                      {block.checked && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <textarea
                      ref={(el) => { blockRefs.current[block.id] = el; }}
                      value={block.content}
                      onChange={(e) => handleBlockChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(block.id, e, 'todo')}
                      onFocus={() => setActiveBlockId(block.id)}
                      placeholder="To-do task"
                      rows={1}
                      className={`flex-1 font-editorial text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder:opacity-40 ${
                        block.checked ? 'line-through opacity-50' : ''
                      }`}
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                )}

                {/* CODE BLOCK */}
                {block.type === 'code' && (
                  <div 
                    className="w-full my-3 rounded-xl border overflow-hidden text-xs font-mono"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <div 
                      className="flex items-center justify-between px-3.5 py-1.5 border-b opacity-80"
                      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card-hover)' }}
                    >
                      <span className="text-[11px] uppercase tracking-wider">{block.language || 'code'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(block.content);
                          setCopiedBlockId(block.id);
                          setTimeout(() => setCopiedBlockId(null), 2000);
                        }}
                        className="flex items-center gap-1 hover:opacity-100 opacity-60 cursor-pointer text-[11px]"
                      >
                        {copiedBlockId === block.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedBlockId === block.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <textarea
                      ref={(el) => { blockRefs.current[block.id] = el; }}
                      value={block.content}
                      onChange={(e) => handleBlockChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(block.id, e, 'code')}
                      onFocus={() => setActiveBlockId(block.id)}
                      placeholder="// Type code here..."
                      rows={2}
                      className="w-full p-3 bg-transparent border-none outline-none resize-none font-mono text-[13px] leading-relaxed"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                )}

                {/* DIVIDER */}
                {block.type === 'divider' && (
                  <div className="py-5 flex items-center justify-center select-none group/div">
                    <div className="w-24 h-[1px] transition-all" style={{ backgroundColor: 'var(--border-highlight)' }} />
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="opacity-0 group-hover/div:opacity-70 hover:opacity-100 ml-2 p-1 text-xs cursor-pointer"
                      title="Remove divider"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* IMAGE BANNER */}
                {block.type === 'image' && (
                  <div className="w-full my-4 rounded-xl overflow-hidden border group/img" style={{ borderColor: 'var(--border-color)' }}>
                    <img 
                      src={block.url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200'} 
                      alt={block.caption || 'Image'} 
                      className="w-full max-h-96 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {block.caption && (
                      <div className="p-2 text-center text-xs opacity-60 italic" style={{ backgroundColor: 'var(--bg-card)' }}>
                        {block.caption}
                      </div>
                    )}
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer text-xs"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Clean Substack-Style Slash Popup directly under the triggering block */}
                {showSlashMenu && slashBlockId === block.id && (
                  <div 
                    ref={slashMenuRef}
                    className="absolute left-0 top-full mt-1.5 w-56 max-h-64 overflow-y-auto rounded-xl shadow-2xl border p-1 z-50 animate-in fade-in duration-100 text-xs"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider opacity-45">
                      Commands
                    </div>
                    {filteredSlashCommands.length === 0 ? (
                      <div className="px-3 py-2 text-xs opacity-50">No command matching "{slashQuery}"</div>
                    ) : (
                      filteredSlashCommands.map((cmd, cIdx) => (
                        <button
                          key={cmd.id}
                          type="button"
                          onClick={() => executeSlashCommand(cmd)}
                          onMouseEnter={() => setSlashIndex(cIdx)}
                          className={`w-full text-left px-2.5 py-1.5 flex items-center gap-2 transition-colors cursor-pointer rounded-lg ${
                            slashIndex === cIdx ? 'bg-black/5 dark:bg-white/5' : ''
                          }`}
                        >
                          <div className="p-1 rounded bg-black/5 dark:bg-white/5 shrink-0">
                            {cmd.icon}
                          </div>
                          <span className="font-medium text-xs truncate flex-1">{cmd.title}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple Image URL Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div 
            className="w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <h3 className="text-base font-semibold">Embed Image</h3>
            <div className="space-y-2">
              <label className="text-xs opacity-70">Image URL</label>
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-lg border text-xs bg-transparent outline-none"
                style={{ borderColor: 'var(--border-color)' }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs opacity-70">Caption (optional)</label>
              <input
                type="text"
                value={imageCaptionInput}
                onChange={(e) => setImageCaptionInput(e.target.value)}
                placeholder="Photo description"
                className="w-full px-3 py-2 rounded-lg border text-xs bg-transparent outline-none"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setTargetImageBlockId(null);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border opacity-80 hover:opacity-100 cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmInsertImage}
                className="px-4 py-1.5 text-xs rounded-lg font-medium text-white bg-[var(--accent-color)] hover:opacity-90 cursor-pointer"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom AI Prompt Modal */}
      {showCustomPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div 
            className="w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-purple-500" />
              <span>Custom AI Rewrite</span>
            </h3>
            <p className="text-xs opacity-70">
              Give specific instructions (e.g. "Rewrite in an executive newsletter tone", "Turn into bulleted action items", "Make it poetic").
            </p>
            <textarea
              value={customPromptText}
              onChange={(e) => setCustomPromptText(e.target.value)}
              placeholder="How would you like AI to transform this note?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border text-xs bg-transparent outline-none resize-none"
              style={{ borderColor: 'var(--border-color)' }}
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCustomPromptModal(false);
                  setCustomPromptText('');
                }}
                className="px-3 py-1.5 text-xs rounded-lg border opacity-80 hover:opacity-100 cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customPromptText.trim()) {
                    onSelectAIAction('custom', customPromptText.trim());
                  }
                  setShowCustomPromptModal(false);
                  setCustomPromptText('');
                }}
                className="px-4 py-1.5 text-xs rounded-lg font-medium text-white bg-[var(--accent-color)] hover:opacity-90 cursor-pointer"
              >
                Run AI
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
