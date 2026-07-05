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
  md.renderer.rules.fence = function (tokens, idx) {
    const token = tokens[idx];
    const info = (token.info || '').trim();
    const lang = info.split(/\s+/)[0] || '';
    const titleMatch = info.match(/title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : (lang || 'code');
    const code = token.content;
    const mappedLang = languageMap[lang] || lang;

    let highlighted = md.utils.escapeHtml(code);
    if (mappedLang && Prism.languages[mappedLang]) {
      highlighted = Prism.highlight(code, Prism.languages[mappedLang], mappedLang);
    }

    const langLabel = mappedLang || 'plaintext';

    return `
      <div data-code-block
           class="my-5 w-full max-w-full overflow-hidden rounded-[1.5rem] border border-[#1f2a17] bg-[#091009] shadow-[0_0_0_1px_rgba(159,232,112,0.12),0_28px_70px_rgba(0,0,0,0.55)]">
        
        <!-- Toolbar seimbang dengan grid 3 kolom -->
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-white/5 bg-[#10170f] px-4 py-3">
          
          <!-- Kiri: traffic light dots -->
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[0_0_16px_rgba(255,95,87,0.45)]"></span>
            <span class="h-3 w-3 rounded-full bg-[#febc2e] shadow-[0_0_16px_rgba(254,188,46,0.35)]"></span>
            <span class="h-3 w-3 rounded-full bg-[#28c840] shadow-[0_0_16px_rgba(40,200,64,0.45)]"></span>
          </div>

          <!-- Tengah: judul (selalu center sempurna) -->
          <span class="min-w-0 truncate text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#9fe870]"
                title="${md.utils.escapeHtml(title)}">
            ${md.utils.escapeHtml(title)}
          </span>

          <!-- Kanan: tombol aksi (rata kanan, lebar seragam) -->
          <div class="flex items-center justify-end gap-2">
            <button type="button"
                    onclick="
                      const root = this.closest('[data-code-block]');
                      const code = root.querySelector('code');
                      const isWrapped = code.dataset.wrap === 'true';
                      if (isWrapped) {
                        code.classList.remove('whitespace-pre-wrap', 'break-words');
                        code.classList.add('whitespace-pre');
                        this.textContent = 'Wrap';
                        code.dataset.wrap = 'false';
                      } else {
                        code.classList.remove('whitespace-pre');
                        code.classList.add('whitespace-pre-wrap', 'break-words');
                        this.textContent = 'No wrap';
                        code.dataset.wrap = 'true';
                      }
                    "
                    class="min-w-[4.5rem] rounded-full px-2.5 py-1 text-center text-xs font-medium text-[#c8cac5] transition-colors hover:bg-white/5 hover:text-[#e8ebe6]"
            >Wrap</button>

            <button type="button"
                    onclick="
                      const root = this.closest('[data-code-block]');
                      const code = root.querySelector('code');
                      navigator.clipboard.writeText(code.textContent);
                      this.textContent = 'Copied!';
                      setTimeout(() => (this.textContent = 'Copy'), 2000);
                    "
                    class="min-w-[4.5rem] rounded-full px-2.5 py-1 text-center text-xs font-medium text-[#9fe870] transition-colors hover:bg-[#9fe870]/10 hover:text-[#d7ff7a]"
            >Copy</button>
          </div>
        </div>

        <!-- Area kode -->
        <div class="overflow-x-auto overflow-y-hidden" style="-webkit-overflow-scrolling: touch; scrollbar-gutter: stable;">
          <pre class="m-0 bg-transparent px-4 py-5 sm:px-5 text-[13px] leading-7"><code
              class="block min-w-full text-[#e8ebe6] language-${langLabel} whitespace-pre"
              data-wrap="false"
          >${highlighted}</code></pre>
        </div>
      </div>`;
  };
}