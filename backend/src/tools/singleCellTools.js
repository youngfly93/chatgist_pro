// 单细胞分析工具定义（Kimi Tool Calling 格式）

export const singleCellTools = [
  {
    type: "function",
    function: {
      name: "singlecell_analysis",
      description: `执行GIST单细胞RNA测序分析。支持多种分析类型：
- query: 查询基因表达信息和细胞类型
- violin_plot: 生成基因在不同细胞类型中的表达violin图
- umap_celltype: 生成UMAP降维图，按细胞类型着色
- umap_expression: 生成UMAP降维图，按基因表达水平着色
- comprehensive: 综合分析（执行所有分析类型）

支持的数据集：
- In_house: 内部GIST单细胞数据（优先级最高）
- GSE254762: 公开数据集GSE254762
- GSE162115: 公开数据集GSE162115
- auto: 自动选择最佳数据集（默认）`,
      parameters: {
        type: "object",
        properties: {
          function_type: {
            type: "string",
            enum: [
              "query",
              "violin_plot", 
              "umap_celltype",
              "umap_expression",
              "comprehensive"
            ],
            description: "分析类型"
          },
          gene: {
            type: "string",
            description: "基因名称（如KIT、PDGFRA、TP53、MCM7等）。对于umap_celltype分析，此参数可选"
          },
          dataset: {
            type: "string",
            enum: ["In_house", "GSE254762", "GSE162115", "auto"],
            description: "数据集选择，auto为自动选择最佳数据集（默认）"
          }
        },
        required: ["function_type"],
        additionalProperties: false
      }
    }
  }
];

// 工具处理器
export const toolHandlers = {
  singlecell_analysis: async (args) => {
    const singleCellService = (await import('../services/singleCellService.js')).default;
    
    const { function_type, gene, dataset } = args;
    
    console.log('=== Single-cell Analysis Tool Called ===');
    console.log('Function Type:', function_type);
    console.log('Gene:', gene);
    console.log('Dataset:', dataset);
    
    try {
      let result;
      
      switch (function_type) {
        case 'query':
          if (!gene) {
            return {
              status: 'error',
              message: 'Gene parameter is required for query analysis'
            };
          }
          result = await singleCellService.queryGeneInfo(gene, dataset === 'auto' ? null : dataset);
          break;
          
        case 'violin_plot':
          if (!gene) {
            return {
              status: 'error', 
              message: 'Gene parameter is required for violin plot analysis'
            };
          }
          result = await singleCellService.generateViolinPlot(gene, dataset === 'auto' ? null : dataset);
          break;
          
        case 'umap_celltype':
          result = await singleCellService.generateUMAPCelltype(dataset === 'auto' ? null : dataset);
          break;
          
        case 'umap_expression':
          if (!gene) {
            return {
              status: 'error',
              message: 'Gene parameter is required for UMAP expression analysis'
            };
          }
          result = await singleCellService.generateUMAPExpression(gene, dataset === 'auto' ? null : dataset);
          break;
          
        case 'comprehensive':
          if (!gene) {
            return {
              status: 'error',
              message: 'Gene parameter is required for comprehensive analysis'
            };
          }
          result = await singleCellService.comprehensiveAnalysis(gene, dataset === 'auto' ? null : dataset);
          break;
          
        default:
          return {
            status: 'error',
            message: `Unknown function type: ${function_type}`
          };
      }
      
      console.log('Single-cell analysis completed successfully');
      return result;
      
    } catch (error) {
      console.error('Single-cell analysis failed:', error);
      return {
        status: 'error',
        message: error.message,
        function_type,
        gene,
        dataset
      };
    }
  }
};

// 默认导出
export default {
  tools: singleCellTools,
  handlers: toolHandlers
};