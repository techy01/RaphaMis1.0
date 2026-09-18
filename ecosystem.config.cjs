module.exports = {
  apps: [
    {
      name: 'raphamis-frontend',
      script: 'npx',
      args: 'vite preview --port 3000 --host 0.0.0.0',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'raphamis-backend',
      cwd: './backend',
      script: 'dist/src/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
        API_PREFIX: 'api',
        SUPERADMIN_EMAIL: 'mbarutech@gmail.com',
        REDIS_HOST: '127.0.0.1',
        REDIS_PORT: 6379,
        CORS_ALLOWED_ORIGINS: 'http://localhost:3000,http://127.0.0.1:3000'
      }
    }
  ]
};
