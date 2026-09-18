import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { Logger } from '@nestjs/common';

async function seed() {
  const logger = new Logger('SeedSuperadminScript');
  logger.log('Bootstrapping RaphaMIS Seeding Context...');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const usersService = app.get(UsersService);
    await usersService.seedSuperAdmin();
    logger.log('================================================================');
    logger.log('🎉 Superadmin Seeding Complete!');
    logger.log('   Email:    mbarutech@gmail.com');
    logger.log('   Password: welcome@2026');
    logger.log('   Role:     Superadmin (System Master)');
    logger.log('================================================================');
  } catch (error) {
    logger.error('Error during superadmin seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

seed();
