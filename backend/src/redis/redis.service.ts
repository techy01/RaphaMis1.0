import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface RateLimitResult {
  allowed: boolean;
  totalHits: number;
  remainingHits: number;
  resetInSeconds: number;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const isRedisEnabled = this.configService.get<string>('REDIS_ENABLED', 'true') === 'true';
    if (!isRedisEnabled) {
      this.logger.warn('Redis is disabled by REDIS_ENABLED=false configuration.');
      return;
    }

    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));
    const password = this.configService.get<string>('REDIS_PASSWORD', '');
    const db = Number(this.configService.get<number>('REDIS_DB', 0));
    const keyPrefix = this.configService.get<string>('REDIS_KEY_PREFIX', 'raphamis:');
    const tlsEnabled = this.configService.get<string>('REDIS_TLS', 'false') === 'true';

    try {
      this.client = new Redis({
        host,
        port,
        password: password ? password : undefined,
        db,
        keyPrefix,
        tls: tlsEnabled ? {} : undefined,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 5) {
            this.logger.warn(`Redis connection retry limit reached (${times} attempts). Falling back to safe degraded mode.`);
            return null;
          }
          return Math.min(times * 200, 2000);
        },
        reconnectOnError: (err) => {
          this.logger.warn(`Redis reconnect error: ${err.message}`);
          return true;
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log(`Successfully connected to Redis instance at ${host}:${port} [DB ${db}]`);
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        this.logger.error(`Redis connection error: ${err.message}`);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        this.logger.warn('Redis connection closed.');
      });
    } catch (err: any) {
      this.logger.error(`Failed to initialize Redis client: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  get isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  getClient(): Redis | null {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    if (!this.isReady || !this.client) return null;
    try {
      return await this.client.get(key);
    } catch (err: any) {
      this.logger.warn(`Redis GET failed for key "${key}": ${err.message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isReady || !this.client) return;
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err: any) {
      this.logger.warn(`Redis SET failed for key "${key}": ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isReady || !this.client) return;
    try {
      await this.client.del(key);
    } catch (err: any) {
      this.logger.warn(`Redis DEL failed for key "${key}": ${err.message}`);
    }
  }

  /**
   * Sliding window / Token rate limiting with Redis multi-pipeline.
   * Atomically increments hits and enforces limits per IP or account identifier.
   */
  async checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    if (!this.isReady || !this.client) {
      // In fail-safe mode if Redis is temporarily offline, allow request to prevent hard outage
      return { allowed: true, totalHits: 1, remainingHits: limit - 1, resetInSeconds: windowSeconds };
    }

    const key = `ratelimit:${identifier}`;
    try {
      const multi = this.client.multi();
      multi.incr(key);
      multi.ttl(key);
      const results = await multi.exec();

      if (!results || results.length < 2) {
        return { allowed: true, totalHits: 1, remainingHits: limit - 1, resetInSeconds: windowSeconds };
      }

      const totalHits = (results[0][1] as number) || 1;
      let ttl = (results[1][1] as number) || -1;

      // If key is new or had no TTL, establish window TTL
      if (ttl === -1 || totalHits === 1) {
        await this.client.expire(key, windowSeconds);
        ttl = windowSeconds;
      }

      const allowed = totalHits <= limit;
      const remainingHits = Math.max(0, limit - totalHits);

      return {
        allowed,
        totalHits,
        remainingHits,
        resetInSeconds: ttl > 0 ? ttl : windowSeconds,
      };
    } catch (err: any) {
      this.logger.warn(`Rate limit check failed for ${identifier}: ${err.message}`);
      return { allowed: true, totalHits: 1, remainingHits: limit - 1, resetInSeconds: windowSeconds };
    }
  }
}
