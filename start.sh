#!/bin/bash
npm run build
cd backend && npm run build
cd ..
pm2 start ecosystem.config.cjs
pm2 save
