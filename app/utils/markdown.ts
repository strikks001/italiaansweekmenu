/**
 * Strips inline markdown, for places that need plain text: structured data,
 * meta descriptions. Block syntax is out of scope - these are single lines.
 */
export function plainText(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images -> alt
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> label
    .replace(/`([^`]+)`/g, '$1')
    // The \S guards keep "2 * 3" intact: markdown emphasis allows no space
    // beside its markers either.
    .replace(/(\*\*|__)(\S(?:[\s\S]*?\S)?)\1/g, '$2')
    .replace(/([*_])(\S(?:[\s\S]*?\S)?)\1/g, '$2')
    .trim()
}
