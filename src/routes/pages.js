import { Router } from 'express';
import { renderHome, renderBlogIndex, renderBlogPost, renderDocsIndex, renderDocDetail } from '../controllers/pageController.js';
import { apiProjects } from '../controllers/projectController.js';

const router = Router();

router.get('/', renderHome);
router.get('/blog', renderBlogIndex);
router.get('/blog/:slug', renderBlogPost);
router.get('/docs', renderDocsIndex);
router.get('/docs/:slug', renderDocDetail);
router.get('/api/projects', apiProjects);

export default router;
