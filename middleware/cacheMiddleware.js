import { getCache, setCache } from '../utils/cache.js';

export const cacheMiddleware = (keyGenerator, ttl = 120) => {
  return async (req, res, next) => {
    try {
      const key = keyGenerator(req);

      const cached = await getCache(key);
      if (cached) {
        return res.json(cached);
      }

      const originalJson = res.json.bind(res);
      res.json = (data) => {
        setCache(key, data, ttl);
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error(`[CACHE MIDDLEWARE ERROR]: ${err.message}`);
      next(); 
    }
  };
};
