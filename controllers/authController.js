import {
  registerNewUser,
  authenticateUser,
  getUserProfileById
} from '../services/authService.js';

import { blacklistToken } from '../utils/tokenBlacklist.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {
    const data = await registerNewUser(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const data = await authenticateUser(req.body);
    res.json(data);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await getUserProfileById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'Token missing' });

    const decoded = jwt.decode(token);
    const exp = decoded?.exp;
    if (!exp) return res.status(400).json({ message: 'Invalid token' });

    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now;

    if (ttl > 0) {
      await blacklistToken(token, ttl);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
