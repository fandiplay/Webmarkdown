export default function Dokapi(md) {
  const ROUTE_RE = /^& route (GET|POST|PUT|PATCH|DELETE) (\S+) (.+?) &$/;
  const RESPONSE_RE = /^< (\d{3}) (.+?) <$/;
  const DEFINE_REF_RE = /^# define-reference (\S+) \.\.\.$/;
  const REF_RE = /@ (\S+) @/g;
  const END_REF_RE = /^\.\.\.#$/;

  const verbColors = {
    GET: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    PUT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    PATCH: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  };

  const references = {};

  function dokapiBlock(state, startLine, endLine, checkMode) {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(pos, max);

    let match;

    // Route definition
    if (match = line.match(ROUTE_RE)) {
      if (checkMode) return true;
      const [_, verb, path, desc] = match;
      const color = verbColors[verb] || verbColors.GET;
      const html = `<details class="my-2 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <summary class="flex items-center gap-3 px-4 py-3 cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span class="px-2 py-0.5 rounded text-xs font-bold uppercase ${color}">${verb}</span>
          <code class="text-sm font-mono text-slate-700 dark:text-slate-300">${md.utils.escapeHtml(path)}</code>
          <span class="text-sm text-slate-500 dark:text-slate-400">${md.utils.escapeHtml(desc)}</span>
        </summary>
        <div class="p-4 border-t border-slate-200 dark:border-slate-700 prose dark:prose-invert max-w-none text-sm"></details>`;

      const token = state.push('html_block', '', 0);
      token.content = html;
      token.block = true;
      token.map = [startLine, startLine + 1];
      state.line = startLine + 1;
      return true;
    }

    // Response definition
    if (match = line.match(RESPONSE_RE)) {
      if (checkMode) return true;
      const [_, code, message] = match;
      const codeColor = parseInt(code) < 300 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 
                        parseInt(code) < 400 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
      const html = `<div class="flex items-center gap-2 my-1 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <span class="px-2 py-0.5 rounded text-xs font-bold ${codeColor}">${code}</span>
        <span class="text-sm text-slate-600 dark:text-slate-400">${md.utils.escapeHtml(message)}</span>
      </div>`;

      const token = state.push('html_block', '', 0);
      token.content = html;
      token.block = true;
      token.map = [startLine, startLine + 1];
      state.line = startLine + 1;
      return true;
    }

    // Define reference
    if (match = line.match(DEFINE_REF_RE)) {
      if (checkMode) return true;
      const refName = match[1];
      let refContent = [];
      let refLine = startLine + 1;
      while (refLine < endLine) {
        const p = state.bMarks[refLine] + state.tShift[refLine];
        const e = state.eMarks[refLine];
        const l = state.src.slice(p, e);
        if (END_REF_RE.test(l)) break;
        refContent.push(l);
        refLine++;
      }
      references[refName] = refContent.join('\n');
      state.line = refLine + 1;
      return true;
    }

    return false;
  }

  md.block.ruler.before('paragraph', 'dokapi', dokapiBlock);

  // Core rule: resolve references
  function resolveRefs(state) {
    for (const token of state.tokens) {
      if (token.content && token.type === 'inline') {
        token.content = token.content.replace(REF_RE, (_, name) => {
          return references[name] || `@${name}@`;
        });
      }
      // Also handle html_block tokens
      if (token.content && token.type === 'html_block' && REF_RE.test(token.content)) {
        // already handled
      }
    }
  }

  md.core.ruler.push('dokapi_resolve', resolveRefs);
}
