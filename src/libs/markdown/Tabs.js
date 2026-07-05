// Tabs.js
export default function Tabs(md) {
  const TAB_START_RE = /^;;tabs\s*$/;
  const TAB_END_RE = /^;;\s*$/;
  const TAB_HEADING_RE = /^## (.+)$/;

  function tabsBlock(state, startLine, endLine, checkMode) {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(pos, max);

    if (!TAB_START_RE.test(line)) return false;
    if (checkMode) return true;

    const tabs = [];
    let currentTab = null;
    let currentContent = [];
    let nextLine = startLine + 1;

    while (nextLine < endLine) {
      const p = state.bMarks[nextLine] + state.tShift[nextLine];
      const e = state.eMarks[nextLine];
      const l = state.src.slice(p, e);

      if (TAB_END_RE.test(l)) {
        if (currentTab) {
          currentTab.content = currentContent.join('\n');
          tabs.push(currentTab);
        }
        break;
      }

      const headingMatch = l.match(TAB_HEADING_RE);
      if (headingMatch) {
        if (currentTab) {
          currentTab.content = currentContent.join('\n');
          tabs.push(currentTab);
        }
        currentTab = { title: headingMatch[1], content: '' };
        currentContent = [];
      } else if (currentTab) {
        currentContent.push(l);
      }
      nextLine++;
    }

    // Jika blok tidak ditutup dengan ;;, tetap push tab terakhir
    if (currentTab && !currentTab.content && currentContent.length) {
      currentTab.content = currentContent.join('\n');
      tabs.push(currentTab);
    }

    if (tabs.length === 0) return true; // abaikan jika kosong

    const tabId = `tabs-${Math.random().toString(36).slice(2, 8)}`;
    const headers = tabs.map((t, i) =>
      `<button type="button" 
               class="tab-btn px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 
                      ${i === 0 ? 'active bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 border-b-2 border-sky-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}"
               data-tab="${tabId}" 
               data-index="${i}">${md.utils.escapeHtml(t.title)}</button>`
    ).join('');

    const contents = tabs.map((t, i) => {
      const rendered = md.render(t.content || '');
      return `<div id="${tabId}-${i}" data-tab-content="${tabId}" class="${i === 0 ? '' : 'hidden'} animate-fadeIn">${rendered}</div>`;
    }).join('');

    const html = `
      <div class="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700" data-tab-group="${tabId}">
        <div class="flex overflow-x-auto bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          ${headers}
        </div>
        <div class="p-4 bg-white dark:bg-slate-800">
          ${contents}
        </div>
      </div>`;

    const token = state.push('html_block', '', 0);
    token.content = html;
    token.block = true;
    token.map = [startLine, nextLine + 1];

    state.line = nextLine + 1;
    return true;
  }

  md.block.ruler.before('paragraph', 'tabs', tabsBlock);
}