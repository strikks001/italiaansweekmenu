/** Strips inline markdown for places that need plain text, such as schema.org. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images -> alt
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> label
    .replace(/`([^`]+)`/g, '$1')
    // The \S guards keep "2 * 3" intact.
    .replace(/(\*\*|__)(\S(?:[\s\S]*?\S)?)\1/g, '$2')
    .replace(/([*_])(\S(?:[\s\S]*?\S)?)\1/g, '$2')
    .trim()
}
