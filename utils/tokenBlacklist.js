import redis from './redisClient.js';

const BLACKLIST_PREFIX = 'bl:jwt:';

export const blacklistToken = async (token, expInSeconds) => {
  const key = BLACKLIST_PREFIX + token;
  await redis.set(key, '1', 'EX', expInSeconds); // set expiry same as token's
};

export const isTokenBlacklisted = async (token) => {
  const key = BLACKLIST_PREFIX + token;
  const exists = await redis.exists(key);
  return exists === 1;
};
