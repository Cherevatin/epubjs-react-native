export function cleanText(text: string) {
  return text
    .replace(/[\r\n]*\d*[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
