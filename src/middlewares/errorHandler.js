export function notFound(req, res, next) {
  res.status(404).render('pages/404', {
    page: '404',
    title: 'Page Not Found',
    seo: { title: '404 Not Found' }
  });
}

export function serverError(err, req, res, next) {
  console.error(err.stack);
  res.status(500).render('pages/500', {
    page: '500',
    title: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : null,
    seo: { title: '500 Server Error' }
  });
}
