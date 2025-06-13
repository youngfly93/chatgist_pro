# GIST AI - 基因信息智能助手

一个结合人工智能技术的基因信息平台，提供基因查询和AI问答功能。

## 功能特点

- 🧬 **基因信息查询** - 快速查询基因功能、结构和相关信息
- 🤖 **AI智能问答** - 与AI助手对话，获得专业的基因科学解答
- 🎨 **精美界面** - 现代化的UI设计，响应式布局

## 技术栈

- **前端**: React + TypeScript + Vite
- **后端**: Node.js + Express
- **API**: PubChem API, 火山方舟API（可选）

## 快速开始

### 方式一：一键启动（推荐）

```bash
# 安装所有依赖
npm run install:all

# 同时启动前后端
npm run dev
```

### 方式二：分别启动

1. **启动后端服务**

```bash
cd backend
npm install
npm run dev
```

后端服务将在 http://localhost:8000 运行

2. **启动前端应用**

```bash
cd frontend
npm install
npm run dev
```

前端应用将在 http://localhost:5173 运行

## 项目结构

```
GIST_web/
├─ frontend/              # React + Vite 前端
│  ├─ src/
│  │  ├─ pages/          # 页面组件
│  │  │  ├─ Home.tsx     # 首页
│  │  │  ├─ GeneInfo.tsx # 基因查询页
│  │  │  └─ AIChat.tsx   # AI对话页
│  │  ├─ components/     # 通用组件
│  │  └─ App.tsx         # 主应用组件
├─ backend/              # Node.js 后端
│  ├─ src/
│  │  ├─ routes/         # API路由
│  │  ├─ services/       # 业务逻辑
│  │  └─ index.js        # 服务器入口
└─ README.md

```

## 配置说明

### 火山方舟API配置

AI对话功能已配置火山方舟API。如需修改，请编辑 `backend/.env` 文件：

```env
ARK_API_KEY=your_api_key_here
ARK_API_URL=https://ark.volcengine.com/api/v3/chat/completions
```

**注意**：请确保你的API key有效且有足够的额度。当前使用的模型是 `ep-20241213150236-t724s`。

## 部署建议

- 使用 Docker 容器化部署
- 配置 Nginx 反向代理
- 启用 HTTPS
- 使用 CDN 加速静态资源

## 开发计划

- [ ] 添加用户认证系统
- [ ] 实现数据可视化功能
- [ ] 支持多语言
- [ ] 添加更多基因数据源

## 许可证

MIT