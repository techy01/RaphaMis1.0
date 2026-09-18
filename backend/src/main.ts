import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 1. Zero Trust: Security Headers (Helmet + CSP)
  const isProduction = configService.get<string>('NODE_ENV', 'development') === 'production';
  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'"],
              fontSrc: ["'self'", 'https:'],
              objectSrc: ["'none'"],
              upgradeInsecureRequests: [],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
      xPoweredBy: false, // Prevent server software fingerprinting
    }),
  );

  // 2. Global Route Prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // 3. Strict CORS Origin Configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'https://raphamis.saaslink.tech');
  const configuredCors = configService
    .get<string>('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((origin) => origin.trim());

  const allowedOriginsSet = new Set<string>(configuredCors);
  if (frontendUrl) {
    allowedOriginsSet.add(frontendUrl.trim());
    try {
      const parsed = new URL(frontendUrl);
      allowedOriginsSet.add(parsed.origin);
    } catch {}
  }
  // Also always ensure the production domain is allowed
  allowedOriginsSet.add('https://raphamis.saaslink.tech');
  allowedOriginsSet.add('http://raphamis.saaslink.tech');

  const allowedOrigins = Array.from(allowedOriginsSet);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as server-to-server or mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy rejection: Origin ${origin} is not authorized`), false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
    maxAge: 86400, // 24 hours preflight caching
  });

  // 4. Data Validation & Boundary Sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically strip non-whitelisted properties (Mass Assignment protection)
      forbidNonWhitelisted: true, // Throw 400 error when unexpected fields are passed
      transform: true, // Typecast request payloads according to their DTO types
      transformOptions: {
        enableImplicitConversion: false, // Require explicit validation decorators
      },
      disableErrorMessages: isProduction, // Avoid leaking stack/validation internals in production
    }),
  );

  // 5. Global Exception Handling (Prevents leaking stack traces or internal DB errors)
  app.useGlobalFilters(new HttpExceptionFilter());

  // 6. Network Binding
  const port = Number(
    process.env.BACKEND_PORT ||
    process.env.PORT ||
    configService.get<number>('BACKEND_PORT', configService.get<number>('PORT', 3001))
  );
  const host = process.env.HOST || configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);
  logger.log(`RaphaMIS Backend active on ${host}:${port}/${apiPrefix} (Node: ${process.env.NODE_ENV || 'dev'})`);
}
bootstrap();
