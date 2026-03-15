const SUMMARY_MAX_CHARS = 280;

/**
 * Derive a short summary from full content for collapsed widget state.
 * Uses first 2 sentences when possible, otherwise first SUMMARY_MAX_CHARS at word boundary.
 * (Later this can be replaced by an AI-generated summary.)
 */
export function getContentSummary(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return '';

  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length >= 2) {
    const two = `${sentences[0]} ${sentences[1]}`.trim();
    return two.length <= SUMMARY_MAX_CHARS + 50 ? two : truncateAtWords(two, SUMMARY_MAX_CHARS);
  }

  return truncateAtWords(trimmed, SUMMARY_MAX_CHARS);
}

function truncateAtWords(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(' ');
  const end = lastSpace > maxChars / 2 ? lastSpace : maxChars;
  return slice.slice(0, end).trim() + '…';
}
