# Plumber API 使用指南

## 概述

Plumber API 是将 R 分析功能转换为 RESTful API 的解决方案，相比命令行执行方式具有更好的性能和可靠性。

## 优势

1. **性能提升**: 数据只加载一次，避免重复启动 R 进程
2. **更好的错误处理**: 使用 HTTP 状态码和结构化错误信息
3. **易于扩展**: 可以添加认证、限流等功能
4. **标准化接口**: RESTful API 更易于测试和文档化

## 快速开始

### 1. 安装依赖

```r
install.packages("plumber")
```

### 2. 启动服务

#### Windows
```bash
start_with_plumber.bat
```

#### Linux/Mac
```bash
./start_with_plumber.sh
```

这将：
- 启动 Plumber API 服务器（端口 8001）
- 自动设置环境变量启用 Plumber API
- 启动前后端服务

### 3. 单独启动 Plumber API

如果只想启动 Plumber API：

```bash
Rscript start_plumber_api.R
```

## API 端点

### 健康检查
```
GET http://localhost:8001/phospho/health
```

### 查询磷酸化位点
```
POST http://localhost:8001/phospho/query
Body: { "gene": "KIT" }
```

### 箱线图分析
```
POST http://localhost:8001/phospho/boxplot/TvsN
POST http://localhost:8001/phospho/boxplot/Risk
POST http://localhost:8001/phospho/boxplot/Gender
POST http://localhost:8001/phospho/boxplot/Age
POST http://localhost:8001/phospho/boxplot/Location
POST http://localhost:8001/phospho/boxplot/WHO
POST http://localhost:8001/phospho/boxplot/Mutation

Body: { 
  "gene": "KIT",
  "site": "KIT/S25"  // 可选
}
```

### 生存分析
```
POST http://localhost:8001/phospho/survival
Body: { 
  "gene": "KIT",
  "site": "KIT/S25",  // 可选
  "cutoff": "Auto",   // 可选，默认 "Auto"
  "survtype": "OS"    // 可选，默认 "OS"
}
```

### 综合分析
```
POST http://localhost:8001/phospho/comprehensive
Body: { "gene": "KIT" }
```

## 测试 API

```bash
node test_plumber_api.js
```

## 环境变量配置

在 `backend/.env` 中添加：

```env
# 启用 Plumber API
PLUMBER_API_ENABLED=true
PLUMBER_API_URL=http://localhost:8001
```

## 故障排除

### Plumber API 无法启动

1. 检查是否安装了 plumber 包：
   ```r
   install.packages("plumber")
   ```

2. 检查端口 8001 是否被占用：
   ```bash
   # Windows
   netstat -ano | findstr :8001
   
   # Linux/Mac
   lsof -i :8001
   ```

3. 查看错误日志

### API 调用失败

1. 确认 Plumber API 正在运行
2. 检查防火墙设置
3. 验证请求格式是否正确

## 性能对比

| 指标 | 命令行模式 | Plumber API |
|------|-----------|-------------|
| 启动时间 | ~3-5秒/请求 | ~50ms/请求 |
| 内存使用 | 每次重新加载 | 持久化加载 |
| 并发支持 | 受限 | 良好 |
| 错误处理 | 复杂 | 标准化 |

## 开发提示

1. Plumber API 支持 Swagger UI，访问 `http://localhost:8001/__docs__/` 查看 API 文档
2. 可以在 `phospho_plumber_api.R` 中添加新的端点
3. 使用 `pr$filter()` 添加中间件功能（如认证）
4. 考虑使用 PM2 或 systemd 管理 Plumber 进程