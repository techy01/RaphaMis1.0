import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BillingModule } from './billing/billing.module';
import { AuditModule } from './audit/audit.module';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { RedisRateLimitGuard } from './common/guards/redis-rate-limit.guard';
import { PatientsModule } from './patients/patients.module';
import { CommunicationModule } from './communication/communication.module';
import { PacsModule } from './pacs/pacs.module';

import { User } from './users/user.entity';
import { Tenant } from './tenants/tenant.entity';
import { Invoice } from './billing/invoice.entity';
import { AuditLog } from './audit/audit-log.entity';
import { Patient } from './patients/patient.entity';
import { CommunicationMessage } from './communication/communication-message.entity';
import { PacsStudyEntity } from './pacs/pacs-study.entity';
import { PacsServerEntity } from './pacs/pacs-server.entity';

@Module({
  imports: [
    // Centralized environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    // Distributed in-memory state & rate limiting via Redis
    RedisModule,
    // Database connection supporting MySQL and PostgreSQL from .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const rawDbType = (configService.get<string>('DB_TYPE', 'mysql')).toLowerCase().trim();
        const isMySql = rawDbType === 'mysql' || rawDbType === 'mariadb';

        return {
          type: isMySql ? 'mysql' : 'postgres',
          host: configService.get<string>('DB_HOST', '127.0.0.1'),
          port: Number(configService.get<number>('DB_PORT', isMySql ? 3306 : 5432)),
          username: configService.get<string>('DB_USERNAME', 'raphamis_user'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_DATABASE', 'raphamis_db'),
          entities: [User, Tenant, Invoice, AuditLog, Patient, CommunicationMessage, PacsStudyEntity, PacsServerEntity],
          // Enforce synchronize=false in production to prevent unintended DDL schema migrations
          synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
          logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
          charset: isMySql ? 'utf8mb4_unicode_ci' : undefined,
          timezone: configService.get<string>('DB_TIMEZONE', 'Z'),
          extra: isMySql
            ? {
                connectionLimit: Number(configService.get<number>('DB_POOL_MAX', 15)),
                connectTimeout: Number(configService.get<number>('DB_CONNECT_TIMEOUT', 10000)),
              }
            : undefined,
          ssl:
            configService.get<string>('DB_SSL', 'false') === 'true'
              ? {
                  rejectUnauthorized:
                    configService.get<string>('DB_SSL_REJECT_UNAUTHORIZED', 'true') === 'true',
                }
              : false,
        };
      },
    }),
    UsersModule,
    AuthModule,
    TenantsModule,
    DashboardModule,
    BillingModule,
    AuditModule,
    MailModule,
    PatientsModule,
    CommunicationModule,
    PacsModule,
  ],
  controllers: [],
  providers: [
    // Global rate-limiting guard using Redis sliding window
    {
      provide: APP_GUARD,
      useClass: RedisRateLimitGuard,
    },
  ],
})
export class AppModule {}
