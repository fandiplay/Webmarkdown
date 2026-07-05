import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initializeApplicationData } from './services/contentLoader.js';
import { injectLocals } from './middlewares/locals.js';
import { notFound, serverError } from './middlewares/errorHandler.js';
import { setupRoutes } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
let isInitialized = false;
let initPromise = null;

// Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use('/static', express.static(join(__dirname, '..', 'public'), { maxAge: '1y' }));
app.use(express.json());

// View engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, '..', 'views'));

// Layout wrapper — renders page content then wraps with base layout
app.use((req, res, next) => {
  const origRender = res.render.bind(res);
  res.render = (view, opts = {}) => {
    origRender(view, opts, (err, html) => {
      if (err) return next(err);
      origRender('layouts/base', { ...opts, body: html });
    });
  };
  next();
});

// Initialization guard
app.use(async (req, res, next) => {
  if (!isInitialized) {
    if (!initPromise) {
      initPromise = initializeApplicationData().then(() => {
        isInitialized = true;
      }).catch(err => {
        console.error('Init failed:', err);
        isInitialized = true;
      });
    }
    await initPromise;
  }
  next();
});

// Locals
app.use(injectLocals);

// Routes
setupRoutes(app);

// Error handling
app.use(notFound);
app.use(serverError);

// Export for Vercel serverless
export default app;

// Local dev
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
