#!/usr/bin/env node
/**
 * RaphaMIS Automated Database Setup & Superadmin Seeder
 * 
 * This script:
 * 1. Reads database credentials from .env (or backend/.env)
 * 2. Connects to MySQL/MariaDB
 * 3. Creates the database if it doesn't exist
 * 4. Imports schema.sql tables
 * 5. Seeds the Superadmin accounts:
 *    - mbarutech@gmail.com
 *    - admin@raphamis.saaslink.tech
 *    - Default password: welcome2026
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');

// Helper to load .env file
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, 'backend', '.env')
  ];
  
  const env = {};
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.substring(0, idx).trim();
          const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
          env[key] = val;
        }
      }
    }
  }
  return env;
}

async function run() {
  console.log('\n================================================================');
  console.log('       🏥 RaphaMIS Automated Database Setup & Seeder            ');
  console.log('================================================================\n');

  const env = loadEnv();
  const dbHost = env.DB_HOST || '127.0.0.1';
  const dbPort = env.DB_PORT || '3306';
  const dbUser = env.DB_USERNAME || 'root';
  const dbPass = env.DB_PASSWORD || '';
  const dbName = env.DB_DATABASE || 'raphamis_db';
  const superPassword = env.SUPERADMIN_PASSWORD || 'welcome2026';

  console.log(`[+] Target Host:     ${dbHost}:${dbPort}`);
  console.log(`[+] Database Name:   ${dbName}`);
  console.log(`[+] Database User:   ${dbUser}`);
  console.log(`[+] Superadmin Pwd:  ${superPassword}`);

  // Test MySQL connection using mysql CLI
  const passFlag = dbPass ? `-p'${dbPass}'` : '';
  const baseCmd = `mysql -h ${dbHost} -P ${dbPort} -u ${dbUser} ${passFlag}`;

  try {
    console.log('\n[1/3] Ensuring database exists...');
    execSync(`${baseCmd} -e "CREATE DATABASE IF NOT EXISTS \\\`${dbName}\\\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`, { stdio: 'pipe' });
    console.log(`   ✓ Database "${dbName}" is ready.`);
  } catch (err) {
    console.warn(`   ⚠️ Notice while creating database via CLI (it may already exist or need cPanel creation): ${err.message}`);
  }

  // Import schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    console.log('\n[2/3] Importing schema.sql tables...');
    try {
      execSync(`${baseCmd} ${dbName} < "${schemaPath}"`, { stdio: 'pipe' });
      console.log('   ✓ Schema tables successfully created or verified.');
    } catch (err) {
      console.warn(`   ⚠️ Notice importing schema.sql: ${err.message}`);
    }
  }

  // Seed Superadmin Accounts
  console.log('\n[3/3] Seeding Superadmin Accounts...');
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(superPassword, salt);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const accounts = [
    { email: 'mbarutech@gmail.com', name: 'RaphaMIS Master Superadmin' },
    { email: 'admin@raphamis.saaslink.tech', name: 'RaphaMIS System Admin' }
  ];

  if (env.SUPERADMIN_EMAIL && !accounts.some(a => a.email === env.SUPERADMIN_EMAIL)) {
    accounts.push({ email: env.SUPERADMIN_EMAIL, name: 'Configured Superadmin' });
  }

  for (const acc of accounts) {
    const sql = `
      INSERT INTO users (id, name, email, password, role, created_at, updated_at)
      VALUES (UUID(), '${acc.name}', '${acc.email}', '${hash}', 'Superadmin', '${now}', '${now}')
      ON DUPLICATE KEY UPDATE
        name = '${acc.name}',
        password = '${hash}',
        role = 'Superadmin',
        updated_at = '${now}';
    `;
    try {
      execSync(`${baseCmd} ${dbName} -e "${sql.replace(/\n/g, ' ')}"`, { stdio: 'pipe' });
      console.log(`   ✓ Seeded account: ${acc.email} | Password: ${superPassword}`);
    } catch (err) {
      console.warn(`   ⚠️ Could not insert ${acc.email} via CLI: ${err.message}`);
    }
  }

  console.log('\n================================================================');
  console.log('🎉 Database Setup & Seeding Complete!');
  console.log('   You can now log in at your website with:');
  console.log('   Email:    admin@raphamis.saaslink.tech OR mbarutech@gmail.com');
  console.log(`   Password: ${superPassword}`);
  console.log('================================================================\n');
}

run().catch(err => {
  console.error('\n❌ Fatal error in setup-database script:', err);
  process.exit(1);
});
