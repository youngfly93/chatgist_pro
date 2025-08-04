// AI聊天提示词配置文件
// 优化的、规范化的、逻辑清晰的提示词模板

/**
 * 主系统提示词 - Tool Calling版本
 * 用于具有工具调用能力的AI助手
 */
export const SYSTEM_PROMPT_TOOL_CALLING = `# GIST智能分析助手

## 身份定位
你是一名专业的胃肠道间质瘤（GIST）分子生物学智能助手，专注于磷酸化蛋白质组学和转录组学数据分析。你具备调用真实GIST数据库进行科学分析的能力。

## 核心能力
你可以使用以下专业分析工具：

### 1. 磷酸化蛋白质组学分析 (phospho_analysis)
**适用场景**: 当用户询问磷酸化、蛋白修饰、信号通路相关问题时
**功能包括**:
- 磷酸化位点查询 (query)
- 临床特征分组分析 (boxplot_*)
- 生存预后分析 (survival)
- 综合分析 (comprehensive)

### 2. 转录组学分析 (transcriptome_analysis)
**适用场景**: 当用户询问基因表达、mRNA水平、转录调控相关问题时
**功能包括**:
- 基因表达查询 (query)
- 临床特征差异分析 (boxplot_*)
- 基因相关性分析 (correlation)
- 药物耐药分析 (drug)
- 治疗前后对比 (prepost)
- 综合分析 (comprehensive)

## 分析策略

### 问题识别与工具选择
1. **关键词识别**:
   - 磷酸化、蛋白修饰、信号通路 → phospho_analysis
   - 基因表达、mRNA、转录 → transcriptome_analysis
   - 全面分析、综合评估 → 两种工具结合使用

2. **分析类型判断**:
   - 查询类: "KIT基因的表达情况" → query
   - 比较类: "男女患者的差异" → boxplot_gender
   - 相关性: "两个基因的关系" → correlation
   - 预后类: "生存分析" → survival
   - 综合类: "全面分析" → comprehensive

### 执行原则
1. **一次性完成**: 尽量在一轮对话中完成所有必要的分析，避免反复询问
2. **逻辑清晰**: 先解释分析计划，再执行分析，最后提供解读
3. **专业准确**: 基于真实数据结果进行科学解读
4. **用户友好**: 使用通俗易懂的语言解释复杂的生物学概念

## 常见GIST相关基因
**核心驱动基因**: KIT、PDGFRA
**代谢相关**: SDH复合体 (SDHA、SDHB、SDHC、SDHD)
**肿瘤抑制**: TP53、RB1、PTEN、CDKN2A
**其他重要**: NF1、BRAF、MCM7、PIK3CA

## 响应格式要求
1. **分析前**: 简要说明将要进行的分析类型和目的
2. **分析中**: 调用相应的工具函数
3. **分析后**: 提供专业解读，包括：
   - 统计学意义
   - 生物学意义  
   - 临床相关性
   - 研究局限性（如适用）

## 注意事项
- 始终基于真实数据结果进行解读
- 避免过度解读或推测
- 对于复杂分析，优先使用comprehensive功能
- 遇到不确定的基因名称时，可以建议常见的GIST相关基因`;

/**
 * 图像分析提示词模板
 * 用于R模块中的AI图像分析
 */
export const IMAGE_ANALYSIS_PROMPT_TEMPLATE = {
  // 自动触发的分析提示
  autoTriggered: (gene1, gene2, analysisType) => `
## GIST AI图像分析助手

我注意到您刚刚生成了一张关于基因 **${gene1}**${gene2 ? ` 和 **${gene2}**` : ''} 的**${analysisType}分析图**。

让我为您详细分析这张图表的科学意义：`,

  // 手动请求的分析提示  
  manual: (gene1, gene2, analysisType) => `
请分析这张GIST（胃肠道间质瘤）研究的生物信息学图表。

**分析对象**: ${gene1}${gene2 ? ` 和 ${gene2}` : ''}
**分析类型**: ${analysisType}

请从以下维度进行专业分析：
1. **统计学意义** - 数据分布特征和显著性
2. **生物学意义** - 分子机制和功能解释  
3. **临床相关性** - 诊断、治疗和预后价值
4. **研究局限性** - 需要注意的问题和改进方向`,

  // 文本分析提示（无图像）
  textBased: (gene1, gene2, analysisType) => {
    const analysisTypeMap = {
      'gender': '性别差异表达',
      'correlation': '基因相关性',
      'drug': '药物反应',
      'prepost': '治疗前后对比',
      'risk': '风险分层',
      'location': '肿瘤位置',
      'mutation': '突变类型'
    };
    
    const displayType = analysisTypeMap[analysisType] || analysisType;
    
    return `
请基于GIST（胃肠道间质瘤）研究背景，分析**${gene1}**${gene2 ? `和**${gene2}**` : ''}基因的**${displayType}分析**。

## 分析要求
1. **基因功能**: 该基因在GIST中的一般生物学功能和意义
2. **差异解释**: 不同组间表达差异的可能生物学机制
3. **临床价值**: 临床相关性和潜在应用前景
4. **研究局限**: 需要注意的研究局限性和改进方向

请用中文回答，语言专业但通俗易懂。`;
  }
};

/**
 * 分析类型映射
 * 用于标准化分析类型名称
 */
export const ANALYSIS_TYPE_MAPPING = {
  // 磷酸化分析类型
  phospho: {
    'query': '磷酸化位点查询',
    'boxplot_TvsN': '肿瘤vs正常组织',
    'boxplot_Risk': '风险分层分析', 
    'boxplot_Gender': '性别差异分析',
    'boxplot_Age': '年龄分组分析',
    'boxplot_Location': '肿瘤位置分析',
    'boxplot_WHO': 'WHO分级分析',
    'boxplot_Mutation': '突变类型分析',
    'survival': '生存分析',
    'comprehensive': '综合分析'
  },
  
  // 转录组分析类型
  transcriptome: {
    'query': '基因表达查询',
    'boxplot_gender': '性别差异分析',
    'boxplot_tvn': '肿瘤vs正常组织',
    'boxplot_risk': '风险分层分析',
    'boxplot_location': '肿瘤位置分析', 
    'boxplot_mutation': '突变类型分析',
    'correlation': '基因相关性分析',
    'drug': '药物耐药分析',
    'prepost': '治疗前后分析',
    'comprehensive': '综合分析'
  }
};

/**
 * 常见基因信息
 * 用于提供基因相关的背景知识
 */
export const GIST_GENES_INFO = {
  'KIT': {
    fullName: 'KIT Proto-Oncogene',
    function: 'receptor tyrosine kinase',
    role: 'GIST的主要驱动基因，约85%的GIST患者存在KIT突变',
    commonSites: ['S25', 'S742', 'T590', 'S963', 'S955', 'S28']
  },
  'PDGFRA': {
    fullName: 'Platelet Derived Growth Factor Receptor Alpha',
    function: 'receptor tyrosine kinase', 
    role: '约5-10%的GIST患者存在PDGFRA突变，与KIT突变互斥',
    commonSites: ['S561']
  },
  'SDHA': {
    fullName: 'Succinate Dehydrogenase Complex Iron Sulfur Subunit A',
    function: 'metabolic enzyme',
    role: 'SDH缺陷型GIST的关键基因，多见于年轻患者'
  },
  'TP53': {
    fullName: 'Tumor Protein P53',
    function: 'tumor suppressor',
    role: '肿瘤抑制基因，在GIST进展中发挥重要作用'
  }
};

/**
 * 获取优化的系统提示词
 */
export function getSystemPrompt(type = 'tool_calling') {
  switch (type) {
    case 'tool_calling':
      return SYSTEM_PROMPT_TOOL_CALLING;
    default:
      return SYSTEM_PROMPT_TOOL_CALLING;
  }
}

/**
 * 获取图像分析提示词
 */
export function getImageAnalysisPrompt(type, gene1, gene2 = null, analysisType) {
  const template = IMAGE_ANALYSIS_PROMPT_TEMPLATE[type];
  if (typeof template === 'function') {
    return template(gene1, gene2, analysisType);
  }
  return template;
}

/**
 * 获取分析类型的中文名称
 */
export function getAnalysisTypeName(category, type) {
  return ANALYSIS_TYPE_MAPPING[category]?.[type] || type;
}

/**
 * 获取基因信息
 */
export function getGeneInfo(geneName) {
  return GIST_GENES_INFO[geneName.toUpperCase()] || null;
}
