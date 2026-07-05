export default function Dokapi(md) {
  const ROUTE_RE = /^& route (GET|POST|PUT|PATCH|DELETE) (\S+) (.+?) &$/;
  const RESPONSE_RE = /^< response (\d{3}) (.+?) <$/;
  const DEFINE_REF_RE = /^# define-reference (\S+)\s+\.\.\.$/;
  const END_REF_RE = /^\.\.\.$/;
  const REF_RE = /@\s+(\S+)\s+@/g;

  const verbBadge = {
    GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    POST: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    PATCH: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    DELETE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
  };

  const references = Object.create(null);

  function resolveRefs(text = '') {
    return text.replace(REF_RE, (_, name) => references[name] ?? `@ ${name} @`);
  }

  function responseBadgeClass(code) {
    const n = Number(code);
    if (n < 300) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    if (n < 400) return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300';
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
  }

  function renderResponseCard(response) {
    const messageHtml = md.renderInline(resolveRefs(response.message));

    return `
      <div class="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-4">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <span class="rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] ${responseBadgeClass(response.code)}">${response.code}</span>
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">Output</span>
        </div>
        <div class="prose prose-sm max-w-none text-slate-600 dark:prose-invert dark:text-slate-300">
          ${messageHtml}
        </div>
      </div>
    `;
  }

  function renderStandaloneResponse(response) {
    const messageHtml = md.renderInline(resolveRefs(response.message));

    return `
      <div class="my-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-4 shadow-sm">
        <div class="mb-2 flex items-center gap-2">
          <span class="rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] ${responseBadgeClass(response.code)}">${response.code}</span>
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">Response</span>
        </div>
        <div class="prose prose-sm max-w-none text-slate-600 dark:prose-invert dark:text-slate-300">
          ${messageHtml}
        </div>
      </div>
    `;
  }

  function renderRoute(route, response) {
    const responseHtml = response
      ? renderResponseCard(response)
      : `
        <div class="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-4 text-sm text-slate-500 dark:text-slate-400">
          Belum ada response untuk endpoint ini.
        </div>
      `;

    return `
      <details class="dokapi-route my-4 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 shadow-sm transition-colors">
        <summary class="flex cursor-pointer flex-wrap items-center gap-3 px-4 py-3 select-none outline-none hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <span class="shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] ${verbBadge[route.verb] || verbBadge.GET}">
            ${route.verb}
          </span>
          <code class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-slate-700 dark:text-slate-300">
            ${md.utils.escapeHtml(route.path)}
          </code>
          <span class="hidden sm:inline text-sm text-slate-500 dark:text-slate-400">
            ${md.utils.escapeHtml(route.desc)}
          </span>
        </summary>

        <div class="border-t border-slate-200/80 dark:border-slate-700 px-4 py-4 bg-slate-50/80 dark:bg-slate-900/40">
          ${responseHtml}
        </div>
      </details>
    `;
  }

  function dokapiBlock(state, startLine, endLine, silent) {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(pos, max).trim();

    let match;

    if ((match = line.match(ROUTE_RE))) {
      if (silent) return true;

      const token = state.push('dokapi_route', '', 0);
      token.meta = {
        verb: match[1],
        path: match[2],
        desc: match[3]
      };
      token.block = true;
      token.map = [startLine, startLine + 1];

      state.line = startLine + 1;
      return true;
    }

    if ((match = line.match(RESPONSE_RE))) {
      if (silent) return true;

      const token = state.push('dokapi_response', '', 0);
      token.meta = {
        code: match[1],
        message: match[2]
      };
      token.block = true;
      token.map = [startLine, startLine + 1];

      state.line = startLine + 1;
      return true;
    }

    if ((match = line.match(DEFINE_REF_RE))) {
      if (silent) return true;

      const refName = match[1];
      const refContent = [];
      let refLine = startLine + 1;

      while (refLine < endLine) {
        const p = state.bMarks[refLine] + state.tShift[refLine];
        const e = state.eMarks[refLine];
        const current = state.src.slice(p, e).trim();

        if (END_REF_RE.test(current)) break;

        refContent.push(state.src.slice(p, e));
        refLine++;
      }

      references[refName] = refContent.join('\n').trim();
      state.line = refLine + 1;
      return true;
    }

    return false;
  }

  md.block.ruler.before('paragraph', 'dokapi', dokapiBlock);

  md.core.ruler.after('inline', 'dokapi_resolve', function (state) {
    const routeMeta = [];
    const responseMeta = [];

    for (const token of state.tokens) {
      if (token.type === 'dokapi_route') {
        routeMeta.push(token.meta);
      } else if (token.type === 'dokapi_response') {
        responseMeta.push(token.meta);
      }
    }

    let routeIndex = 0;
    let responseIndex = 0;
    const outputTokens = [];

    for (const token of state.tokens) {
      if (token.type === 'dokapi_route') {
        const route = routeMeta[routeIndex];
        const pairedResponse = responseMeta[routeIndex] || null;

        token.type = 'html_block';
        token.tag = '';
        token.nesting = 0;
        token.content = renderRoute(route, pairedResponse);
        token.block = true;
        token.children = null;

        outputTokens.push(token);
        routeIndex++;
        continue;
      }

      if (token.type === 'dokapi_response') {
        if (responseIndex < routeMeta.length) {
          responseIndex++;
          continue;
        }

        const response = responseMeta[responseIndex];
        token.type = 'html_block';
        token.tag = '';
        token.nesting = 0;
        token.content = renderStandaloneResponse(response);
        token.block = true;
        token.children = null;

        outputTokens.push(token);
        responseIndex++;
        continue;
      }

      if (token.type === 'inline' && token.children && token.children.length) {
        for (const child of token.children) {
          if (child.type === 'text' || child.type === 'code_inline') {
            child.content = resolveRefs(child.content);
          }
        }
      }

      outputTokens.push(token);
    }

    state.tokens = outputTokens;
  });
}