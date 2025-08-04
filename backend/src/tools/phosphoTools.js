// 磷酸化分析工具定义（Kimi Tool Calling 格式）

export const phosphoTools = [
  {
    type: "function",
    function: {
      name: "phospho_analysis",
      description: `执行GIST磷酸化蛋白质组学分析。支持多种分析类型：
- query: 查询基因的磷酸化位点
- boxplot_TvsN: 肿瘤vs正常组织对比
- boxplot_Risk: 风险分层分析
- boxplot_Gender: 性别差异分析
- boxplot_Age: 年龄相关分析
- boxplot_Location: 肿瘤位置分析
- boxplot_WHO: WHO分级分析
- boxplot_Mutation: 突变类型分析
- boxplot_TumorSize: 肿瘤大小分析
- boxplot_MitoticCount: 核分裂计数分析
- boxplot_IMResponse: 伊马替尼反应分析
- survival: 生存分析
- comprehensive: 综合分析（执行所有分析类型）`,
      parameters: {
        type: "object",
        properties: {
          function_type: {
            type: "string",
            enum: [
              "query",
              "boxplot_TvsN",
              "boxplot_Risk",
              "boxplot_Gender",
              "boxplot_Age",
              "boxplot_Location",
              "boxplot_WHO",
              "boxplot_Mutation",
              "boxplot_TumorSize",
              "boxplot_MitoticCount",
              "boxplot_IMResponse",
              "survival",
              "comprehensive"
            ],
            description: "分析类型"
          },
          gene: {
            type: "string",
            description: "基因名称，如KIT、PDGFRA、SDHA、SDHB、SDHC、SDHD、NF1、BRAF等"
          },
          site: {
            type: "string",
            description: "磷酸化位点（可选），格式如 KIT/S25、KIT/S742、KIT/T590 等。对于boxplot分析，如果不指定将使用第一个可用位点"
          },
          analysis_params: {
            type: "object",
            description: "特定分析的额外参数",
            properties: {
              cutoff: {
                type: "string",
                enum: ["Auto", "Median", "Q1", "Q3"],
                description: "生存分析的分组阈值（仅用于survival类型）"
              },
              survival_type: {
                type: "string",
                enum: ["OS", "PFS", "DFS"],
                description: "生存分析类型：OS(总生存期)、PFS(无进展生存期)、DFS(无病生存期)"
              }
            }
          }
        },
        required: ["function_type", "gene"]
      }
    }
  }
];

// 工具处理函数映射（供 toolService 使用）
export const toolHandlers = {
  phospho_analysis: 'phospho_analysis', // 实际处理在 toolService 中
  comprehensive_analysis: 'comprehensive_analysis'
};

// 工具使用示例（供AI参考）
export const toolExamples = [
  {
    user: "帮我查询KIT基因的磷酸化位点",
    tool_call: {
      name: "phospho_analysis",
      arguments: {
        function_type: "query",
        gene: "KIT"
      }
    }
  },
  {
    user: "分析KIT/S25位点在肿瘤和正常组织中的差异",
    tool_call: {
      name: "phospho_analysis",
      arguments: {
        function_type: "boxplot_TvsN",
        gene: "KIT",
        site: "KIT/S25"
      }
    }
  },
  {
    user: "对PDGFRA基因进行综合分析",
    tool_call: {
      name: "phospho_analysis",
      arguments: {
        function_type: "comprehensive",
        gene: "PDGFRA"
      }
    }
  },
  {
    user: "分析KIT基因S742位点的生存曲线",
    tool_call: {
      name: "phospho_analysis",
      arguments: {
        function_type: "survival",
        gene: "KIT",
        site: "KIT/S742",
        analysis_params: {
          cutoff: "Auto",
          survival_type: "OS"
        }
      }
    }
  }
];

// 辅助函数：生成工具描述文档
export function generateToolDocumentation() {
  const docs = phosphoTools.map(tool => {
    const func = tool.function;
    return `
### ${func.name}

**描述**: ${func.description}

**参数**:
${JSON.stringify(func.parameters, null, 2)}

**示例**:
${toolExamples.filter(e => e.tool_call.name === func.name)
  .map(e => `
用户: "${e.user}"
调用: ${JSON.stringify(e.tool_call, null, 2)}
`).join('\n')}
`;
  }).join('\n\n');
  
  return docs;
}

// 验证工具调用参数
export function validateToolCall(toolName, args) {
  const tool = phosphoTools.find(t => t.function.name === toolName);
  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  
  const params = tool.function.parameters;
  const required = params.required || [];
  
  // 检查必需参数
  for (const req of required) {
    if (!(req in args)) {
      throw new Error(`Missing required parameter: ${req}`);
    }
  }
  
  // 检查参数类型和枚举值
  for (const [key, value] of Object.entries(args)) {
    const paramDef = params.properties[key];
    if (!paramDef) {
      console.warn(`Unknown parameter: ${key}`);
      continue;
    }
    
    // 检查枚举值
    if (paramDef.enum && !paramDef.enum.includes(value)) {
      throw new Error(`Invalid value for ${key}: ${value}. Must be one of: ${paramDef.enum.join(', ')}`);
    }
    
    // 检查类型
    if (paramDef.type === 'string' && typeof value !== 'string') {
      throw new Error(`Parameter ${key} must be a string`);
    }
  }
  
  return true;
}