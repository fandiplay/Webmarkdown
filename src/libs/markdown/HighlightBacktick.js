export default function HighlightBacktick(md) {
  const originalCodeInline = md.renderer.rules.code_inline;

  md.renderer.rules.code_inline = function(tokens, idx, options, env, self) {
    const content = md.utils.escapeHtml(tokens[idx].content);
    return `<code class="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono before:content-none after:content-none border border-cyan-200 dark:border-cyan-800 shadow-inner">${content}</code>`;
  };
}
