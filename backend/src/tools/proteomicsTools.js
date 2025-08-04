/**
 * 蛋白质组学分析工具定义
 * 为AI工具调用系统提供蛋白质组学分析功能
 */

// 蛋白质组学分析工具定义
export const proteomicsAnalysisTool = {
  type: "function",
  function: {
    name: "proteomics_analysis",
    description: "分析GIST中蛋白质的表达模式、临床关联和生物学功能。支持多种分析类型包括临床特征关联、相关性分析和药物耐药性分析。",
    parameters: {
      type: "object",
      properties: {
        gene: {
          type: "string",
          description: "蛋白质ID或基因名称，如P4HA1、FN1、KIT等"
        },
        analysis_type: {
          type: "string",
          enum: [
            "query", "comprehensive", "TvsN", "Risk", "Gender", "Age", 
            "Tumor_Size", "Mitotic", "Location", "WHO", "Ki67", "CD34", 
            "Mutation", "drug_resistance", "correlation", "enrichment"
          ],
          description: "分析类型：query(基本查询)、comprehensive(综合分析)、TvsN(肿瘤vs正常)、Risk(风险等级)、Gender(性别)、Age(年龄)、Tumor_Size(肿瘤大小)、Mitotic(有丝分裂)、Location(位置)、WHO(WHO分级)、Ki67(Ki67表达)、CD34(CD34状态)、Mutation(突变状态)、drug_resistance(药物耐药性)、correlation(相关性分析)、enrichment(富集分析)",
          default: "comprehensive"
        },
        gene2: {
          type: "string",
          description: "第二个蛋白质ID，仅在相关性分析时需要",
          default: ""
        }
      },
      required: ["gene"]
    }
  }
};

// 蛋白质组学综合分析工具
export const proteomicsComprehensiveTool = {
  type: "function", 
  function: {
    name: "proteomics_comprehensive",
    description: "对指定蛋白质进行全面的蛋白质组学分析，包括多种临床特征关联分析、表达差异分析和功能预测。",
    parameters: {
      type: "object",
      properties: {
        gene: {
          type: "string",
          description: "蛋白质ID或基因名称"
        },
        analyses: {
          type: "array",
          items: {
            type: "string",
            enum: ["TvsN", "Risk", "Gender", "Age", "Location", "Drug_Resistance"]
          },
          description: "要执行的分析类型数组，默认包含主要分析",
          default: ["TvsN", "Risk", "Gender", "Age", "Location", "Drug_Resistance"]
        }
      },
      required: ["gene"]
    }
  }
};

// 蛋白质相关性分析工具
export const proteomicsCorrelationTool = {
  type: "function",
  function: {
    name: "proteomics_correlation", 
    description: "分析两个蛋白质之间的表达相关性，生成散点图和相关系数分析。",
    parameters: {
      type: "object",
      properties: {
        gene1: {
          type: "string",
          description: "第一个蛋白质ID"
        },
        gene2: {
          type: "string", 
          description: "第二个蛋白质ID"
        }
      },
      required: ["gene1", "gene2"]
    }
  }
};

// 蛋白质药物耐药性分析工具
export const proteomicsDrugResistanceTool = {
  type: "function",
  function: {
    name: "proteomics_drug_resistance",
    description: "分析蛋白质表达与伊马替尼药物耐药性的关系，评估作为生物标志物的潜力。",
    parameters: {
      type: "object", 
      properties: {
        gene: {
          type: "string",
          description: "蛋白质ID或基因名称"
        }
      },
      required: ["gene"]
    }
  }
};

// 蛋白质富集分析工具
export const proteomicsEnrichmentTool = {
  type: "function",
  function: {
    name: "proteomics_enrichment",
    description: "对指定蛋白质进行单基因富集分析，包括GSEA分析和传统富集分析（GO、KEGG、Reactome）。分析蛋白质的功能通路和生物学过程。",
    parameters: {
      type: "object",
      properties: {
        gene: {
          type: "string",
          description: "蛋白质ID或基因名称"
        },
        dataset: {
          type: "string",
          description: "数据集名称",
          default: "Sun's Study"
        },
        analysis_type: {
          type: "string",
          enum: ["enrichment", "gsea", "both"],
          description: "分析类型：enrichment(传统富集分析)、gsea(GSEA分析)、both(两者都做)",
          default: "both"
        },
        top_positive: {
          type: "number",
          description: "正相关基因数量",
          default: 50
        },
        top_negative: {
          type: "number", 
          description: "负相关基因数量",
          default: 50
        }
      },
      required: ["gene"]
    }
  }
};

// 所有蛋白质组学工具
export const proteomicsTools = [
  proteomicsAnalysisTool,
  proteomicsComprehensiveTool,
  proteomicsCorrelationTool,
  proteomicsDrugResistanceTool,
  proteomicsEnrichmentTool
];

// 工具处理函数映射
export const proteomicsToolHandlers = {
  proteomics_analysis: async (proteomicsService, params) => {
    const { gene, analysis_type = 'comprehensive', gene2 } = params;
    
    try {
      let result;
      
      switch (analysis_type) {
        case 'query':
          result = await proteomicsService.queryProtein(gene);
          break;
          
        case 'comprehensive':
          result = await proteomicsService.comprehensiveAnalysis(gene);
          break;
          
        case 'correlation':
          if (!gene2) {
            throw new Error('相关性分析需要提供第二个蛋白质ID');
          }
          result = await proteomicsService.correlationAnalysis(gene, gene2);
          break;
          
        case 'drug_resistance':
          result = await proteomicsService.drugResistanceAnalysis(gene);
          break;
          
        case 'enrichment':
          result = await proteomicsService.enrichmentAnalysis(gene, "Sun's Study", "both");
          break;
          
        default:
          // 其他分析类型作为箱线图分析处理
          result = await proteomicsService.boxplotAnalysis(gene, analysis_type);
          break;
      }
      
      return {
        success: true,
        data: result,
        analysisType: 'proteomics'
      };
      
    } catch (error) {
      console.error('蛋白质组学分析工具执行失败:', error);
      return {
        success: false,
        error: error.message,
        analysisType: 'proteomics'
      };
    }
  },

  proteomics_comprehensive: async (proteomicsService, params) => {
    const { gene, analyses } = params;
    
    try {
      const result = await proteomicsService.comprehensiveAnalysis(gene, analyses);
      
      return {
        success: true,
        data: result,
        analysisType: 'proteomics_comprehensive'
      };
      
    } catch (error) {
      console.error('蛋白质组学综合分析工具执行失败:', error);
      return {
        success: false,
        error: error.message,
        analysisType: 'proteomics_comprehensive'
      };
    }
  },

  proteomics_correlation: async (proteomicsService, params) => {
    const { gene1, gene2 } = params;
    
    try {
      const result = await proteomicsService.correlationAnalysis(gene1, gene2);
      
      return {
        success: true,
        data: result,
        analysisType: 'proteomics_correlation'
      };
      
    } catch (error) {
      console.error('蛋白质相关性分析工具执行失败:', error);
      return {
        success: false,
        error: error.message,
        analysisType: 'proteomics_correlation'
      };
    }
  },

  proteomics_drug_resistance: async (proteomicsService, params) => {
    const { gene } = params;
    
    try {
      const result = await proteomicsService.drugResistanceAnalysis(gene);
      
      return {
        success: true,
        data: result,
        analysisType: 'proteomics_drug_resistance'
      };
      
    } catch (error) {
      console.error('蛋白质药物耐药性分析工具执行失败:', error);
      return {
        success: false,
        error: error.message,
        analysisType: 'proteomics_drug_resistance'
      };
    }
  },

  proteomics_enrichment: async (proteomicsService, params) => {
    const { gene, dataset = "Sun's Study", analysis_type = "both", top_positive = 50, top_negative = 50 } = params;
    
    try {
      const result = await proteomicsService.enrichmentAnalysis(
        gene, dataset, analysis_type, top_positive, top_negative
      );
      
      return {
        success: true,
        data: result,
        analysisType: 'proteomics_enrichment'
      };
      
    } catch (error) {
      console.error('蛋白质富集分析工具执行失败:', error);
      return {
        success: false,
        error: error.message,
        analysisType: 'proteomics_enrichment'
      };
    }
  }
};

export default {
  tools: proteomicsTools,
  handlers: proteomicsToolHandlers
};