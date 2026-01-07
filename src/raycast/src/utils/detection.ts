/**
 * Check if a string is a URL
 */
export function isUrl(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Determine capture type based on content
 */
export function detectCaptureType(content: string): 'url' | 'text' {
  return isUrl(content) ? 'url' : 'text';
}
