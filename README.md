# GIST AI - 基因信息智能助手

一个专注于胃肠道间质瘤（GIST）的智能化基因信息平台，结合人工智能技术提供专业的GIST相关查询和咨询服务。

## 功能特点

- 🤖 **GIST智能助手** - 专业的GIST辅助AI，支持流式输出和Markdown渲染
- 🧬 **GIST基因筛选** - 筛选GIST相关基因，直达PubMed AI查看研究文献
- 🗄️ **GIST数据库** - 集成外部专业数据库，配备浮动AI助手
- 🔍 **快速基因查询** - 一键查询任意基因的GIST相关研究
- 🎨 **双页面导航** - 主页面与数据库页面无缝切换
- 📱 **响应式设计** - 现代化UI，适配各种设备

## 技术栈

- **前端**: React + TypeScript + Vite + React Router + Markdown渲染
- **后端**: Node.js + Express + 火山方舟API
- **数据源**: PubMed AI, GIST专业数据库

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

1. 复制环境变量示例文件：
```bash
cp backend/.env.example backend/.env
```

2. 编辑 `backend/.env` 文件，填入你的API配置：
```env
PORT=8000
ARK_API_KEY=your_api_key_here
ARK_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
ARK_MODEL_ID=deepseek-v3-250324
```

**注意**：请确保你的API key有效且有足够的额度。

## 生产环境部署

### 京东云Ubuntu服务器部署指南

#### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install -y curl wget git build-essential

# 安装Node.js 18+ (推荐使用NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### 2. 代码部署

```bash
# 克隆项目
git clone https://github.com/youngfly93/GIST_web.git
cd GIST_web

# 安装依赖
npm run install:all

# 配置环境变量
cp backend/.env.example backend/.env
# 编辑.env文件，填入你的火山方舟API配置
nano backend/.env
```

#### 3. 构建前端

```bash
cd frontend
npm run build
cd ..
```

#### 4. 使用PM2进程管理

```bash
# 安装PM2
sudo npm install -g pm2

# 启动后端服务
pm2 start backend/src/index.js --name "gist-backend"

# 设置开机自启
pm2 startup
pm2 save
```

#### 5. Nginx配置

```bash
# 安装Nginx
sudo apt install -y nginx

# 创建配置文件
sudo nano /etc/nginx/sites-available/gist-ai
```

Nginx配置内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或IP

    # 前端静态文件
    location / {
        root /path/to/GIST_web/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/gist-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. 防火墙配置

```bash
# 允许HTTP和HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

#### 7. SSL证书配置（可选但推荐）

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com
```

### 开发模式部署

如果只是开发测试，可以直接运行：

```bash
# 后台运行后端
nohup npm run dev:backend > backend.log 2>&1 &

# 另一个终端运行前端
npm run dev:frontend
```

### 监控和维护

```bash
# 查看PM2状态
pm2 status
pm2 logs gist-backend

# 重启服务
pm2 restart gist-backend

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 更新代码
git pull origin main
npm run install:all
cd frontend && npm run build && cd ..
pm2 restart gist-backend
```

### 性能优化建议

- 使用 CDN 加速静态资源
- 启用 Gzip 压缩
- 配置适当的缓存策略
- 监控服务器资源使用情况

## 开发计划

- [x] GIST专业AI助手集成
- [x] 流式输出和Markdown渲染
- [x] GIST基因筛选功能
- [x] 双页面导航系统
- [x] 浮动AI聊天窗口
- [ ] 用户认证和会话管理
- [ ] 数据可视化图表
- [ ] 多语言支持
- [ ] 更多GIST数据源集成
- [ ] 离线模式支持

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 常见问题

### Q: 如何获取火山方舟API密钥？
A: 访问 [火山方舟控制台](https://console.volcengine.com/ark) 注册并创建API密钥。

### Q: 为什么AI无法回复？
A: 请检查：
- API密钥是否正确配置
- 网络连接是否正常
- API额度是否充足
- 模型ID是否匹配

### Q: 如何自定义GIST数据库地址？
A: 修改 `frontend/src/pages/GistDatabase.tsx` 中的iframe src地址。

## 技术支持

- 🐛 **Bug报告**: [GitHub Issues](https://github.com/youngfly93/GIST_web/issues)
- 💡 **功能建议**: [GitHub Discussions](https://github.com/youngfly93/GIST_web/discussions)
- 📧 **联系邮箱**: 请通过GitHub联系

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件