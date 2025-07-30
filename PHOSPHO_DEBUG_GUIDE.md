# 磷酸化分析集成调试指南

## 如何判断R脚本是否执行

### 1. 查看后端控制台日志

当您发送磷酸化分析请求时，后端控制台会显示详细的执行日志：

```
=== PHOSPHO ANALYSIS DETECTED ===
Gene: KIT
Full request: {
  "gene": "KIT",
  "analyses": {
    "phosphoproteome": "boxplot_TvsN",
    ...
  }
}

=== EXECUTING PHOSPHO ANALYSIS ===
Function: boxplot_TvsN
Gene: KIT

=== PHOSPHO SERVICE EXECUTION ===
R Script Path: /path/to/phospho_api.R
Working Directory: /path/to/GIST_Phosphoproteomics
Command: Rscript phospho_api.R --function="boxplot_TvsN" --gene="KIT"
Script exists: true
Working dir exists: true

=== R SCRIPT EXECUTION COMPLETE ===
R script stdout length: 1234
Successfully parsed JSON result
Phospho analysis completed: success
```

### 2. 检查前端响应

如果R脚本成功执行，前端会收到包含`phosphoAnalysis`字段的响应：

```javascript
{
  reply: "AI的文本回复...",
  phosphoAnalysis: {
    status: "success",
    message: "分析完成信息",
    plot: "data:image/png;base64,...", // base64编码的图片
    data: {...} // 分析数据
  }
}
```

### 3. 常见问题排查

#### 问题1: AI识别了请求但没有执行R脚本

**现象**：
- AI返回了JSON格式，但`phosphoAnalysis`为null
- 控制台显示"No phospho analysis request detected"

**原因**：
- AI返回的分析类型不在支持列表中（如"metastatic_phospho_signature"）
- JSON格式不正确

**解决方案**：
已在代码中添加了类型映射功能。

#### 问题2: R脚本路径错误

**现象**：
- 控制台显示`Script exists: false`
- 错误信息：`Error: spawn Rscript ENOENT`

**解决方案**：
检查`phosphoService.js`中的路径设置：
```javascript
this.rScriptPath = path.resolve('../../../GIST_web/GIST_Phosphoproteomics/phospho_api.R');
```

#### 问题3: R包未加载

**现象**：
- R script stderr显示包加载错误
- 错误信息包含"there is no package called"

**解决方案**：
确保在GIST_Phosphoproteomics目录下运行过应用，让包自动安装。

## 测试方法

### 方法1: 使用测试脚本

```bash
cd backend
node test-phospho-integration.js
```

### 方法2: 手动测试R脚本

```bash
cd ../../GIST_web/GIST_Phosphoproteomics
Rscript phospho_api.R --function="query" --gene="KIT"
```

### 方法3: 在聊天界面测试

发送以下消息：
- "查询KIT的磷酸化位点"
- "分析PDGFRA在肿瘤和正常组织的差异"
- "TP53的生存分析"

## AI提示词优化

为了让AI正确生成分析请求，可以在提示词中添加更多示例：

```json
{
  "gene": "基因名",
  "analyses": {
    "phosphoproteome": "分析类型",
    "transcriptome": "",
    "proteome": ""
  }
}
```

支持的分析类型：
- `query` - 磷酸化位点查询
- `boxplot_TvsN` - 肿瘤vs正常
- `boxplot_Risk` - 风险分析
- `boxplot_Gender` - 性别分析
- `boxplot_Age` - 年龄分析
- `boxplot_Location` - 位置分析
- `boxplot_WHO` - WHO分级
- `boxplot_Mutation` - 突变分析
- `survival` - 生存分析

## 监控执行状态

1. **开启后端详细日志**：
   在启动后端时设置环境变量：
   ```bash
   DEBUG=* npm run dev
   ```

2. **查看R脚本输出**：
   临时修改phospho_api.R，在开头添加：
   ```r
   cat("R script started at:", format(Sys.time()), "\n", file=stderr())
   ```

3. **检查临时文件**：
   R脚本会创建临时PNG文件，可以在系统临时目录查看。

## 性能优化建议

1. **缓存结果**：对相同的分析请求缓存结果
2. **预加载R环境**：使用Rserve或类似服务保持R会话
3. **异步处理**：对长时间运行的分析使用任务队列

## 故障恢复

如果集成完全失败，可以：

1. 直接在Shiny应用中使用磷酸化分析功能
2. 使用R脚本手动生成结果
3. 检查所有服务是否正常运行：
   - GIST_Phosphoproteomics (端口4972)
   - 后端API (端口8000)
   - 前端 (端口5173)