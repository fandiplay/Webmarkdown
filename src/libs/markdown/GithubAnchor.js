export default function GithubAnchor(md) {
  const originalHeadingOpen = md.renderer.rules.heading_open;

  md.renderer.rules.heading_open = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const level = token.markup.length;
    const text = tokens[idx + 1]?.content || '';
    const slug = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');

    token.attrs = token.attrs || [];
    token.attrs.push(['id', slug]);

    const sizeMap = { 1: 'text-3xl', 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg', 5: 'text-base', 6: 'text-sm' };
    const marginMap = { 1: 'mt-8 mb-4', 2: 'mt-6 mb-3', 3: 'mt-5 mb-2', 4: 'mt-4 mb-2', 5: 'mt-3 mb-1', 6: 'mt-2 mb-1' };
    const cls = `${sizeMap[level] || 'text-lg'} ${marginMap[level] || 'mt-4 mb-2'} font-bold text-slate-800 dark:text-slate-100 group flex items-center gap-2`;

    const anchor = `<a href="#${slug}" class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300" aria-label="Anchor for ${text}">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
    </a>`;

    return `<h${level} class="${cls}">${anchor}`;
  };
}
