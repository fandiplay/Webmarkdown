import { cache } from '../services/cache.js';

export function renderHome(req, res) {
  const featuredProjects = cache.projects.filter(p => p.featured);
  const latestPosts = cache.blogs.filter(p => !p.draft).slice(0, 6);

  res.render('pages/home', {
    page: 'home',
    title: 'Home',
    featuredProjects,
    latestPosts,
    seo: {
      title: cache.config.siteTitle,
      description: cache.config.siteDescription,
      image: cache.config.avatar
    }
  });
}

export function renderBlogIndex(req, res) {
  const posts = cache.blogs.filter(p => !p.draft);
  const sort = req.query.sort || 'newest';
  const tag = req.query.tag || '';

  let filtered = [...posts];
  if (tag) filtered = filtered.filter(p => (p.tags || []).includes(tag));
  if (sort === 'oldest') filtered.reverse();

  const tagCounts = new Map();
  for (const post of posts) {
    for (const postTag of (post.tags || [])) {
      tagCounts.set(postTag, (tagCounts.get(postTag) || 0) + 1);
    }
  }

  const allTags = [...tagCounts.entries()]
    .sort((a, b) => {
      const countDiff = b[1] - a[1];
      if (countDiff !== 0) return countDiff;
      return a[0].localeCompare(b[0]);
    })
    .map(([name]) => name);

  const MAX_VISIBLE_TAGS = 6;

  let visibleTags = allTags.slice(0, MAX_VISIBLE_TAGS);
  let hiddenTags = allTags.slice(MAX_VISIBLE_TAGS);

  if (tag && allTags.includes(tag)) {
    if (!visibleTags.includes(tag)) {
      visibleTags = [tag, ...visibleTags.filter(t => t !== tag)];
    }
    hiddenTags = hiddenTags.filter(t => t !== tag);
  }

  res.render('pages/blog', {
    page: 'blog',
    title: 'Blog',
    posts: filtered,
    tags: visibleTags,
    hiddenTags,
    hiddenTagCount: hiddenTags.length,
    activeTag: tag,
    activeSort: sort,
    seo: {
      title: 'Blog',
      description: cache.config.siteDescription
    }
  });
}

export function renderBlogPost(req, res) {
  const post = cache.blogs.find(p => p.slug === req.params.slug && !p.draft);
  if (!post) {
    return res.status(404).render('pages/404', {
      page: '404',
      title: 'Not Found',
      seo: { title: '404 Not Found' }
    });
  }

  res.render('pages/post', {
    page: 'post',
    title: post.title,
    post,
    seo: {
      title: post.title,
      description: post.description,
      ogType: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      author: post.written,
      tags: post.tags,
      image: post.cover,
      url: `/blog/${post.slug}`
    }
  });
}

export function renderDocsIndex(req, res) {
  res.render('pages/docs', {
    page: 'docs',
    title: 'Docs',
    docs: cache.docs,
    seo: {
      title: 'Documentation',
      description: 'Technical documentation and knowledge base'
    }
  });
}

export function renderDocDetail(req, res) {
  const doc = cache.docs.find(d => d.slug === req.params.slug);
  if (!doc) {
    return res.status(404).render('pages/404', {
      page: '404',
      title: 'Not Found',
      seo: { title: '404 Not Found' }
    });
  }

  res.render('pages/doc', {
    page: 'doc',
    title: doc.title,
    doc,
    docs: cache.docs,
    seo: {
      title: doc.title,
      description: doc.description
    }
  });
}