import express from 'express';
import {
  createProject,
  joinProject,
  getMyProjects
} from '../controllers/projectController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createProject);

router.post('/:id/join', joinProject);

router.get('/', getMyProjects);

export default router;
