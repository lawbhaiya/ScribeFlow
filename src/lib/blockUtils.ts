export type BlockType = 
  | 'p' 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'quote' 
  | 'code' 
  | 'divider' 
  | 'todo' 
  | 'bullet' 
  | 'number' 
  | 'image';

export interface RichBlock {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  language?: string;
  url?: string;
  caption?: string;
  highlights?: TextHighlight[];
}

export interface TextHighlight {
  start: number;
  end: number;
  color: 'yellow' | 'green' | 'blue' | 'pink';
}

export const generateBlockId = (): string => {
  return 'b_' + Math.random().toString(36).substring(2, 9);
};

const parseInlineHighlights = (text: string): { content: string; highlights: TextHighlight[] } => {
  const highlights: TextHighlight[] = [];
  const markPattern = /<mark\s+data-highlight="(yellow|green|blue|pink)">([\s\S]*?)<\/mark>/g;
  let content = '';
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = markPattern.exec(text)) !== null) {
    content += text.slice(cursor, match.index);
    const start = content.length;
    content += match[2];
    highlights.push({ start, end: content.length, color: match[1] as TextHighlight['color'] });
    cursor = match.index + match[0].length;
  }

  content += text.slice(cursor);
  return { content, highlights };
};

const serializeInlineHighlights = (content: string, highlights: TextHighlight[] = []): string => {
  return [...highlights]
    .filter((highlight) => highlight.start >= 0 && highlight.end > highlight.start && highlight.end <= content.length)
    .sort((a, b) => b.start - a.start)
    .reduce(
      (result, highlight) => `${result.slice(0, highlight.start)}<mark data-highlight="${highlight.color}">${result.slice(highlight.start, highlight.end)}</mark>${result.slice(highlight.end)}`,
      content
    );
};

/**
 * Parses markdown text into rich blocks
 */
export const parseMarkdownToBlocks = (markdown: string): RichBlock[] => {
  if (!markdown || !markdown.trim()) {
    return [{ id: generateBlockId(), type: 'p', content: '' }];
  }

  const lines = markdown.split('\n');
  const blocks: RichBlock[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = 'typescript';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for code block boundary
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Closing code block
        blocks.push({
          id: generateBlockId(),
          type: 'code',
          content: codeBuffer.join('\n'),
          language: codeLanguage || 'typescript'
        });
        codeBuffer = [];
        inCodeBlock = false;
        continue;
      } else {
        // Opening code block
        inCodeBlock = true;
        codeLanguage = trimmed.slice(3).trim() || 'typescript';
        codeBuffer = [];
        continue;
      }
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Image: ![alt](url)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      blocks.push({
        id: generateBlockId(),
        type: 'image',
        content: '',
        caption: imgMatch[1] || '',
        url: imgMatch[2] || ''
      });
      continue;
    }

    // Horizontal Rule / Divider
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push({
        id: generateBlockId(),
        type: 'divider',
        content: ''
      });
      continue;
    }

    // Heading 1
    if (line.startsWith('# ')) {
      blocks.push({
        id: generateBlockId(),
        type: 'h1',
        content: line.slice(2).trim()
      });
      continue;
    }

    // Heading 2
    if (line.startsWith('## ')) {
      blocks.push({
        id: generateBlockId(),
        type: 'h2',
        content: line.slice(3).trim()
      });
      continue;
    }

    // Heading 3
    if (line.startsWith('### ')) {
      blocks.push({
        id: generateBlockId(),
        type: 'h3',
        content: line.slice(4).trim()
      });
      continue;
    }

    // Blockquote
    if (line.startsWith('> ') || line === '>') {
      blocks.push({
        id: generateBlockId(),
        type: 'quote',
        content: line.startsWith('> ') ? line.slice(2) : ''
      });
      continue;
    }

    // Todo / Checkbox: - [ ] or - [x]
    const todoMatch = line.match(/^[-*]\s*\[([ xX])\]\s*(.*)$/);
    if (todoMatch) {
      blocks.push({
        id: generateBlockId(),
        type: 'todo',
        checked: todoMatch[1].toLowerCase() === 'x',
        content: todoMatch[2] || ''
      });
      continue;
    }

    // Bullet list: - or *
    if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        id: generateBlockId(),
        type: 'bullet',
        content: line.slice(2)
      });
      continue;
    }

    // Numbered list: 1. or 2.
    const numMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numMatch) {
      blocks.push({
        id: generateBlockId(),
        type: 'number',
        content: numMatch[1]
      });
      continue;
    }

    // Blank line
    if (!trimmed) {
      continue;
    }

    // Standard paragraph
    const inlineContent = parseInlineHighlights(line);
    blocks.push({
      id: generateBlockId(),
      type: 'p',
      content: inlineContent.content,
      highlights: inlineContent.highlights
    });
  }

  // If code block was not closed
  if (inCodeBlock) {
    blocks.push({
      id: generateBlockId(),
      type: 'code',
      content: codeBuffer.join('\n'),
      language: codeLanguage || 'typescript'
    });
  }

  // Ensure at least one block
  if (blocks.length === 0) {
    blocks.push({ id: generateBlockId(), type: 'p', content: '' });
  }

  return blocks;
};

/**
 * Serializes rich blocks back to clean Markdown
 */
export const serializeBlocksToMarkdown = (blocks: RichBlock[]): string => {
  const chunks: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    switch (b.type) {
      case 'h1':
        chunks.push(`# ${b.content}`);
        break;
      case 'h2':
        chunks.push(`## ${b.content}`);
        break;
      case 'h3':
        chunks.push(`### ${b.content}`);
        break;
      case 'quote':
        chunks.push(`> ${b.content}`);
        break;
      case 'code':
        chunks.push(`\`\`\`${b.language || 'typescript'}\n${b.content}\n\`\`\``);
        break;
      case 'divider':
        chunks.push(`---`);
        break;
      case 'todo':
        chunks.push(`- [${b.checked ? 'x' : ' '}] ${b.content}`);
        break;
      case 'bullet':
        chunks.push(`- ${b.content}`);
        break;
      case 'number':
        chunks.push(`1. ${b.content}`);
        break;
      case 'image':
        chunks.push(`![${b.caption || 'image'}](${b.url || ''})`);
        break;
      case 'p':
      default:
        chunks.push(serializeInlineHighlights(b.content, b.highlights));
        break;
    }
  }

  return chunks.join('\n');
};
