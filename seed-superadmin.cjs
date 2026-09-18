#!/usr/bin/env node
/**
 * RaphaMIS Standalone Production Seeder & Password Hash Generator
 * 
 * Target account:
 *   Email:    mbarutech@gmail.com
 *   Password: welcome@2026
 *   Role:     Superadmin
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const SUPERADMIN_EMAIL = 'mbarutech@gmail.com';
const SUPERADMIN_PASSWORD = 'welcome@2026';
const SUPERADMIN_NAME = 'RaphaMIS Master Superadmin';

async function generateSeed() {
    console.log('\n================================================================');
    console.log('            RAPHAMIS PRODUCTION DATABASE SEEDER                 ');
    console.log('================================================================');

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(SUPERADMIN_PASSWORD, salt);
    const uuid = crypto.randomUUID ? crypto.randomUUID() : 'b51f84e2-6f23-4d7a-85d1-6789abcdef01';
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(`[+] Target Account:  ${SUPERADMIN_EMAIL}`);
    console.log(`[+] Plain Password:  ${SUPERADMIN_PASSWORD}`);
    console.log(`[+] Role:            Superadmin`);
    console.log(`[+] Bcrypt Salt:     12 rounds`);
    console.log(`[+] Bcrypt Hash:     ${hash}\n`);

    console.log('--- [OPTION A] Direct MySQL / MariaDB Query ---');
    console.log(`
INSERT INTO users (id, name, email, password, role, created_at, updated_at)
VALUES ('${uuid}', '${SUPERADMIN_NAME}', '${SUPERADMIN_EMAIL}', '${hash}', 'Superadmin', '${now}', '${now}')
ON DUPLICATE KEY UPDATE 
  name = '${SUPERADMIN_NAME}',
  password = '${hash}',
  role = 'Superadmin',
  updated_at = '${now}';
`);

    console.log('--- [OPTION B] PostgreSQL Query ---');
    console.log(`
INSERT INTO users (id, name, email, password, role, created_at, updated_at)
VALUES ('${uuid}', '${SUPERADMIN_NAME}', '${SUPERADMIN_EMAIL}', '${hash}', 'Superadmin', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  name = '${SUPERADMIN_NAME}',
  password = '${hash}',
  role = 'Superadmin',
  updated_at = NOW();
`);

    console.log('================================================================');
    console.log('Tip: In the NestJS backend, running `npm run seed` or starting the app');
    console.log('(`npm run start:prod` / PM2) will also seed this account automatically.');
    console.log('================================================================\n');
}

generateSeed().catch(console.error);
