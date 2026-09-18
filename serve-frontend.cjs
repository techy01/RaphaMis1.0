const http = require('http');
const fs = require('fs');
const path = require('path');

// Helper to parse .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
  const res = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      res[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return res;
}

const fileEnv = loadEnv();
const PORT = process.env.PORT || fileEnv.FRONTEND_PORT || 3000;
const HOST = process.env.HOST || fileEnv.HOST || '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';

  let filePath = path.join(DIST_DIR, reqUrl);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // SPA fallback to index.html
      const fallbackPath = path.join(DIST_DIR, 'index.html');
      fs.stat(fallbackPath, (fallbackErr, fallbackStats) => {
        if (!fallbackErr && fallbackStats.isFile()) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          fs.createReadStream(fallbackPath).pipe(res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('RaphaMIS Frontend Build Not Found. Please run `npm run build` in the project root.');
        }
      });
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`✓ RaphaMIS Frontend Server listening on http://${HOST}:${PORT}`);
});
