# 🚀 ChatGIST Pro 完整启动指南

## 项目概述
ChatGIST Pro 是一个AI驱动的GIST研究平台，支持**四维分析**：
- 🟡 **磷酸化蛋白质组学** (端口8001)
- 🟢 **转录组学分析** (端口8002) 
- 🔵 **单细胞RNA-seq** (端口8003)
- 🟣 **蛋白质组学分析** (端口8004) ⭐ 包含富集分析

## 📋 启动前检查清单

### ✅ 1. 环境要求确认
- [x] Node.js >= 18 (当前: v22.15.0)
- [x] npm >= 8 (当前: 10.9.2)  
- [x] R >= 4.0 (当前: E:\R-4.4.1\)
- [ ] Git (用于代码管理)

### ✅ 2. 数据文件检查
确保以下数据文件存在：
```
chatgist_pro/
├── GIST_Phosphoproteomics/
│   └── Phosphoproteomics_list.RDS
├── GIST_Transcriptome/  
│   └── (转录组数据文件)
├── ChatGIST_ssc/
│   └── (单细胞数据文件)
└── GIST_Protemics/
    ├── Protemics_list.rds
    ├── GSEA_KEGG.gmt
    └── GSEA_hallmark.gmt
```

### ✅ 3. AI服务配置
需要配置Kimi AI API：
```env
USE_KIMI=true
KIMI_API_KEY=your_kimi_api_key_here
```

## 🔧 详细启动步骤

### 第一步：安装依赖
```bash
# 安装所有项目依赖
npm run install:all

# 或者分别安装
cd frontend && npm install
cd ../backend && npm install
```

### 第二步：环境配置
1. 复制环境配置文件：
```bash
cd backend
cp .env.example .env
```

2. 编辑 `backend/.env` 文件，配置你的API密钥：
```env
# AI服务配置 (必需)
USE_KIMI=true
KIMI_API_KEY=your_kimi_api_key_here

# Plumber API配置 (推荐启用)
PLUMBER_API_ENABLED=true
TRANSCRIPTOME_PLUMBER_ENABLED=true  
SINGLECELL_PLUMBER_ENABLED=true
PROTEOMICS_PLUMBER_ENABLED=true
```

### 第三步：启动服务

#### 🌟 方式一：完整四维分析 (推荐)
```bash
# 启动所有服务 (前端+后端+4个R分析API)
start_all_with_proteomics.bat
```

这会启动：
- ✅ 前端开发服务器 (http://localhost:5173)
- ✅ 后端API服务器 (http://localhost:8000)  
- ✅ 磷酸化分析API (http://localhost:8001)
- ✅ 转录组分析API (http://localhost:8002)
- ✅ 单细胞分析API (http://localhost:8003)
- ✅ 蛋白质组分析API (http://localhost:8004) ⭐

#### 🔧 方式二：基础版本 (仅前端+后端)
```bash
npm run dev
```

#### 🛠️ 方式三：逐个启动 (调试用)
```bash
# 1. 启动R分析服务
start_plumber_fixed.bat          # 磷酸化 (8001)
start_transcriptome_plumber.bat  # 转录组 (8002)  
start_singlecell_plumber.bat     # 单细胞 (8003)
start_proteomics_plumber.bat     # 蛋白质组 (8004)

# 2. 启动后端
cd backend && npm run dev

# 3. 启动前端  
cd frontend && npm run dev
```

## 🎯 启动成功标志

### 控制台输出检查
启动成功后，你应该看到：

**后端控制台:**
```
✅ Backend running on 0.0.0.0:8000
📡 API endpoints available:
   - /api/chat (Tool Calling)
   - /api/proteomics
✓ Plumber API 连接成功: http://localhost:8001
✓ Transcriptome Plumber API 连接成功: http://localhost:8002  
✓ Single-cell Plumber API 连接成功: http://localhost:8003
✓ Proteomics Plumber API 连接成功: http://localhost:8004
```

**前端控制台:**
```
VITE v6.3.5  ready in XXXms
➜  Local:   http://localhost:5173/
```

### 🌐 访问地址
- **主应用**: http://localhost:5173
- **API文档**: 
  - http://localhost:8001/__docs__/ (磷酸化)
  - http://localhost:8002/__docs__/ (转录组)
  - http://localhost:8003/__docs__/ (单细胞)  
  - http://localhost:8004/__docs__/ (蛋白质组)

## 🧪 功能测试

### 基础功能测试
1. 打开 http://localhost:5173
2. 在AI对话框中输入："KIT基因的蛋白质组学分析"
3. 检查右侧是否显示分析结果

### 四维分析测试
尝试以下问题：
```
"P4HA1蛋白的表达情况如何？"           # 蛋白质组学
"KIT基因的磷酸化位点分析"             # 磷酸化
"分析PDGFRA的转录组表达"             # 转录组学  
"单细胞中KIT基因的表达分布"           # 单细胞
"P4HA1蛋白的富集分析"                # 富集分析 ⭐
```

## 🔍 故障排除

### 常见问题

**问题1: Plumber API连接失败**
```
❌ Plumber API 连接失败，将回退到命令行模式
```
**解决方案:**
1. 检查对应的R服务是否启动
2. 验证数据文件是否存在
3. 检查端口是否被占用

**问题2: AI回复但无分析结果**
```
AI回复正常，但右侧面板显示"暂无分析结果"
```
**解决方案:**
1. 检查KIMI_API_KEY是否正确配置
2. 确认所有Plumber API服务正常运行
3. 查看浏览器控制台错误信息

**问题3: 前端无法访问**
```
This site can't be reached
```
**解决方案:**
1. 确认前端服务已启动 (npm run dev)
2. 检查端口5173是否被占用
3. 尝试访问其他端口 (5174, 5175)

### 🛠️ 调试命令
```bash
# 测试后端健康状态
curl http://localhost:8000/api/proteomics/health

# 测试Plumber API
curl http://localhost:8004/health

# 查看服务进程
tasklist | findstr node
tasklist | findstr Rscript
```

## 📚 更多功能

### R包依赖
如果Plumber API启动失败，可能需要安装R包：
```r
# 在R控制台中运行
install.packages(c(
  "plumber", "jsonlite", "base64enc", 
  "ggplot2", "dplyr", "Seurat", "patchwork",
  "clusterProfiler", "org.Hs.eg.db"
))
```

### 高级配置
- **修改端口**: 编辑相应的启动脚本
- **添加数据**: 将新数据文件放入对应目录
- **自定义分析**: 修改R分析脚本

## 🎉 开始使用

现在您可以：
1. 🔬 进行四维GIST分析研究
2. 🤖 与AI对话获取分析结果  
3. 📊 查看专业的可视化图表
4. 🧬 进行富集分析和通路研究

**访问主应用**: http://localhost:5173

祝您研究顺利！🎯