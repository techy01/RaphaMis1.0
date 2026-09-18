import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

export const RATE_LIMIT_KEY = 'rate_limit_override';
export const RateLimit = (limit: number, windowSeconds: number) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, windowSeconds });

@Injectable()
export class RedisRateLimitGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    // Check for custom endpoint overrides (e.g. stricter limit for login/auth)
    const override = this.reflector.get<{ limit: number; windowSeconds: number }>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    const defaultLimit = Number(this.configService.get<number>('RATE_LIMIT_MAX_REQUESTS', 100));
    const defaultWindow = Number(this.configService.get<number>('RATE_LIMIT_WINDOW_SECONDS', 60));

    const limit = override?.limit ?? defaultLimit;
    const windowSeconds = override?.windowSeconds ?? defaultWindow;

    // Identify client by authenticated user ID or real IP
    const clientIp =
      request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      request.headers['x-real-ip'] ||
      request.socket?.remoteAddress ||
      '127.0.0.1';

    const userId = request.user?.sub || request.user?.id || '';
    const endpoint = request.route?.path || request.url;
    const identifier = userId ? `user:${userId}:${endpoint}` : `ip:${clientIp}:${endpoint}`;

    const result = await this.redisService.checkRateLimit(identifier, limit, windowSeconds);

    // Standard RFC RateLimit headers
    if (response && response.setHeader) {
      response.setHeader('X-RateLimit-Limit', limit.toString());
      response.setHeader('X-RateLimit-Remaining', result.remainingHits.toString());
      response.setHeader('X-RateLimit-Reset', result.resetInSeconds.toString());
    }

    if (!result.allowed) {
      if (response && response.setHeader) {
        response.setHeader('Retry-After', result.resetInSeconds.toString());
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please retry after ${result.resetInSeconds} seconds.`,
          retryAfter: result.resetInSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
