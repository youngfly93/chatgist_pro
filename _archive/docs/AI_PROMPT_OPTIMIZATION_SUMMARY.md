# AI聊天提示词优化总结

## 优化目标

针对GIST（胃肠道间质瘤）AI分析系统的提示词进行全面优化，实现：
- **规范化**: 统一的提示词格式和结构
- **逻辑清晰化**: 明确的分析流程和判断逻辑
- **功能保持**: 不影响现有的分析功能

## 优化内容

### 1. 创建统一的提示词配置文件

**文件**: `backend/src/config/prompts.js`

#### 核心特性
- **模块化设计**: 将不同类型的提示词分离管理
- **可维护性**: 集中管理所有提示词，便于更新和维护
- **可扩展性**: 支持添加新的分析类型和提示词模板

#### 主要组件

##### 1.1 系统提示词 (SYSTEM_PROMPT_TOOL_CALLING)
```javascript
export const SYSTEM_PROMPT_TOOL_CALLING = `# GIST智能分析助手

## 身份定位
你是一名专业的胃肠道间质瘤（GIST）分子生物学智能助手...

## 核心能力
你可以使用以下专业分析工具：
- 磷酸化蛋白质组学分析 (phospho_analysis)
- 转录组学分析 (transcriptome_analysis)

## 分析策略
### 问题识别与工具选择
### 执行原则
...`;
```

**优化亮点**:
- 清晰的身份定位和能力描述
- 结构化的分析策略指导
- 明确的工具选择逻辑
- 专业的执行原则

##### 1.2 图像分析提示词模板 (IMAGE_ANALYSIS_PROMPT_TEMPLATE)
```javascript
export const IMAGE_ANALYSIS_PROMPT_TEMPLATE = {
  autoTriggered: (gene1, gene2, analysisType) => `...`,
  manual: (gene1, gene2, analysisType) => `...`,
  textBased: (gene1, gene2, analysisType) => `...`
};
```

**优化亮点**:
- 支持不同触发场景的提示词
- 参数化模板，提高复用性
- 结构化的分析要求

##### 1.3 分析类型映射 (ANALYSIS_TYPE_MAPPING)
```javascript
export const ANALYSIS_TYPE_MAPPING = {
  phospho: { ... },
  transcriptome: { ... }
};
```

**优化亮点**:
- 标准化分析类型名称
- 支持中英文映射
- 便于扩展新的分析类型

##### 1.4 基因信息库 (GIST_GENES_INFO)
```javascript
export const GIST_GENES_INFO = {
  'KIT': { fullName: '...', function: '...', role: '...' },
  'PDGFRA': { ... }
};
```

**优化亮点**:
- 提供基因背景知识
- 支持智能提示和解释
- 便于添加新的基因信息

### 2. 后端系统提示词优化

**文件**: `backend/src/routes/chat_v2.js`

#### 优化前
```javascript
content: `你是Kimi，一名专注于胃肠道间质瘤（GIST）分子遗传学、磷酸化蛋白质组学和转录组学的智能助手。

你可以使用以下工具进行真实的GIST数据分析：
...`
```

#### 优化后
```javascript
import { getSystemPrompt } from '../config/prompts.js';

content: getSystemPrompt('tool_calling')
```

**优化亮点**:
- 使用配置文件管理提示词
- 提高代码可维护性
- 支持动态切换不同类型的提示词

### 3. R模块提示词优化

#### 3.1 转录组模块优化

**文件**: `GIST_Transcriptome/modules/ai_chat_module.R`

##### 自动触发分析提示词
**优化前**:
```r
analysis_prompt <- paste0(
  "您好！我是GIST AI图片分析助手。我看到您刚刚生成了一张关于基因 ",
  plot_data$gene1, " 的", plot_data$analysisType, "分析图。..."
)
```

**优化后**:
```r
analysis_prompt <- paste0(
  "## GIST AI图像分析助手\n\n",
  "我注意到您刚刚生成了一张关于基因 **", plot_data$gene1, "**",
  " 的**", plot_data$analysisType, "分析图**。\n\n",
  "让我为您详细分析这张图表的科学意义："
)
```

##### 文本分析提示词
**优化前**:
```r
text_analysis_prompt <- paste0(
  "请分析这张GIST（胃肠道间质瘤）研究的基因表达分析图。",
  "基因: ", plot_data$gene1, "，分析类型: ", ...,
  "请从以下方面进行专业分析：..."
)
```

**优化后**:
```r
text_analysis_prompt <- paste0(
  "请基于GIST（胃肠道间质瘤）研究背景，分析**", plot_data$gene1, "**基因的**", display_type, "分析**。\n\n",
  "## 分析要求\n",
  "1. **基因功能**: 该基因在GIST中的一般生物学功能和意义\n",
  "2. **差异解释**: 不同组间表达差异的可能生物学机制\n",
  "3. **临床价值**: 临床相关性和潜在应用前景\n",
  "4. **研究局限**: 需要注意的研究局限性和改进方向\n\n",
  "请用中文回答，语言专业但通俗易懂。"
)
```

#### 3.2 磷酸化模块优化

**文件**: `GIST_Phosphoproteomics/modules/ai_chat_module.R`

##### 分析类型映射
```r
# 磷酸化分析类型映射
analysis_type_map <- list(
  "TvsN" = "肿瘤vs正常组织磷酸化",
  "Risk" = "风险分层磷酸化",
  "Gender" = "性别差异磷酸化",
  "Age" = "年龄分组磷酸化",
  "Location" = "肿瘤位置磷酸化",
  "WHO" = "WHO分级磷酸化",
  "Mutation" = "突变类型磷酸化",
  "survival" = "磷酸化生存分析"
)
```

##### 专业化提示词
```r
text_analysis_prompt <- paste0(
  "请基于GIST（胃肠道间质瘤）磷酸化蛋白质组学研究背景，分析**", plot_data$gene1, "**基因的**", display_type, "**。\n\n",
  "## 分析要求\n",
  "1. **蛋白功能**: 该蛋白在GIST中的磷酸化调控功能和信号通路作用\n",
  "2. **磷酸化机制**: 不同组间磷酸化差异的可能分子机制\n",
  "3. **临床价值**: 磷酸化标志物的诊断、治疗和预后价值\n",
  "4. **研究局限**: 需要注意的技术局限性和改进方向\n\n",
  "请用中文回答，语言专业但通俗易懂。"
)
```

## 优化效果

### 1. 规范化提升
- **统一格式**: 所有提示词采用一致的Markdown格式
- **标准结构**: 明确的分析维度和要求
- **专业术语**: 使用准确的生物医学术语

### 2. 逻辑清晰化
- **分层结构**: 从身份定位到具体执行的清晰层次
- **决策树**: 明确的工具选择和分析策略
- **执行原则**: 一次性完成、逻辑清晰、专业准确、用户友好

### 3. 功能保持
- **向后兼容**: 所有现有分析功能正常工作
- **参数传递**: 保持原有的参数结构和传递方式
- **输出格式**: 维持原有的分析结果格式

### 4. 可维护性增强
- **集中管理**: 所有提示词集中在配置文件中
- **模块化**: 不同类型的提示词分离管理
- **易于更新**: 修改提示词无需改动业务逻辑

## 技术实现

### 1. 配置文件架构
```
backend/src/config/prompts.js
├── SYSTEM_PROMPT_TOOL_CALLING      # 主系统提示词
├── IMAGE_ANALYSIS_PROMPT_TEMPLATE  # 图像分析模板
├── ANALYSIS_TYPE_MAPPING          # 分析类型映射
├── GIST_GENES_INFO               # 基因信息库
└── 辅助函数                       # 获取和处理函数
```

### 2. 集成方式
- **后端集成**: 通过ES6模块导入使用
- **R模块集成**: 直接在R代码中优化提示词字符串
- **参数化**: 支持动态参数替换

### 3. 扩展性设计
- **新分析类型**: 在映射表中添加新条目
- **新基因信息**: 在基因信息库中添加新条目
- **新提示词模板**: 在模板对象中添加新函数

## 使用指南

### 1. 添加新的分析类型
```javascript
// 在 ANALYSIS_TYPE_MAPPING 中添加
transcriptome: {
  'new_analysis': '新分析类型名称'
}
```

### 2. 更新系统提示词
```javascript
// 修改 SYSTEM_PROMPT_TOOL_CALLING 常量
export const SYSTEM_PROMPT_TOOL_CALLING = `...新的提示词内容...`;
```

### 3. 添加基因信息
```javascript
// 在 GIST_GENES_INFO 中添加
'NEW_GENE': {
  fullName: '基因全名',
  function: '功能描述',
  role: '在GIST中的作用'
}
```

## 后续优化建议

1. **多语言支持**: 添加英文版本的提示词
2. **动态优化**: 基于用户反馈动态调整提示词
3. **A/B测试**: 测试不同提示词版本的效果
4. **智能推荐**: 基于分析历史推荐最佳提示词
5. **用户定制**: 允许用户自定义提示词模板

## 总结

通过本次优化，GIST AI分析系统的提示词实现了：
- ✅ **规范化**: 统一的格式和结构
- ✅ **逻辑清晰化**: 明确的分析流程和决策逻辑  
- ✅ **功能保持**: 所有现有功能正常工作
- ✅ **可维护性**: 集中管理和模块化设计
- ✅ **可扩展性**: 支持未来功能扩展

这为系统的长期维护和功能扩展奠定了坚实的基础。
