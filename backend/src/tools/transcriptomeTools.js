// 转录组分析工具定义
export const transcriptomeTools = [
  {
    type: "function",
    function: {
      name: "transcriptome_analysis",
      description: "执行GIST转录组学分析，包括基因表达查询、临床特征分析（性别、风险、肿瘤位置、突变类型等）、基因相关性分析、药物耐药分析和治疗前后分析",
      parameters: {
        type: "object",
        properties: {
          function_type: {
            type: "string",
            enum: [
              "query",
              "boxplot_gender",
              "boxplot_tvn",
              "boxplot_risk",
              "boxplot_location",
              "boxplot_mutation",
              "boxplot_age",
              "boxplot_tumorsize",
              "boxplot_grade",
              "correlation",
              "drug",
              "prepost",
              "comprehensive"
            ],
            description: `分析类型：
- query: 查询基因表达信息
- boxplot_gender: 性别差异分析
- boxplot_tvn: 肿瘤vs正常组织分析
- boxplot_risk: 风险分层分析
- boxplot_location: 肿瘤位置分析
- boxplot_mutation: 突变类型分析
- boxplot_age: 年龄分组分析
- boxplot_tumorsize: 肿瘤大小分析
- boxplot_grade: WHO分级分析
- correlation: 基因相关性分析（需要两个基因）
- drug: 药物耐药分析（伊马替尼）
- prepost: 治疗前后分析
- comprehensive: 综合分析（执行多个分析）`
          },
          gene: {
            type: "string",
            description: "要分析的基因符号（如 TP53, KIT, PDGFRA）"
          },
          gene2: {
            type: "string", 
            description: "第二个基因符号（仅用于相关性分析）"
          }
        },
        required: ["function_type", "gene"]
      }
    }
  }
];

// 获取工具定义的辅助函数
export function getTranscriptomeTools() {
  return transcriptomeTools;
}

// 验证工具参数的辅助函数
export function validateTranscriptomeParams(functionType, params) {
  // 验证必需的基因参数
  if (!params.gene || params.gene.trim() === '') {
    return { valid: false, error: '缺少必需的基因参数' };
  }
  
  // 对于相关性分析，需要第二个基因
  if (functionType === 'correlation' && (!params.gene2 || params.gene2.trim() === '')) {
    return { valid: false, error: '相关性分析需要提供第二个基因' };
  }
  
  // 验证分析类型
  const validTypes = [
    'query', 'boxplot_gender', 'boxplot_tvn', 'boxplot_risk',
    'boxplot_location', 'boxplot_mutation', 'boxplot_age',
    'boxplot_tumorsize', 'boxplot_grade', 'correlation',
    'drug', 'prepost', 'comprehensive'
  ];
  
  if (!validTypes.includes(functionType)) {
    return { valid: false, error: `不支持的分析类型: ${functionType}` };
  }
  
  return { valid: true };
}