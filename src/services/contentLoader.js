import { readFileSync } from 'node:fs';
import { glob } from 'glob';
import { cache } from './cache.js';
import { parseMarkdown } from './parser.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', '..', 'data');

function readJSON(filename) {
  return JSON.parse(readFileSync(join(dataDir, filename), 'utf-8'));
}

export async function initializeApplicationData() {
  if (cache.blogs.length && cache.docs.length) return; // warm start guard

  // Load JSON data files in parallel
  const [config, navigation, socials, projects, blogPaths, docPaths] = await Promise.all([
    Promise.resolve(readJSON('config.json')),
    Promise.resolve(readJSON('navigation.json')),
    Promise.resolve(readJSON('socials.json')),
    Promise.resolve(readJSON('projects.json')),
    glob('content/blog/**/*.md'),
    glob('content/docs/**/*.md')
  ]);

  cache.config = config;
  cache.navigation = navigation;
  cache.socials = socials;
  cache.projects = projects;

  // Parse all markdown files in parallel
  const [blogPosts, docPages] = await Promise.all([
    Promise.all(blogPaths.map(async (fp) => {
      const raw = readFileSync(fp, 'utf-8');
      return parseMarkdown(raw, fp);
    })),
    Promise.all(docPaths.map(async (fp) => {
      const raw = readFileSync(fp, 'utf-8');
      return parseMarkdown(raw, fp);
    }))
  ]);

  // Sort blogs: pinned first, then by createdAt descending
  cache.blogs = blogPosts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  cache.docs = docPages;
}
