# GIST磷酸化蛋白质组学AI集成指南

## 概述

本文档描述了如何使用AI聊天助手调用GIST_Phosphoproteomics的分析功能，实现智能化的磷酸化数据分析。

## 架构设计

```
用户 <-> 前端(React) <-> 后端API(Node.js) <-> R分析脚本 <-> 磷酸化数据
                            |
                            v
                        AI服务(火山方舟)
```

## 功能特性

### 支持的分析类型

1. **磷酸化位点查询** (`query`)
   - 查询特定蛋白的磷酸化位点
   - 显示在肿瘤和正常组织中的检出率

2. **临床特征分析**
   - 肿瘤vs正常 (`boxplot_TvsN`)
   - 风险分层 (`boxplot_Risk`)
   - 性别差异 (`boxplot_Gender`)
   - 年龄相关 (`boxplot_Age`)
   - 肿瘤位置 (`boxplot_Location`)
   - WHO分级 (`boxplot_WHO`)
   - 突变状态 (`boxplot_Mutation`)

3. **生存分析** (`survival`)
   - Kaplan-Meier生存曲线
   - 支持OS和DFS等多种生存类型

## 使用方法

### 1. 启动服务

```bash
# 启动完整应用栈
npm run dev:full:windows

# 或分别启动
# 1. 启动GIST_Phosphoproteomics (端口4972)
cd GIST_Phosphoproteomics
Rscript start_app.R ai 4972

# 2. 启动后端服务 (端口8000)
cd backend
npm run dev

# 3. 启动前端 (端口5173)
cd frontend
npm run dev
```

### 2. AI聊天交互示例

#### 示例1: 查询磷酸化位点
```
用户: 我想查询KIT的磷酸化位点
AI: 我将为您查询KIT蛋白的磷酸化位点信息...
[自动执行分析并返回结果表格]
```

#### 示例2: 肿瘤vs正常分析
```
用户: 分析一下PDGFRA在肿瘤和正常组织中的磷酸化水平差异
AI: 我将为您分析PDGFRA在肿瘤和正常组织中的磷酸化水平差异...
[自动生成箱线图并解读结果]
```

#### 示例3: 生存分析
```
用户: 研究TP53磷酸化水平对患者生存的影响
AI: 我将为您分析TP53磷酸化水平与患者生存的关系...
[自动生成KM曲线并解释临床意义]
```

## 技术实现细节

### 1. R脚本接口 (phospho_api.R)

```r
# 命令行调用示例
Rscript phospho_api.R --function="query" --gene="KIT"
Rscript phospho_api.R --function="boxplot_TvsN" --gene="PDGFRA"
Rscript phospho_api.R --function="survival" --gene="TP53" --cutoff="Auto" --survtype="OS"
```

返回JSON格式：
```json
{
  "status": "success",
  "data": {...},
  "plot": "data:image/png;base64,...",
  "message": "分析完成"
}
```

### 2. Node.js服务层 (phosphoService.js)

主要功能：
- 参数验证
- 执行R脚本
- 解析用户请求
- 错误处理

### 3. AI系统提示词

AI助手被配置为：
- 识别磷酸化分析相关关键词
- 提取基因名称
- 生成结构化的分析请求
- 解读分析结果

### 4. 前端展示

- 显示AI文本回复
- 渲染分析生成的图表
- 展示详细数据（可折叠）

## 测试

### 测试R脚本
```bash
cd GIST_Phosphoproteomics
Rscript test_phospho_api.R
```

### 测试Node.js服务
```bash
cd backend
node test/test-phospho-service.js
```

## 故障排除

### 常见问题

1. **找不到R脚本错误**
   - 确保R已正确安装并在PATH中
   - 检查工作目录路径设置

2. **分析超时**
   - 增加超时时间设置
   - 检查R包是否正确加载

3. **无法生成图表**
   - 确保数据文件存在
   - 检查基因名称是否正确

4. **AI无法识别分析请求**
   - 使用更明确的关键词
   - 直接指定基因名称

## 扩展开发

### 添加新的分析类型

1. 在`Phosphoproteomics.R`中添加新函数
2. 在`phospho_api.R`中添加相应的case处理
3. 更新`phosphoService.js`的supportedFunctions
4. 更新AI系统提示词以识别新的分析类型

### 优化建议

1. 实现结果缓存机制
2. 添加批量分析功能
3. 支持更多的可视化选项
4. 集成更多的统计分析方法

## 安全考虑

- 输入验证：防止命令注入
- 文件权限：限制R脚本访问
- API限流：防止滥用
- 数据隐私：确保患者数据安全

## 维护说明

定期检查：
- R包更新
- 数据文件完整性
- API服务状态
- 错误日志

## 联系方式

如有问题或建议，请联系开发团队。