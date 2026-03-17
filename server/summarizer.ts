const KEY_TERMS = [
  "因為", "但係", "最", "結果", "其實", "問題",
  "建議", "推薦", "重點", "原來", "發現", "覺得",
];

function splitSentences(text: string): string[] {
  // Split on Chinese and Western punctuation
  const parts = text.split(/(?<=[。！？；!?;])/);
  return parts
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function scoreSentence(sentence: string, index: number): number {
  let score = 0;
  // First sentence bonus
  if (index === 0) score += 3;
  // Key term bonus
  for (const term of KEY_TERMS) {
    if (sentence.includes(term)) {
      score += 2;
    }
  }
  return score;
}

export function generateSummary(title: string, content: string): string {
  // Short content: return as-is
  if (content.length < 100) return content;

  const sentences = splitSentences(content);
  if (sentences.length === 0) return content.slice(0, 200);

  // Score each sentence
  const scored = sentences.map((sentence, index) => ({
    sentence,
    index,
    score: scoreSentence(sentence, index),
  }));

  // Sort by score descending, take top 3
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);

  // Re-sort by original position for natural reading order
  top.sort((a, b) => a.index - b.index);

  // Format as bullet points
  let result = top.map((s) => `• ${s.sentence}`).join("\n");

  // Enforce max 200 chars
  if (result.length > 200) {
    result = result.slice(0, 197) + "...";
  }

  return result;
}
