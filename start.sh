#!/bin/bash
npm run build
cd backend && npm run build
cd ..
# Clean up any lingering old process instances to prevent port conflicts
pm2 delete raphamis-frontend raphamis-backend 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
