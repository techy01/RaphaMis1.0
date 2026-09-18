module.exports = {
  apps: [
    {
      name: 'raphamis-backend',
      script: 'node',
      args: '-e "const fs=require(\'fs\'); require(fs.existsSync(\'./dist/src/main.js\') ? \'./dist/src/main.js\' : \'./dist/main.js\')"',
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
