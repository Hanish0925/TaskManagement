import redis from './redisClient.js';

const DEFAULT_TTL = 120; 

export const getCache = async (key) => {
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`[CACHE HIT] ${key}`);
      return JSON.parse(cached);
    } else {
      console.log(`[CACHE MISS] ${key}`);
      return null;
    }
  } catch (err) {
    console.error(`[CACHE ERROR] Read failed for ${key}:`, err);
    return null;
  }
};

export const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
    console.log(`[CACHE SET] ${key} (TTL: ${ttl}s)`);
  } catch (err) {
    console.error(`[CACHE ERROR] Write failed for ${key}:`, err);
  }
};

export const deleteCache = async (key) => {
  try {
    await redis.del(key);
    console.log(`[CACHE DEL] ${key}`);
  } catch (err) {
    console.error(`[CACHE ERROR] Delete failed for ${key}:`, err);
  }
};

export const buildUserScopedKey = (prefix, userId) => {
  return `v1:${prefix}:user:${userId}`;
};
