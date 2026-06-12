import type { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { createClient as createRedisClient } from 'redis';

type RateLimiterOptions = {
  points: number;
  duration: number; // seconds
  keyPrefix?: string;
  getKey?: (req: Request) => string | undefined;
};

let redisClient: ReturnType<typeof createRedisClient> | null = null;
if (process.env.REDIS_URL) {
  // initialise un client Redis si l'URL est fournie
  redisClient = createRedisClient({ url: process.env.REDIS_URL });
  // connect async but not awaited here; RateLimiterRedis gérera la connexion
  redisClient.connect().catch(() => {
    // eslint-disable-next-line no-console
    console.warn('[rateLimiter] Impossible de connecter Redis, fallback mémoire activé');
    redisClient = null;
  });
}

// Factory qui retourne un middleware express consommant des points et renvoyant 429
export function createRateLimiter(opts: RateLimiterOptions) {
  const getKey = opts.getKey ?? ((req: Request) => req.ip || String(req.headers['x-forwarded-for'] || ''));

  const store = redisClient
    ? new RateLimiterRedis({
        storeClient: redisClient as any,
        points: opts.points,
        duration: opts.duration,
        keyPrefix: opts.keyPrefix ?? 'rlflx',
      })
    : new RateLimiterMemory({ points: opts.points, duration: opts.duration });

  return async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = getKey(req) || 'anonymous';
    try {
      const rlRes = await (store as any).consume(key);
      // set rate-limit headers
      res.setHeader('X-RateLimit-Limit', String(opts.points));
      const remaining = typeof rlRes.remainingPoints === 'number' ? Math.max(0, rlRes.remainingPoints) : 0;
      res.setHeader('X-RateLimit-Remaining', String(remaining));
      return next();
    } catch (err: any) {
      const msBefore = (err && (err.msBeforeNext || err.ms_before_next || err.ms_before)) || 0;
      const seconds = Math.ceil(msBefore / 1000) || 1;
      res.setHeader('Retry-After', String(seconds));
      res.setHeader('X-RateLimit-Limit', String(opts.points));
      res.setHeader('X-RateLimit-Remaining', '0');
      return res.status(429).json({ ok: false, message: 'Trop de requêtes, réessayez plus tard', retryAfterSeconds: seconds });
    }
  };
}

