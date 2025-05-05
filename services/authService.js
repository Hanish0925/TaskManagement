import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

export const registerNewUser = async ({ name, email, password, avatarUrl }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error('User already exists');

  const user = await User.create({ name, email, password, avatarUrl });
  return formatUserWithToken(user);
};

export const authenticateUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid email or password');
  }
  return formatUserWithToken(user);
};

export const getUserProfileById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

function formatUserWithToken(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    token: generateToken(user._id),
  };
}
