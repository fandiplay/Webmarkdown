export default function TableOfContent(md) {
  // Block rule: detect [[toc]] lines
  const TOC_RE = /^\[\[toc\]\]\s*$/;

  function tocBlock(state, startLine, endLine, checkMode) {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(pos, max);

    if (!TOC_RE.test(line)) return false;

    if (checkMode) return true;

    const token = state.push('toc_placeholder', 'div', 0);
    token.block = true;
    token.markup = '[[toc]]';
    token.map = [startLine, startLine + 1];

    state.line = startLine + 1;
    return true;
  }

  md.block.ruler.before('paragraph', 'toc_placeholder', tocBlock);

  // Core rule: collect headings and render TOC
  function tocCore(state) {
    const tokens = state.tokens;
    const headings = [];
    let tocIndex = -1;

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type === 'toc_placeholder') {
        tocIndex = i;
      }
      if (t.type === 'heading_open' && t.tag.match(/^h[1-6]$/)) {
        const level = parseInt(t.tag[1]);
        const inlineToken = tokens[i + 1];
        const text = inlineToken?.content || '';
        const slug = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');
        headings.push({ level, text, slug });
      }
    }

    if (tocIndex === -1 || headings.length === 0) return;

    const indentMap = { 1: 'ml-0', 2: 'ml-3', 3: 'ml-6', 4: 'ml-9', 5: 'ml-12', 6: 'ml-15' };
    const colorMap = { 1: 'text-sky-700 dark:text-sky-300 font-semibold', 2: 'text-sky-600 dark:text-sky-400', 3: 'text-slate-600 dark:text-slate-400', 4: 'text-slate-500 dark:text-slate-400', 5: 'text-slate-500 dark:text-slate-400', 6: 'text-slate-500 dark:text-slate-400' };

    const items = headings.map(h =>
      `<li class="${indentMap[h.level] || 'ml-0'}">
        <a href="#${h.slug}" class="block py-1 px-2 rounded-lg transition-colors duration-200 hover:bg-sky-50 dark:hover:bg-sky-900/30 ${colorMap[h.level] || 'text-slate-600 dark:text-slate-400'} text-sm">${md.utils.escapeHtml(h.text)}</a>
      </li>`
    ).join('');

    const tocHtml = `<details open class="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4 mb-6 border border-sky-200 dark:border-sky-800">
      <summary class="text-sm font-semibold text-sky-700 dark:text-sky-300 cursor-pointer select-none">Table of Contents</summary>
      <ul class="mt-3 space-y-1">${items}</ul>
    </details>`;

    const tocToken = tokens[tocIndex];
    tocToken.type = 'html_block';
    tocToken.content = tocHtml;
    tocToken.children = null;
  }

  md.core.ruler.push('toc_core', tocCore);
}
