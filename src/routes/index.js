import pages from './pages.js';

export function setupRoutes(app) {
  app.use('/', pages);
}
