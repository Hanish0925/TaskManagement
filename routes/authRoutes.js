import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  logout
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);

export default router;
