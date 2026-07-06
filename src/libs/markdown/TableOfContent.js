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

    // Indentasi + border kiri hanya untuk level 2 (subjudul)
    const indentStyles = {
      1: 'ml-0 pl-0 border-l-0',                         // judul
      2: 'ml-2 pl-4 border-l-2 border-sky-300 dark:border-sky-600', // subjudul (|)
      3: 'ml-8 pl-0 border-l-0',                         // subjudul-subjudul
      4: 'ml-12 pl-0 border-l-0',
      5: 'ml-16 pl-0 border-l-0',
      6: 'ml-20 pl-0 border-l-0'
    };

    const textStyles = {
      1: 'font-bold text-base',            // judul: bold & besar
      2: 'font-semibold text-sm',          // subjudul: semi-bold
      3: 'font-normal text-sm',            // subjudul-subjudul: tidak bold
      4: 'font-normal text-sm',
      5: 'font-normal text-sm',
      6: 'font-normal text-sm'
    };

    const colorMap = {
      1: 'text-sky-700 dark:text-sky-300',
      2: 'text-sky-600 dark:text-sky-400',
      3: 'text-slate-700 dark:text-slate-300',
      4: 'text-slate-600 dark:text-slate-400',
      5: 'text-slate-500 dark:text-slate-500',
      6: 'text-slate-400 dark:text-slate-500'
    };

    const items = headings.map(h =>
      `<li class="${indentStyles[h.level] || indentStyles[1]}">
        <a href="#${h.slug}" class="block py-1.5 px-2 rounded-r-lg transition-all duration-200 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-700 dark:hover:text-sky-300 no-underline ${textStyles[h.level] || 'font-normal text-sm'} ${colorMap[h.level] || 'text-slate-600 dark:text-slate-400'}">
          ${md.utils.escapeHtml(h.text)}
        </a>
      </li>`
    ).join('');

    const tocHtml = `<details open class="toc-container bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg shadow-sky-900/5 dark:shadow-black/20 border border-sky-100 dark:border-sky-800/50 p-5 mb-8 transition-all duration-300">
      <summary class="flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-300 cursor-pointer select-none list-none marker:content-none">
        <svg class="w-4 h-4 transition-transform duration-200 toc-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        Table of Contents
      </summary>
      <ul class="mt-3 space-y-0.5 list-none">
        ${items}
      </ul>
    </details>
    <style>
      details.toc-container[open] > summary .toc-arrow {
        transform: rotate(180deg);
      }
    </style>`;

    const tocToken = tokens[tocIndex];
    tocToken.type = 'html_block';
    tocToken.content = tocHtml;
    tocToken.children = null;
  }

  md.core.ruler.push('toc_core', tocCore);
}