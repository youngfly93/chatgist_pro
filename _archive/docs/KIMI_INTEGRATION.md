# Kimi K2 AI助手集成指南

## 概述

本文档说明了如何将GIST_web应用的AI助手从火山方舟切换到Kimi K2，并保留了磷酸化分析功能。

## 特性

- **双AI支持**：可以灵活切换火山方舟和Kimi K2
- **磷酸化分析集成**：保持原有的R脚本调用功能
- **流式响应**：支持实时流式输出
- **图片分析**：支持多模态分析（如有需要）

## 配置方法

### 1. 环境变量设置

在 `backend/.env` 文件中配置：

```env
# 选择使用的AI服务 (true = Kimi, false = 火山方舟)
USE_KIMI=true

# Kimi API配置
KIMI_API_KEY=sk-PxUPaKGpVFglkjugMHKj1ZTfbF584KeYgknI20R1Ps2qAs8u

# 火山方舟API配置 (备用)
ARK_API_KEY=your_ark_api_key_here
ARK_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
ARK_MODEL_ID=deepseek-v3-250324
```

### 2. 切换AI服务

只需修改 `USE_KIMI` 的值：
- `true`：使用Kimi K2
- `false`：使用火山方舟

### 3. 启动服务

```bash
# 启动后端服务
cd backend
npm run dev

# 启动前端服务
cd frontend
npm run dev

# 启动磷酸化分析服务
cd ../../GIST_web/GIST_Phosphoproteomics
Rscript start_app.R ai 4972
```

## 测试

### 运行集成测试

```bash
cd backend
node test-kimi-integration.js
```

### 测试磷酸化分析

```bash
node test-phospho-integration.js
```

## API差异说明

### Kimi K2 特点

1. **模型名称**：`kimi-k2-0711-preview`
2. **API端点**：`https://api.moonshot.ai/v1/chat/completions`
3. **温度参数**：建议使用0.6（比火山方舟略低）
4. **系统提示词**：简化版本，更适合Kimi的风格

### 火山方舟特点

1. **模型名称**：`deepseek-v3-250324`
2. **API端点**：自定义配置
3. **温度参数**：使用0.7
4. **系统提示词**：详细版本

## 磷酸化分析功能

磷酸化分析功能与AI服务无关，两种AI都可以正常调用：

### 支持的分析类型

- `query` - 磷酸化位点查询
- `boxplot_TvsN` - 肿瘤vs正常
- `boxplot_Risk` - 风险分析
- `boxplot_Gender` - 性别分析
- `boxplot_Age` - 年龄分析
- `boxplot_Location` - 位置分析
- `boxplot_WHO` - WHO分级
- `boxplot_Mutation` - 突变分析
- `survival` - 生存分析

### 使用示例

1. **查询磷酸化位点**
   ```
   用户: 查询KIT的磷酸化位点
   AI: [识别并执行查询，返回位点列表]
   ```

2. **临床分析**
   ```
   用户: 分析PDGFRA在肿瘤和正常组织的差异
   AI: [执行分析并生成箱线图]
   ```

3. **生存分析**
   ```
   用户: TP53的生存分析
   AI: [生成KM曲线并解读]
   ```

## 监控和调试

### 查看日志

后端控制台会显示：
- 使用的AI服务（Kimi或ARK）
- API调用详情
- 磷酸化分析执行情况

### 关键日志标记

```
Calling AI API: Kimi
API URL: https://api.moonshot.ai/v1/chat/completions
Using model: kimi-k2-0711-preview
=== PHOSPHO ANALYSIS DETECTED ===
=== EXECUTING PHOSPHO ANALYSIS ===
```

## 故障恢复

### 切换回火山方舟

如果Kimi服务出现问题，可以快速切换回火山方舟：

1. 修改 `.env` 文件：`USE_KIMI=false`
2. 重启后端服务

### API Key更新

如需更新API Key：
1. 修改 `.env` 文件中的相应Key
2. 重启后端服务

## 性能对比

| 特性 | Kimi K2 | 火山方舟 |
|------|---------|----------|
| 响应速度 | 快 | 中等 |
| 中文理解 | 优秀 | 良好 |
| 专业术语 | 良好 | 良好 |
| 流式输出 | 支持 | 支持 |
| 成本 | 中等 | 较低 |

## 注意事项

1. **API限制**：注意Kimi的API调用限制
2. **敏感信息**：不要在代码中硬编码API Key
3. **错误处理**：两种AI的错误格式可能不同
4. **系统提示词**：可根据需要调整各自的提示词

## 后续优化建议

1. **工具调用**：探索Kimi的工具调用功能
2. **缓存机制**：对相同查询实现缓存
3. **负载均衡**：实现两种AI的自动切换
4. **监控告警**：添加API调用监控

## 联系支持

如遇到问题，请检查：
- API Key是否正确
- 网络连接是否正常
- 服务是否全部启动
- 日志中的错误信息