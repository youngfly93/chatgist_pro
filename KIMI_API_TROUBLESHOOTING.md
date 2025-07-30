# Kimi API 401错误解决指南

## 错误描述
```
Request failed with status code 401
API认证失败，请检查API Key是否正确。
```

## 解决步骤

### 1. 验证API Key

**测试脚本**：
```bash
cd backend
node test-kimi-direct.js
```

这将：
- 显示API Key是否正确加载
- 直接测试Kimi API连接
- 显示详细错误信息

### 2. 检查API Key格式

确保您的API Key：
- 以 `sk-` 开头
- 长度正确（通常是40-50个字符）
- 没有多余的空格或换行符

### 3. 验证环境变量

检查 `.env` 文件：
```env
USE_KIMI=true
KIMI_API_KEY=sk-PxUPaKGpVFglkjugMHKj1ZTfbF584KeYgknI20R1Ps2qAs8u
```

### 4. 模型名称

Kimi支持的模型：
- `moonshot-v1-8k` - 8K上下文（默认）
- `moonshot-v1-32k` - 32K上下文
- `moonshot-v1-128k` - 128K上下文

### 5. 检查账户状态

登录 [Kimi开放平台](https://platform.moonshot.ai/) 检查：
- API Key是否有效
- 账户余额是否充足
- API权限是否正常

## 常见原因

### 原因1：API Key无效
- **症状**：401错误
- **解决**：重新生成API Key

### 原因2：模型名称错误
- **症状**：400或404错误
- **解决**：使用正确的模型名称

### 原因3：请求格式错误
- **症状**：400错误
- **解决**：检查请求体格式

### 原因4：额度用尽
- **症状**：402或429错误
- **解决**：充值或等待额度恢复

## 调试命令

### 查看当前配置
```bash
# Windows PowerShell
Get-Content .env | Select-String "KIMI"

# 或直接查看
type .env | findstr KIMI
```

### 测试API连接
```bash
# 使用curl测试（需要手动替换YOUR_API_KEY）
curl https://api.moonshot.ai/v1/chat/completions ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_API_KEY" ^
  -d "{\"model\": \"moonshot-v1-8k\", \"messages\": [{\"role\": \"user\", \"content\": \"Hello\"}]}"
```

## 临时解决方案

如果Kimi API持续有问题，可以快速切换回火山方舟：

1. 编辑 `.env`：
```env
USE_KIMI=false
```

2. 重启后端服务：
```bash
npm run dev
```

## 配置建议

### 添加多模型支持

在 `.env` 中添加：
```env
# Kimi模型选择
KIMI_MODEL=moonshot-v1-8k  # 或 moonshot-v1-32k, moonshot-v1-128k
```

然后在 `chat.js` 中使用：
```javascript
const modelId = isKimi ? (process.env.KIMI_MODEL || 'moonshot-v1-8k') : ...
```

## 日志查看

启动后端时会显示：
```
Calling AI API: Kimi
API URL: https://api.moonshot.ai/v1/chat/completions
Using model: moonshot-v1-8k
Kimi API Key (first 10 chars): sk-PxUPaKG...
Kimi API Key length: 48
```

## 联系支持

如果问题持续：
1. 检查 [Kimi状态页面](https://platform.moonshot.ai/status)
2. 联系Kimi技术支持
3. 查看 [API文档](https://platform.moonshot.ai/docs)