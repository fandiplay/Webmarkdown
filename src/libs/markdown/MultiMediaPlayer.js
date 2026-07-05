const VIDEO_EXTS = ['mp4', 'webm', 'ogg', 'mov', 'm4v'];
const AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];

export default function MultiMediaPlayer(md) {
  const originalImage = md.renderer.rules.image;

  md.renderer.rules.image = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const src = token.attrs[token.attrIndex('src')][1];
    const alt = token.content || '';
    const ext = src.split('?')[0].split('.').pop()?.toLowerCase() || '';

    if (VIDEO_EXTS.includes(ext)) {
      return `<video controls class="w-full rounded-xl my-4" preload="metadata">
        <source src="${md.utils.escapeHtml(src)}" type="video/${ext === 'm4v' ? 'mp4' : ext}">
        Your browser does not support the video tag.
      </video>`;
    }

    if (AUDIO_EXTS.includes(ext)) {
      return `<audio controls class="w-full my-4" preload="metadata">
        <source src="${md.utils.escapeHtml(src)}" type="audio/${ext === 'm4a' ? 'mp4' : ext}">
        Your browser does not support the audio tag.
      </audio>`;
    }

    return `<img loading="lazy" src="${md.utils.escapeHtml(src)}" alt="${md.utils.escapeHtml(alt)}" class="rounded-xl my-4 w-full object-cover">`;
  };
}
