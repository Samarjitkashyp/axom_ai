/**
 * Professional ChatGPT-style Markdown & Code Block Formatter for Axom AI.
 * Supports:
 * - Multi-line fenced code blocks with language headers and interactive "Copy code" button
 * - Safe HTML escaping to prevent Cross-Site Scripting (XSS)
 * - Streaming resilience: cleanly renders unclosed code blocks while tokens are actively streaming
 * - Markdown tables with responsive wrappers and borders
 * - Headings (###, ##, #) and auto-detected section headings
 * - Ordered and unordered lists (<ul>, <ol>, <li>) including key-value lists
 * - Blockquotes (> quote)
 * - Inline code (`code`)
 * - Bold (**bold**) and Italic (*italic*)
 * - Horizontal rules (---)
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

  const codeBlocks = [];
  const inlineCodes = [];
  const tables = [];

  let content = text;

  // 1. Extract multi-line fenced code blocks (```lang\ncode```, ``lang\ncode`, or streaming unclosed)
  content = content.replace(/(?:^|\n)`{2,4}([a-zA-Z0-9_\-\.\+#]*)[ \t]*\n?([\s\S]*?)(?:`{1,4}(?:\n|$)|$)/g, (match, lang, code) => {
    const language = (lang || 'code').trim().toLowerCase();
    const rawCode = (code || '').replace(/\n+$/, '');
    const escapedCode = escapeHTML(rawCode);
    const encodedCode = encodeURIComponent(rawCode);
    const id = codeBlocks.length;
    
    codeBlocks.push(`
<div class="chat-code-block" data-lang="${escapeHTML(language)}">
  <div class="chat-code-header">
    <span class="chat-code-lang">${escapeHTML(language)}</span>
    <button type="button" class="chat-code-copy-btn" onclick="(function(btn){try{navigator.clipboard.writeText(decodeURIComponent('${encodedCode}'));btn.innerHTML='<span style=\\'color:#4ade80;font-weight:600;\\'>✓ Copied!</span>';setTimeout(function(){btn.innerHTML='Copy code'},2000);}catch(e){}})(this)">
      Copy code
    </button>
  </div>
  <pre class="chat-code-pre"><code class="chat-code-body language-${escapeHTML(language)}">${escapedCode}</code></pre>
</div>`);
    return `\n\n%%CODEBLOCK${id}%%\n\n`;
  });

  // 2. Extract inline code (`code`)
  content = content.replace(/`([^`\n]+)`/g, (match, inline) => {
    const id = inlineCodes.length;
    inlineCodes.push(`<code class="chat-inline-code">${escapeHTML(inline)}</code>`);
    return `%%INLINECODE${id}%%`;
  });

  // 3. Extract and parse markdown tables (| Col 1 | Col 2 | \n |---|---| \n | Val 1 | Val 2 |)
  content = content.replace(/(?:(?:^|\n)\|[^\n]+\|[ \t]*\n\|[ \t]*[:\-]+[ \t\-:|]*\|[ \t]*\n(?:\|[^\n]+\|[ \t]*(?:\n|$))+)/g, (match) => {
    const lines = match.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return match;

    const parseRow = (line) => {
      const trimmed = line.replace(/^\|/, '').replace(/\|$/, '');
      return trimmed.split('|').map(c => c.trim());
    };

    const headerCells = parseRow(lines[0]);
    const bodyRows = lines.slice(2).map(parseRow);

    let tableHtml = `<div class="chat-table-wrapper"><table class="chat-markdown-table"><thead><tr>`;
    headerCells.forEach(cell => {
      tableHtml += `<th>${escapeHTML(cell)}</th>`;
    });
    tableHtml += `</tr></thead><tbody>`;

    bodyRows.forEach(row => {
      tableHtml += `<tr>`;
      row.forEach(cell => {
        tableHtml += `<td>${escapeHTML(cell)}</td>`;
      });
      tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table></div>`;
    const id = tables.length;
    tables.push(tableHtml);
    return `\n\n%%TABLE${id}%%\n\n`;
  });

  // 4. Escape general HTML (preserving our %% tokens)
  content = escapeHTML(content);

  // 5. Auto-convert standalone section titles without markdown hashes (e.g. "Key Features of Python", "Common Uses of Python", "Example Code")
  content = content.replace(/^(?:(?<=\n\n)|(?<=^))([A-Z][A-Za-z0-9\s/&,]{2,45})(?::)?(?=\n[A-Z\-\*\d`]|(?:\n\n))/gm, (match, title) => {
    const trimmed = title.trim();
    if (trimmed.endsWith('.') || trimmed.split(' ').length > 8) return match;
    return `\n### ${trimmed}\n`;
  });

  // 6. Auto-convert consecutive "Term: Explanation" lines without bullet marks into clean bullet lists
  content = content.replace(/(?:^[ \t]*([A-Z][A-Za-z0-9\s&/\-_]{1,35}):[ \t]+([^\n]+)(?:\n|$)){2,}/gm, (block) => {
    if (block.includes('%%CODEBLOCK') || block.includes('%%TABLE')) return block;
    const lines = block.trim().split('\n').filter(Boolean);
    const items = lines.map(line => {
      const m = line.match(/^[ \t]*([A-Z][A-Za-z0-9\s&/\-_]{1,35}):[ \t]+(.+)$/);
      if (m) {
        return `<li><strong>${m[1]}:</strong> ${m[2]}</li>`;
      }
      return `<li>${line}</li>`;
    }).join('');
    return `\n<ul class="chat-list">${items}</ul>\n`;
  });

  // 7. Headings (#, ##, ###, ####)
  content = content.replace(/^(#{1,6})[ \t]+(.*?)$/gm, (match, hashes, title) => {
    const level = hashes.length;
    return `<h${level} class="chat-heading chat-h${level}">${title.trim()}</h${level}>`;
  });

  // 8. Blockquotes (> quote)
  content = content.replace(/^(?:&gt;|>)[ \t]+(.*?)$/gm, '<blockquote class="chat-blockquote">$1</blockquote>');

  // 9. Horizontal Rules (---, ***)
  content = content.replace(/^(?:\-\-\-|\*\*\*|\_\_\_)$/gm, '<hr class="chat-divider">');

  // 10. Bold & Italic
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  content = content.replace(/__(.*?)__/g, '<strong>$1</strong>');
  content = content.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  content = content.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, '<em>$1</em>');

  // 11. Bullet & numbered lists with group wrapping
  content = content.replace(/(?:^[ \t]*[\-\*\+][ \t]+(.*?)$(?:\n|$))+/gm, (block) => {
    const items = block.trim().split('\n').map(line => {
      const text = line.replace(/^[ \t]*[\-\*\+][ \t]+/, '');
      return `<li>${text}</li>`;
    }).join('');
    return `<ul class="chat-list">${items}</ul>`;
  });

  content = content.replace(/(?:^[ \t]*\d+\.[ \t]+(.*?)$(?:\n|$))+/gm, (block) => {
    const items = block.trim().split('\n').map(line => {
      const text = line.replace(/^[ \t]*\d+\.[ \t]+/, '');
      return `<li>${text}</li>`;
    }).join('');
    return `<ol class="chat-list">${items}</ol>`;
  });

  // 12. Paragraphs & Line Breaks
  content = content.replace(/\n\n+/g, '</p><p class="chat-paragraph">');
  content = `<p class="chat-paragraph">${content}</p>`;
  content = content.replace(/\n/g, '<br>');

  // Clean up empty tags or invalid nesting around block elements
  content = content.replace(/<p class="chat-paragraph">\s*<\/p>/g, '');
  content = content.replace(/<p class="chat-paragraph">(<h[1-6][^>]*>.*?<\/h[1-6]>)<\/p>/g, '$1');
  content = content.replace(/<p class="chat-paragraph">(<ul[^>]*>.*?<\/ul>)<\/p>/g, '$1');
  content = content.replace(/<p class="chat-paragraph">(<ol[^>]*>.*?<\/ol>)<\/p>/g, '$1');
  content = content.replace(/<p class="chat-paragraph">(<blockquote[^>]*>.*?<\/blockquote>)<\/p>/g, '$1');
  content = content.replace(/<p class="chat-paragraph">(<hr[^>]*>)<\/p>/g, '$1');
  content = content.replace(/<p class="chat-paragraph">(%%CODEBLOCK\d+%%)<\/p>/g, '$1');
  content = content.replace(/<p class="chat-paragraph">(%%TABLE\d+%%)<\/p>/g, '$1');

  // 13. Restore Tables
  content = content.replace(/%%TABLE(\d+)%%/g, (match, idx) => tables[idx] || '');

  // 14. Restore Fenced Code Blocks
  content = content.replace(/%%CODEBLOCK(\d+)%%/g, (match, idx) => codeBlocks[idx] || '');

  // 15. Restore Inline Code
  content = content.replace(/%%INLINECODE(\d+)%%/g, (match, idx) => inlineCodes[idx] || '');

  return content;
}
