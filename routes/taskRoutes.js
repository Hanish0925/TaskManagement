import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
} from '../controllers/taskController.js';

import { protect } from '../middleware/authMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { buildUserScopedKey } from '../utils/cache.js';

const router = express.Router();
router.use(protect);
router.post('/', createTask);
router.get(
  '/',
  cacheMiddleware((req) => {
    const { status, q } = req.query;
    const parts = [req.user._id];
    if (status) parts.push(`status:${status}`);
    if (q) parts.push(`q:${q}`);
    return buildUserScopedKey('tasks', parts.join(':'));
  }, 60),
  getTasks
);

router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

export default router;
