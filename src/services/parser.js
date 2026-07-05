import grayMatter from 'gray-matter';
import { md } from './markdown.js';

export function parseMarkdown(fileContent, filePath) {
  const { data, content } = grayMatter(fileContent);

  const slug = data.slug || filePath.split('/').pop().replace(/\.md$/, '');
  const words = content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(words / 200));

  const html = md.render(content);

  return {
    title: data.title || slug,
    description: data.description || '',
    slug,
    tags: data.tags || [],
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    written: data.written || 'Ardhian',
    pinned: !!data.pinned,
    draft: !!data.draft,
    cover: data.cover || '',
    readingTime,
    html,
    raw: content,
    path: filePath
  };
}
