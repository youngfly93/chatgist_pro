# R脚本日志查看指南

## 日志位置总览

### 1. **实时日志 - Node.js后端控制台**

这是查看R执行情况的主要方式。当您运行后端服务时：

```bash
cd backend
npm run dev
```

控制台会显示：
- R脚本执行命令
- 工作目录
- 执行结果
- 错误信息

示例输出：
```
=== PHOSPHO SERVICE EXECUTION ===
R Script Path: F:\work\claude_code\GIST_web\GIST_Phosphoproteomics\phospho_api.R
Working Directory: F:\work\claude_code\GIST_web\GIST_Phosphoproteomics
Command: Rscript phospho_api.R --function="query" --gene="KIT"
Script exists: true
Working dir exists: true
=== R SCRIPT EXECUTION COMPLETE ===
R script stdout length: 567
R script stdout (first 500 chars): {"status":"success","data":{...},"message":"Found 3 phosphorylation sites for KIT"}
Successfully parsed JSON result
```

### 2. **R脚本日志文件**

我已经更新了`phospho_api.R`，现在会生成详细的日志文件：

**日志文件位置**：
```
F:\work\claude_code\GIST_web\GIST_Phosphoproteomics\phospho_api_YYYYMMDD_HHMMSS.log
```

**查看最新日志**：
```bash
cd F:\work\claude_code\GIST_web\GIST_Phosphoproteomics
Rscript view_logs.R
```

**日志内容示例**：
```
[2024-01-30 10:15:30] === Phospho API Script Started ===
[2024-01-30 10:15:30] Working directory: F:/work/claude_code/GIST_web/GIST_Phosphoproteomics
[2024-01-30 10:15:30] Arguments: --function=query --gene=KIT
[2024-01-30 10:15:30] Function: query
[2024-01-30 10:15:30] Gene: KIT
[2024-01-30 10:15:30] Executing phosphorylation site query...
[2024-01-30 10:15:31] Found 3 phosphorylation sites for KIT
[2024-01-30 10:15:31] Final status: success
[2024-01-30 10:15:31] Final message: Found 3 phosphorylation sites for KIT
[2024-01-30 10:15:31] === Phospho API Script Completed ===
```

### 3. **Shiny应用日志**

如果您运行的是完整的Shiny应用：

```bash
cd GIST_Phosphoproteomics
Rscript start_app.R ai 4972
```

日志会显示在控制台，包括：
- 应用启动信息
- HTTP请求
- 错误和警告

### 4. **手动测试时的日志**

直接运行R脚本测试：
```bash
cd GIST_Phosphoproteomics
Rscript phospho_api.R --function="query" --gene="KIT"
```

输出会直接显示在控制台。

## 日志管理工具

### 查看日志
```bash
# 查看最新的5个日志文件
Rscript view_logs.R

# 使用系统命令查看特定日志
type phospho_api_*.log  # Windows
cat phospho_api_*.log   # Linux/Mac

# 查看最新日志
dir /B /O-D phospho_api_*.log | findstr /N "^" | findstr "^1:" > temp.txt && for /F "tokens=2 delims=:" %i in (temp.txt) do type %i  # Windows
ls -t phospho_api_*.log | head -1 | xargs cat  # Linux/Mac
```

### 清理日志
```bash
# 保留最新5个日志，删除其他
Rscript clean_logs.R
```

## 调试技巧

### 1. **增加详细日志**

如需更详细的日志，可以在`phospho_api.R`中添加：
```r
log_message("Debug: Variable value = " + paste(my_var))
```

### 2. **查看R包加载信息**

在`phospho_api.R`开头添加：
```r
# 显示包加载信息
options(verbose = TRUE)
```

### 3. **捕获所有警告**

```r
options(warn = 2)  # 将警告转为错误
# 或
options(warn = 1)  # 立即显示警告
```

### 4. **Windows特定查看方法**

在Windows PowerShell中：
```powershell
# 查看最新日志
Get-ChildItem phospho_api_*.log | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content

# 实时监控日志（类似tail -f）
Get-Content (Get-ChildItem phospho_api_*.log | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName -Wait
```

## 常见问题

### Q: 为什么看不到日志文件？
A: 确保R脚本有写入权限，检查工作目录是否正确。

### Q: 日志文件太多怎么办？
A: 运行 `Rscript clean_logs.R` 清理旧日志。

### Q: 如何查看实时日志？
A: 主要通过Node.js后端控制台查看，这是最直接的方式。

### Q: R脚本执行但没有输出？
A: 检查：
1. R脚本路径是否正确
2. 工作目录是否正确
3. R包是否已安装
4. 查看stderr输出

## 日志文件格式

每个日志条目包含：
- **时间戳**: [YYYY-MM-DD HH:MM:SS]
- **日志级别**: 目前都是INFO级别
- **消息内容**: 具体的日志信息

## 最佳实践

1. **定期清理**: 避免日志文件累积过多
2. **错误追踪**: 发生错误时立即查看最新日志
3. **性能监控**: 通过时间戳计算各步骤耗时
4. **版本控制**: 不要将日志文件提交到Git