#!/bin/bash

echo "🚀 启动 GIST AI 项目..."

# 检查是否已安装依赖
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装依赖..."
    npm run install:all
fi

echo "✨ 启动前后端服务..."
npm run dev