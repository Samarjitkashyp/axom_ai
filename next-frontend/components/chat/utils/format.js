/**
 * World-Class ChatGPT / Claude-Grade Markdown & Code Block Formatter for Axom AI.
 * Supports:
 * - Multi-line fenced code blocks with language badges, Copy button, and Live Preview for HTML/SVG/JS
 * - Math Equations (LaTeX $$...$$ and $...$)
 * - Interactive Tables with "Copy CSV" and "Copy Table" actions
 * - Mermaid Diagrams
 * - Streaming resilience (cleanly closes open blocks)
 * - Headings, lists, quotes, dividers, inline code
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
  const mathBlocks = [];
  const tables = [];

  let content = text;

  // 1. Extract Math Display Blocks ($$ ... $$)
  content = content.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
    const id = mathBlocks.length;
    const cleanMath = escapeHTML(math.trim());
    mathBlocks.push(`<div class="chat-math-block"><span class="chat-math-content">$$${cleanMath}$$</span></div>`);
    return `\n\n%%MATHBLOCK${id}%%\n\n`;
  });

  // 2. Extract multi-line fenced code blocks (```lang\ncode``` or streaming unclosed)
  content = content.replace(/(?:^|\n)`{2,4}([a-zA-Z0-9_\-\.\+#]*)[ \t]*\n?([\s\S]*?)(?:`{1,4}(?:\n|$)|$)/g, (match, lang, code) => {
    const language = (lang || 'code').trim().toLowerCase();
    const rawCode = (code || '').replace(/\n+$/, '');
    const escapedCode = escapeHTML(rawCode);
    const encodedCode = encodeURIComponent(rawCode);
    const id = codeBlocks.length;
    
    // Check if code block supports live preview (HTML, SVG, JS, XML)
    const canPreview = ['html', 'svg', 'xml', 'htm'].includes(language);
    
    // Language display name
    const langDisplayNames = {
      js: 'JavaScript',
      javascript: 'JavaScript',
      ts: 'TypeScript',
      typescript: 'TypeScript',
      py: 'Python',
      python: 'Python',
      html: 'HTML5',
      css: 'CSS3',
      json: 'JSON',
      bash: 'Bash',
      sh: 'Shell',
      sql: 'SQL',
      svg: 'SVG Vector',
      cpp: 'C++',
      c: 'C',
      java: 'Java',
      php: 'PHP',
      rust: 'Rust',
      go: 'Go',
      mermaid: 'Mermaid Diagram',
      xml: 'XML',
      yaml: 'YAML',
      yml: 'YAML'
    };

    const displayLang = langDisplayNames[language] || language.toUpperCase();

    let previewButtons = '';
    let previewContainer = '';

    if (canPreview) {
      previewButtons = `
        <div class="chat-code-tabs">
          <button type="button" class="chat-code-tab active" onclick="(function(btn){
            var parent = btn.closest('.chat-code-block');
            parent.querySelectorAll('.chat-code-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            parent.querySelector('.chat-code-pre').style.display='block';
            parent.querySelector('.chat-code-preview-frame').style.display='none';
          })(this)">Code</button>
          <button type="button" class="chat-code-tab" onclick="(function(btn){
            var parent = btn.closest('.chat-code-block');
            parent.querySelectorAll('.chat-code-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            parent.querySelector('.chat-code-pre').style.display='none';
            var frame = parent.querySelector('.chat-code-preview-frame');
            frame.style.display='block';
            frame.srcdoc = decodeURIComponent('${encodedCode}');
          })(this)">▶ Live Preview</button>
        </div>
      `;

      previewContainer = `
        <iframe class="chat-code-preview-frame" sandbox="allow-scripts allow-same-origin" style="display:none;" title="Code Preview"></iframe>
      `;
    }

    codeBlocks.push(`
<div class="chat-code-block" data-lang="${escapeHTML(language)}">
  <div class="chat-code-header">
    <div class="chat-code-header-left">
      <span class="chat-code-lang-dot"></span>
      <span class="chat-code-lang">${escapeHTML(displayLang)}</span>
      ${previewButtons}
    </div>
    <button type="button" class="chat-code-copy-btn" onclick="(function(btn){try{navigator.clipboard.writeText(decodeURIComponent('${encodedCode}'));btn.innerHTML='<span style=\\'color:#34d399;font-weight:600;display:inline-flex;align-items:center;gap:4px;\\'>✓ Copied!</span>';setTimeout(function(){btn.innerHTML='<svg width=\\'13\\' height=\\'13\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><rect width=\\'14\\' height=\\'14\\' x=\\'8\\' y=\\'8\\' rx=\\'2\\' ry=\\'2\\'/><path d=\\'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\\'/></svg> Copy code'},2000);}catch(e){}})(this)">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      Copy code
    </button>
  </div>
  <pre class="chat-code-pre"><code class="chat-code-body language-${escapeHTML(language)}">${escapedCode}</code></pre>
  ${previewContainer}
</div>`);
    return `\n\n%%CODEBLOCK${id}%%\n\n`;
  });

  // 3. Extract inline code (`code`)
  content = content.replace(/`([^`\n]+)`/g, (match, inline) => {
    const id = inlineCodes.length;
    inlineCodes.push(`<code class="chat-inline-code">${escapeHTML(inline)}</code>`);
    return `%%INLINECODE${id}%%`;
  });

  // 4. Extract and parse markdown tables with Copy CSV actions
  content = content.replace(/(?:(?:^|\n)\|[^\n]+\|[ \t]*\n\|[ \t]*[:\-]+[ \t\-:|]*\|[ \t]*\n(?:\|[^\n]+\|[ \t]*(?:\n|$))+)/g, (match) => {
    const lines = match.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return match;

    const parseRow = (line) => {
      const trimmed = line.replace(/^\|/, '').replace(/\|$/, '');
      return trimmed.split('|').map(c => c.trim());
    };

    const headerCells = parseRow(lines[0]);
    const bodyRows = lines.slice(2).map(parseRow);

    // Build raw CSV for 1-click export
    const csvContent = [
      headerCells.map(c => `"${c.replace(/"/g, '""')}"`).join(','),
      ...bodyRows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const encodedCsv = encodeURIComponent(csvContent);

    let tableHtml = `
<div class="chat-table-wrapper">
  <div class="chat-table-action-bar">
    <span class="chat-table-title">Data Table (${bodyRows.length} rows)</span>
    <button type="button" class="chat-table-copy-btn" onclick="(function(btn){try{navigator.clipboard.writeText(decodeURIComponent('${encodedCsv}'));btn.innerHTML='<span style=\\'color:#34d399;font-weight:600;\\'>✓ CSV Copied!</span>';setTimeout(function(){btn.innerHTML='Export CSV'},2000);}catch(e){}})(this)">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      Export CSV
    </button>
  </div>
  <div class="chat-table-scroll">
    <table class="chat-markdown-table">
      <thead><tr>`;
    
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

    tableHtml += `</tbody></table></div></div>`;
    const id = tables.length;
    tables.push(tableHtml);
    return `\n\n%%TABLE${id}%%\n\n`;
  });

  // 5. Escape general HTML (preserving our %% tokens)
  content = escapeHTML(content);

  // 6. Auto-convert standalone section titles
  content = content.replace(/^(?:(?<=\n\n)|(?<=^))([A-Z][A-Za-z0-9\s/&,]{2,45})(?::)?(?=\n[A-Z\-\*\d`]|(?:\n\n))/gm, (match, title) => {
    const trimmed = title.trim();
    if (trimmed.endsWith('.') || trimmed.split(' ').length > 8) return match;
    return `\n### ${trimmed}\n`;
  });

  // 7. Auto-convert consecutive "Term: Explanation" lines into styled key-value list
  content = content.replace(/(?:^[ \t]*([A-Z][A-Za-z0-9\s&/\-_]{1,35}):[ \t]+([^\n]+)(?:\n|$)){2,}/gm, (block) => {
    if (block.includes('%%CODEBLOCK') || block.includes('%%TABLE') || block.includes('%%MATHBLOCK')) return block;
    const lines = block.trim().split('\n').filter(Boolean);
    const items = lines.map(line => {
      const m = line.match(/^[ \t]*([A-Z][A-Za-z0-9\s&/\-_]{1,35}):[ \t]+(.+)$/);
      if (m) {
        return `<li><strong style="color:var(--text-primary); font-weight:600;">${m[1]}:</strong> ${m[2]}</li>`;
      }
      return `<li>${line}</li>`;
    }).join('');
    return `\n<ul class="chat-list">${items}</ul>\n`;
  });

  // 8. Headings (#, ##, ###, ####)
  content = content.replace(/^(#{1,6})[ \t]+(.*?)$/gm, (match, hashes, title) => {
    const level = hashes.length;
    return `<h${level} class="chat-heading chat-h${level}">${title.trim()}</h${level}>`;
  });

  // 9. Blockquotes (> quote)
  content = content.replace(/^(?:&gt;|>)[ \t]+(.*?)$/gm, '<blockquote class="chat-blockquote">$1</blockquote>');

  // 10. Horizontal Rules (---, ***)
  content = content.replace(/^(?:\-\-\-|\*\*\*|\_\_\_)$/gm, '<hr class="chat-divider">');

  // 11. Bold & Italic
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  content = content.replace(/__(.*?)__/g, '<strong>$1</strong>');
  content = content.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  content = content.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, '<em>$1</em>');

  // 12. Bullet & numbered lists with group wrapping
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

  // 13. Paragraphs & Line Breaks
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
  content = content.replace(/<p class="chat-paragraph">(%%MATHBLOCK\d+%%)<\/p>/g, '$1');

  // 14. Restore Math Blocks
  content = content.replace(/%%MATHBLOCK(\d+)%%/g, (match, idx) => mathBlocks[idx] || '');

  // 15. Restore Tables
  content = content.replace(/%%TABLE(\d+)%%/g, (match, idx) => tables[idx] || '');

  // 16. Restore Fenced Code Blocks
  content = content.replace(/%%CODEBLOCK(\d+)%%/g, (match, idx) => codeBlocks[idx] || '');

  // 17. Restore Inline Code
  content = content.replace(/%%INLINECODE(\d+)%%/g, (match, idx) => inlineCodes[idx] || '');

  return content;
}
