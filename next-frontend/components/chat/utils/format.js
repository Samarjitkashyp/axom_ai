/**
 * Format markdown safely and prevent Cross-Site Scripting (XSS).
 */

export function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

export function formatMarkdown(text) {
  if (!text) return '';
  
  // 1. Escape HTML first
  let formatted = escapeHTML(text);

  // 2. Headings (###)
  formatted = formatted.replace(/^(#{1,6})\s+(.*?)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    const size = 1.35 - (level - 1) * 0.08;
    return `<h${level} class="chat-heading" style="font-size: ${size}rem; display: block; font-weight: 800; margin-top: 14px; margin-bottom: 6px; color: var(--text-primary);">${content}</h${level}>`;
  });

  // 3. Horizontal Rules (---)
  formatted = formatted.replace(/^(\-\-\-|\*\*\*|\_\_\_)$/gm, '<hr style="border: none; border-top: 1px solid var(--border-color); margin: 16px 0;">');

  // 4. Bold & Italic
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 5. Code blocks (inline)
  formatted = formatted.replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');

  // 6. Bullet lists
  formatted = formatted.replace(/^\s*[\-\*\+]\s+(.*?)$/gm, '<li style="margin-left: 20px; list-style-type: disc; margin-bottom: 4px; padding-left: 2px;">$1</li>');

  // 7. Numbered lists
  formatted = formatted.replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<li style="margin-left: 20px; list-style-type: decimal; margin-bottom: 4px; padding-left: 2px;">$2</li>');

  // 8. Newlines to breaks
  formatted = formatted.replace(/\n\n/g, '<br><br>');
  formatted = formatted.replace(/\n/g, '<br>');

  // 9. Clean up extra line breaks next to list elements or block elements
  formatted = formatted.replace(/(<\/li>)<br>/g, '$1');
  formatted = formatted.replace(/(<\/h\d>)<br>/g, '$1');
  formatted = formatted.replace(/(<hr[^>]*>)<br>/g, '$1');

  return formatted;
}
