const fs = require('fs');
const path = require('path');

// Helper to parse .env file dynamically
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }
  return env;
}

const rootEnv = parseEnvFile(path.join(__dirname, '.env'));
const backendEnv = parseEnvFile(path.join(__dirname, 'backend', '.env'));
const combinedEnv = { ...rootEnv, ...backendEnv };

// Extract ports from .env (supports PORT, BACKEND_PORT, FRONTEND_PORT)
const backendPort = Number(combinedEnv.BACKEND_PORT || combinedEnv.PORT || 3001);
const frontendPort = Number(
  combinedEnv.FRONTEND_PORT || 
  (combinedEnv.PORT && Number(combinedEnv.PORT) !== backendPort ? combinedEnv.PORT : 3000)
);

// Automatically synchronize .htaccess ports with the active .env settings
const htaccessPath = path.join(__dirname, '.htaccess');
if (fs.existsSync(htaccessPath)) {
  try {
    let htContent = fs.readFileSync(htaccessPath, 'utf8');
    htContent = htContent.replace(/http:\/\/127\.0\.0\.1:\d+\/api/g, `http://127.0.0.1:${backendPort}/api`);
    htContent = htContent.replace(/ws:\/\/127\.0\.0\.1:\d+/g, `ws://127.0.0.1:${backendPort}`);
    htContent = htContent.replace(/http:\/\/127\.0\.0\.1:\d+\/\$1/g, `http://127.0.0.1:${frontendPort}/$1`);
    fs.writeFileSync(htaccessPath, htContent, 'utf8');
    console.log(`[PM2 Ecosystem] Synchronized .htaccess proxy targets -> Backend: ${backendPort}, Frontend: ${frontendPort}`);
  } catch (err) {
    console.warn(`[PM2 Ecosystem] Warning updating .htaccess: ${err.message}`);
  }
}

module.exports = {
  apps: [
    {
      name: 'raphamis-frontend',
      script: 'serve-frontend.cjs',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        ...combinedEnv,
        NODE_ENV: combinedEnv.NODE_ENV || 'production',
        PORT: frontendPort,
        HOST: combinedEnv.HOST || '0.0.0.0'
      }
    },
    {
      name: 'raphamis-backend',
      cwd: './backend',
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        ...combinedEnv,
        NODE_ENV: combinedEnv.NODE_ENV || 'production',
        PORT: backendPort,
        HOST: combinedEnv.HOST || '0.0.0.0',
        API_PREFIX: combinedEnv.API_PREFIX || 'api',
        SUPERADMIN_EMAIL: combinedEnv.SUPERADMIN_EMAIL || 'admin@raphamis.saaslink.tech',
        REDIS_HOST: combinedEnv.REDIS_HOST || '127.0.0.1',
        REDIS_PORT: combinedEnv.REDIS_PORT || 6379,
        CORS_ALLOWED_ORIGINS: combinedEnv.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,https://raphamis.saaslink.tech'
      }
    }
  ]
};
