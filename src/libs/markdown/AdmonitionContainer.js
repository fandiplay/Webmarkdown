const ADMONITION_RE = /^:{3,}\s*(note|info|tip|warning|caution|danger)\s*(.*)$/;
const END_RE = /^:{3,}\s*$/;

const iconMap = {
  note: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  tip: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
  warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  caution: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  danger: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
};

const colorMap = {
  note: 'border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200',
  info: 'border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200',
  tip: 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200',
  warning: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
  caution: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
  danger: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
};

export default function AdmonitionContainer(md) {
  // Store md reference for rendering inner content
  const renderer = md;

  function admonitionBlock(state, startLine, endLine, checkMode) {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(pos, max);

    const match = line.match(ADMONITION_RE);
    if (!match) return false;
    if (checkMode) return true;

    const type = match[1];
    const title = match[2].trim() || type.charAt(0).toUpperCase() + type.slice(1);

    // Collect inner content
    let nextLine = startLine + 1;
    let contentLines = [];

    while (nextLine < endLine) {
      const p = state.bMarks[nextLine] + state.tShift[nextLine];
      const e = state.eMarks[nextLine];
      const l = state.src.slice(p, e);
      if (END_RE.test(l)) break;
      contentLines.push(l);
      nextLine++;
    }

    // Render inner content as markdown
    const innerText = contentLines.join('\n');
    const renderedContent = renderer.render(innerText);

    const icon = iconMap[type] || iconMap.note;
    const colors = colorMap[type] || colorMap.note;

    const html = `<div class="border-l-4 ${colors} rounded-r-xl p-4 my-4">
      <div class="flex items-center gap-2 mb-2 font-semibold text-sm uppercase tracking-wider">${icon} ${md.utils.escapeHtml(title)}</div>
      <div class="prose prose-sm dark:prose-invert max-w-none">${renderedContent}</div>
    </div>`;

    const token = state.push('html_block', '', 0);
    token.content = html;
    token.block = true;
    token.map = [startLine, nextLine];

    state.line = nextLine + 1;
    return true;
  }

  md.block.ruler.before('paragraph', 'admonition', admonitionBlock);
}
