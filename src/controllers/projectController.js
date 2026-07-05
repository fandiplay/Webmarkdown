import { cache } from '../services/cache.js';

export function apiProjects(req, res) {
  res.json(cache.projects);
}
