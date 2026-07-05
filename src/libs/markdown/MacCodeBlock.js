import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-rust.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/components/prism-typescript.js';

const languageMap = {
  js: 'javascript',
  py: 'python',
  sh: 'bash',
  rb: 'ruby',
  ts: 'typescript',
  rs: 'rust',
  go: 'go',
  yml: 'yaml',
  yaml: 'yaml'
};

export default function MacCodeBlock(md) {
  const originalFence = md.renderer.rules.fence;

  md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    let lang = (token.info || '').trim().split(/\s+/)[0] || '';
    const titleMatch = token.info.match(/title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : (lang || 'code');
    const code = token.content;
    const mappedLang = languageMap[lang] || lang;

    let highlighted = code;
    if (mappedLang && Prism.languages[mappedLang]) {
      highlighted = Prism.highlight(code, Prism.languages[mappedLang], mappedLang);
    } else {
      highlighted = md.utils.escapeHtml(code);
    }

    const langLabel = mappedLang || 'plaintext';

    return `<div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 my-4 shadow-lg bg-white dark:bg-slate-900">
      <div class="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-red-500"></span>
          <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span class="w-3 h-3 rounded-full bg-green-500"></span>
        </div>
        <span class="text-xs font-medium text-slate-500 dark:text-slate-400">${md.utils.escapeHtml(title)}</span>
        <div class="flex items-center gap-2">
          <button onclick="this.parentElement.previousElementSibling.previousElementSibling?this.parentElement.parentElement.nextElementSibling.classList.toggle('whitespace-normal'):this.parentElement.parentElement.nextElementSibling.classList.toggle('whitespace-normal')" class="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Wrap</button>
          <button onclick="navigator.clipboard.writeText(this.parentElement.parentElement.nextElementSibling.textContent);this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',2000)" class="text-xs text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 transition-colors">Copy</button>
        </div>
      </div>
      <pre class="overflow-x-auto p-4 text-sm leading-relaxed whitespace-pre"><code class="language-${mappedLang}">${highlighted}</code></pre>
    </div>`;
  };
}
