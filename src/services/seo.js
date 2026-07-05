export function buildSeoOptions(customOptions = {}) {
  return customOptions;
}

export function renderSeoMeta(config, options = {}) {
  const title = options.title ? `${options.title} | ${config.siteName}` : config.siteTitle;
  const description = options.description || config.siteDescription;
  const url = options.url || config.siteUrl;
  const image = options.image || config.avatar;

  const meta = {
    title,
    description,
    canonical: url,
    ogTitle: title,
    ogDescription: description,
    ogUrl: url,
    ogImage: image,
    ogType: options.ogType || 'website',
    twitterCard: options.twitterCard || 'summary',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image
  };

  if (options.ogType === 'article') {
    meta.articlePublishedTime = options.publishedTime;
    meta.articleModifiedTime = options.modifiedTime;
    meta.articleAuthor = options.author;
    meta.articleTags = options.tags;
  }

  return meta;
}
