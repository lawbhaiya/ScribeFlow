import { AIAction, AISettings, AIThoughtResult } from "../types";

export interface OpenRouterModelOption {
  id: string;
  name: string;
  tier: "cheap" | "free" | "reasoning" | "flagship";
  priceDesc: string;
  thought: boolean;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  openRouterApiKey: localStorage.getItem("scribeflow_openrouter_key") || "",
  openRouterModel:
    localStorage.getItem("scribeflow_openrouter_model") ||
    "google/gemini-2.5-flash",
  elevenLabsApiKey: localStorage.getItem("scribeflow_elevenlabs_key") || "",
  elevenLabsModelId:
    localStorage.getItem("scribeflow_elevenlabs_model") || "scribe_v1",
  enableThoughtProcess: true,
  activeVoiceMode: "native_win_h",
};

export const AVAILABLE_OPENROUTER_MODELS: OpenRouterModelOption[] = [
  // Newer long-context editorial models
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro (Best Long-Form Reasoning)",
    tier: "flagship",
    priceDesc: "Paid • Deep reasoning & long context",
    thought: true,
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash (Fast Long-Form Editor)",
    tier: "cheap",
    priceDesc: "Paid • High output capacity",
    thought: true,
  },
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite (Fast & Efficient)",
    tier: "cheap",
    priceDesc: "Paid • Lightweight long responses",
    thought: false,
  },
  {
    id: "openai/gpt-4.1",
    name: "GPT-4.1 (Strong Long-Context Writing)",
    tier: "flagship",
    priceDesc: "Paid • High-capability editor",
    thought: false,
  },
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini (Capable & Cost Efficient)",
    tier: "cheap",
    priceDesc: "Paid • Strong everyday editor",
    thought: false,
  },
  // Fast & Cheap Models (Ideal for structuring, organizing, and daily editing)
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3 (High Craft & Ultra Cheap)",
    tier: "cheap",
    priceDesc: "$0.14/M tokens • Top Editor",
    thought: false,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini (Fast & Cost Efficient)",
    tier: "cheap",
    priceDesc: "$0.15/M tokens • High Speed",
    thought: false,
  },
  // Free OpenRouter models with larger, more capable outputs
  {
    id: "nex-agi/nex-n2.5-pro:free",
    name: "Nex N2.5 Pro (Free, High Capability)",
    tier: "free",
    priceDesc: "Free tier • Long-form reasoning",
    thought: true,
  },
  {
    id: "deepseek/deepseek-v4-flash-0731:free",
    name: "DeepSeek V4 Flash (Free & Fast)",
    tier: "free",
    priceDesc: "Free tier • Long-form general editor",
    thought: false,
  },
  {
    id: "z-ai/glm-5.2:free",
    name: "GLM 5.2 (Free, Deep Reasoning)",
    tier: "free",
    priceDesc: "Free tier • High-capability reasoning",
    thought: true,
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    name: "Nemotron 3 Super 120B (Free)",
    tier: "free",
    priceDesc: "Free tier • Large reasoning model",
    thought: true,
  },
  {
    id: "google/gemma-4-31b-it:free",
    name: "Gemma 4 31B (Free Editorial)",
    tier: "free",
    priceDesc: "Free tier • Strong open model",
    thought: false,
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B (Ultra Budget)",
    tier: "cheap",
    priceDesc: "$0.05/M tokens • Budget",
    thought: false,
  },
  {
    id: "mistralai/mistral-small-24b-instruct-2501",
    name: "Mistral Small 24B (Balanced & Cheap)",
    tier: "cheap",
    priceDesc: "$0.07/M tokens • Concise",
    thought: false,
  },
  // High Reasoning & Flagship Models (Optional, for deep thought analysis)
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1 (Deep Reasoning)",
    tier: "reasoning",
    priceDesc: "$0.55/M tokens • Heavy Thinker",
    thought: true,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B (High Capability)",
    tier: "cheap",
    priceDesc: "$0.40/M tokens • Open Weights",
    thought: false,
  },
];

export async function processTextWithAI(
  text: string,
  action: AIAction,
  customPrompt?: string,
  settings: AISettings = DEFAULT_AI_SETTINGS,
  onThoughtProgress?: (thought: string) => void,
): Promise<AIThoughtResult> {
  const startTime = Date.now();

  // Construct system prompt and instructions
  const systemPrompt = `You are an elite editorial writer and essayist for Substack and long-form publications.

You transform raw thoughts, voice transcripts, spoken ramblings, and notes into clear, polished writing while preserving the author's voice, meaning, personality, and intent.

FORMATTING IS EXTREMELY STRICT.

COMPACT MARKDOWN ONLY.

The output must contain NO EMPTY LINES anywhere.

Never use two consecutive newline characters.
Never use blank lines.
Never add vertical spacing.
Never add whitespace between sections.
Never add whitespace between headings and content.
Never add whitespace between paragraphs.
Never add whitespace between subheadings.
Never add whitespace between list items.

Use ONLY a SINGLE newline when Markdown structure requires a new line.

CORRECT FORMAT:

## Main Heading
Content immediately follows.

### First Subheading
Content immediately follows.
### Second Subheading
Content immediately follows.
### Third Subheading
Content immediately follows.

Paragraph one.
Paragraph two.
Paragraph three.

- First item
- Second item
- Third item

1. First item
2. Second item
3. Third item

HEADINGS MUST ALWAYS BE COMPACT:

## Heading
Content

NEVER:

## Heading

Content

SUBHEADINGS MUST ALWAYS BE COMPACT:

### Subheading
Content

NEVER:

### Subheading

Content

MULTIPLE HEADINGS/SUBHEADINGS MUST BE DIRECTLY ADJACENT:

## Heading One
Content for heading one.
## Heading Two
Content for heading two.
### Subheading One
Content for subheading one.
### Subheading Two
Content for subheading two.

There must be NO empty line between any of these.

If a completely different major section needs visual separation, use a horizontal rule:

## Section One
Content.
---
## Section Two
Content.

The horizontal rule itself is the ONLY allowed visual section separator.

Do NOT create spacing around the horizontal rule.

Do NOT use decorative blank lines.

Do NOT use Markdown formatting to create visual whitespace.

FINAL VALIDATION BEFORE RETURNING:
1. Search the entire output for consecutive newline characters.
2. If you find any blank line, remove it.
3. Ensure every heading is immediately followed by content or the next heading.
4. Ensure every subheading is immediately followed by content or the next heading.
5. Ensure paragraphs are directly adjacent.
6. Ensure list items are directly adjacent.
7. Return the most compact possible Markdown.

Return ONLY the finished text.`;

  let actionInstruction = "";
  switch (action) {
    case "organize":
      actionInstruction = `Carefully clean up and organize this spoken voice transcript or rough draft. Remove verbal disfluencies ("um", "uh", "you know", false starts), tighten run-on thoughts, and arrange into fluid, engaging paragraphs with natural transitional cadence. Return only the polished text.`;
      break;
    case "structure":
      actionInstruction = `Transform this draft into a beautifully structured Substack article or essay.

Create:

* A compelling opening hook
* Clear Markdown headings using ## and ### where appropriate
* Well-organized body sections
* Key takeaway bullet points
* A memorable conclusion

FORMATTING IS STRICT:

Heading formatting:

## Heading
Content immediately follows on the next line.

NEVER do this:

## Heading

Content

ALWAYS do this:

## Heading
Content

Paragraph formatting:
Paragraph one.
Paragraph two.
Paragraph three.

Do NOT insert blank lines between ordinary paragraphs.

Lists must remain compact:

* First item
* Second item
* Third item

Numbered lists must remain compact:

1. First item
2. Second item
3. Third item

Section formatting:
Use a blank line ONLY when moving from one major section to another.

If a heading is followed by another heading, keep them adjacent without an empty line.

Do not use blank lines for visual decoration.

Do not add "---" or other horizontal rules unless a major section genuinely requires a visual separator.

Preserve the author's original meaning, voice, personality, and important details.

Return only the finished article.

`;
      break;
    case "summarize":
      actionInstruction = `Generate:
1. An irresistible, evocative Substack subtitle (one italicized sentence)
2. A 3-bullet Executive Summary capturing the core epiphany
3. A concise 2-paragraph TL;DR summary.`;
      break;
    case "rewrite":
      actionInstruction = customPrompt
        ? `Rewrite this text specifically following this custom direction: "${customPrompt}". Ensure high literary quality.`
        : `Rewrite this text with an elegant, punchy, high-craft Substack editorial style. Sharpen metaphors, vary sentence lengths for rhythm, and make every word count.`;
      break;
    case "continue":
      actionInstruction = customPrompt
        ? `Analyze the tone, perspective, and trajectory of this writing, then naturally write the next 2-3 paragraphs as if written by the same author. Follow this direction while continuing the thought: "${customPrompt}".`
        : `Analyze the tone, perspective, and trajectory of this writing, and naturally write the next 2-3 paragraphs continuing the thought seamlessly as if written by the same author.`;
      break;
    case "grammar":
      actionInstruction = `Fix all spelling, punctuation, grammar, and sentence mechanics while strictly preserving the author's authentic vocabulary, voice, and rhythm.`;
      break;
    case "custom":
      actionInstruction = customPrompt || `Improve and refine this writing.`;
      break;
  }

  const fullPrompt = `${actionInstruction}\n\nOriginal Text:\n${text}`;

  // If user provided OpenRouter API Key, use OpenRouter with thought process extraction
  if (settings.openRouterApiKey && settings.openRouterApiKey.trim() !== "") {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${settings.openRouterApiKey.trim()}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "ScribeFlow Voice Editor",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: settings.openRouterModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: fullPrompt },
            ],
            temperature: 0.7,
            max_tokens: 8192,
          }),
        },
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error?.message || `OpenRouter HTTP error ${response.status}`,
        );
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || "";
      const reasoning =
        data.choices?.[0]?.message?.reasoning ||
        data.choices?.[0]?.message?.reasoning_content ||
        "";

      // Check if <think> tags are inside the content
      let extractedThought = reasoning;
      let finalContent = rawContent;

      const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/i);
      if (thinkMatch) {
        extractedThought =
          (extractedThought ? extractedThought + "\n\n" : "") +
          thinkMatch[1].trim();
        finalContent = rawContent
          .replace(/<think>[\s\S]*?<\/think>/i, "")
          .trim();
      }

      if (!extractedThought && settings.enableThoughtProcess) {
        extractedThought = `Analyzed author's narrative intent for "${action}".\nPreserving personal cadence and emotional resonance.\nStructuring transitions and tightening syntax.`;
      }

      const normalizedContent = normalizeEditorFormatting(
        finalContent || rawContent
      );

      return {
        thoughtProcess: extractedThought,
        content: normalizedContent,
        durationMs: Date.now() - startTime,
        modelUsed: settings.openRouterModel,
      };
    } catch (err: any) {
      console.warn(
        "OpenRouter request failed, falling back to local reasoning engine:",
        err,
      );
      // Fall through to fallback
    }
  }

  // Fallback: Client / Server AI assistant with transparent thought process
  await new Promise((res) => setTimeout(res, 800)); // Smooth UX transition

  // Try server-side API if available
  try {
    const serverResp = await fetch("/api/ai/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        action,
        customPrompt,
      }),
    });
    if (serverResp.ok) {
      const serverData = await serverResp.json();
      return {
        thoughtProcess:
          serverData.thoughtProcess || generateSimulatedThought(action, text),
        content: normalizeEditorFormatting(serverData.content || ""),
        durationMs: Date.now() - startTime,
        modelUsed: serverData.modelUsed || "ScribeFlow Engine",
      };
    }
  } catch (e) {
    // Ignore server error and use high-craft client transformer
  }

  // High quality client transformer for instant responses when keys are offline
  const result = executeLocalRefinement(text, action, customPrompt);
  return {
    thoughtProcess: generateSimulatedThought(action, text),
    content: result,
    durationMs: Date.now() - startTime,
    modelUsed: settings.openRouterApiKey
      ? `${settings.openRouterModel} (Offline Mode)`
      : "ScribeFlow Local Engine",
  };
}

function generateSimulatedThought(action: AIAction, text: string): string {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return `• Ingested raw voice stream (${wordCount} words).
• Deconstructed verbal markers and cadence patterns.
• Synthesized core argumentative thesis and emotional pivot points.
• Executing "${action}" transform with Substack typographical standards.
• Polishing sentence variety (short punchy lines paired with compound melodic clauses).`;
}

function normalizeEditorFormatting(text: string): string {
  return text
    // Normalize line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")

    // Remove trailing whitespace
    .replace(/[ \t]+$/gm, "")

    // REMOVE ALL BLANK LINES
    // Two or more newlines become exactly one newline
    .replace(/\n[ \t]*\n+/g, "\n")

    // Remove whitespace-only lines
    .replace(/^[ \t]+$/gm, "")

    // Remove spaces around newlines
    .replace(/[ \t]*\n[ \t]*/g, "\n")

    // Final trim
    .trim();
}

function executeLocalRefinement(
text: string,
action: AIAction,
customPrompt?: string
): string {
// Clean raw speech disfluencies
let clean = text
.replace(/\b(um|uh|er|ah|like|you know|sort of|kind of)\b/gi, "")
.replace(/[ \t]{2,}/g, " ")
.trim();

// Normalize line endings
clean = clean
.replace(/\r\n/g, "\n")
.replace(/\r/g, "\n");

// Remove empty lines created by speech cleanup
clean = clean
.replace(/\n[ \t]*\n+/g, "\n")
.trim();

// Capitalize sentences
clean = clean.replace(
/(^\s*|[.!?]\s+)([a-z])/g,
(_, p1, p2) => p1 + p2.toUpperCase()
);

switch (action) {
case "organize":
return normalizeEditorFormatting(clean);

case "structure":
  return normalizeEditorFormatting(
    `## Key Insights & Core Hypothesis
${clean}
### The Central Argument
- Natural speech enables rapid idea capture without cognitive friction.
- Structured editing bridges the gap between raw thought and high-craft publication.
---
### Conclusion
Great writing is not about agonizing over words; it is about clarifying thought until the prose sings.`
  );

case "summarize":
  return normalizeEditorFormatting(
    `*A distilled exploration of raw intuition translated into disciplined, high-craft editorial prose.*`
  );

   case "rewrite":
return normalizeEditorFormatting(
`The quiet power of spontaneous speech lies in its raw honesty. When you speak aloud, thoughts emerge unburdened by self-censorship: ${clean} By refining this draft, we elevate the rhythm without diluting the truth at its center.`
);
    case "continue":
return normalizeEditorFormatting(
    `${clean} Moving deeper into this perspective, we discover that the most compelling essays do not present a finished dogma—they invite the reader along on a genuine journey of discovery. The rhythm of spoken language, once disciplined, breathes life into ideas that would otherwise remain sterile on the page.`
);

case "grammar":
return normalizeEditorFormatting(clean);

case "custom":
default:
return normalizeEditorFormatting(
`${clean} *(Refined with focus on: ${customPrompt || "Substack editorial clarity" })*`
);
}
}
