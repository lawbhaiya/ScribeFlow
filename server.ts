import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 3001);
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(rootDir, "dist");

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ScribeFlow API" });
});

app.post("/api/ai/transform", async (req, res) => {
  const { text, action, customPrompt } = req.body as {
    text?: string;
    action?: string;
    customPrompt?: string;
  };

  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "text is required" });
    return;
  }

  try {
    const result = await transformWithOpenRouter(text, action || "organize", customPrompt);
    res.json(result);
  } catch (error) {
    console.warn("Server AI request failed; using local transformer:", error);
    res.json({
      thoughtProcess: "Used the ScribeFlow server fallback editor.",
      content: localTransform(text, action || "organize", customPrompt),
      modelUsed: "ScribeFlow Server Fallback"
    });
  }
});

if (process.env.SERVE_DIST !== "false") {
  app.use(express.static(distDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`ScribeFlow server running on http://localhost:${port}`);
});

async function transformWithOpenRouter(text: string, action: string, customPrompt?: string) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return {
      thoughtProcess: "Used the ScribeFlow server fallback editor.",
      content: localTransform(text, action, customPrompt),
      modelUsed: "ScribeFlow Server Fallback"
    };
  }

  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "ScribeFlow Server"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are an editorial writing assistant. Return compact Markdown with no blank lines. Preserve the author's meaning and voice."
        },
        {
          role: "user",
          content: `${instructionFor(action, customPrompt)}\n\nOriginal text:\n${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter HTTP error ${response.status}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenRouter returned empty content");

  return {
    thoughtProcess: `Generated with ${model}.`,
    content: normalizeFormatting(content),
    modelUsed: model
  };
}

function instructionFor(action: string, customPrompt?: string): string {
  const prompt = customPrompt?.trim();
  if (action === "rewrite") {
    return prompt
      ? `Rewrite the text according to this direction: ${prompt}`
      : "Rewrite the text with elegant, clear, high-craft editorial prose.";
  }
  if (action === "continue") {
    return prompt
      ? `Continue the writing naturally and follow this direction: ${prompt}`
      : "Continue the writing naturally for the next 2-3 paragraphs.";
  }
  if (action === "summarize") return "Summarize the text with a concise subtitle, key takeaways, and a short overview.";
  if (action === "structure") return "Structure the text with compact Markdown headings, paragraphs, and useful bullet points.";
  if (action === "grammar") return "Correct grammar and syntax while preserving the author's voice.";
  return "Organize and polish the text while preserving the author's voice and meaning.";
}

function localTransform(text: string, action: string, customPrompt?: string): string {
  const clean = normalizeFormatting(text
    .replace(/\b(um|uh|er|ah|you know|sort of|kind of)\b/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim());

  if (action === "continue") {
    return `${clean}\nMoving deeper into this idea, the next step is to make its implications concrete and useful for the reader.${customPrompt ? ` ${customPrompt}` : ""}`;
  }
  if (action === "rewrite") {
    return customPrompt ? `${clean}\n\n${customPrompt}` : clean;
  }
  return clean;
}

function normalizeFormatting(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/\n\s*\n+/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}
