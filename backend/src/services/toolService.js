import phosphoService from './phosphoService.js';
import transcriptomeService from './transcriptomeService.js';
import singleCellService from './singleCellService.js';

class ToolService {
  constructor() {
    // 工具注册表
    this.tools = new Map();
    this.executionStats = new Map();
    
    // 注册默认工具
    this.registerDefaultTools();
  }
  
  /**
   * 注册工具
   */
  registerTool(name, handler, metadata = {}) {
    if (typeof handler !== 'function') {
      throw new Error(`Tool handler for ${name} must be a function`);
    }
    
    this.tools.set(name, {
      handler,
      metadata,
      registered: new Date()
    });
    
    console.log(`Tool registered: ${name}`);
  }
  
  /**
   * 执行工具
   */
  async executeTool(toolName, args) {
    const startTime = Date.now();
    
    console.log(`=== Executing Tool: ${toolName} ===`);
    console.log('Arguments:', JSON.stringify(args, null, 2));
    
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    
    try {
      // 执行工具
      const result = await tool.handler(args);
      
      // 记录执行统计
      this.recordExecution(toolName, {
        success: true,
        duration: Date.now() - startTime,
        timestamp: new Date()
      });
      
      console.log(`Tool ${toolName} executed successfully in ${Date.now() - startTime}ms`);
      console.log(`Tool ${toolName} result:`, JSON.stringify(result, null, 2));
      return result;
      
    } catch (error) {
      // 记录失败
      this.recordExecution(toolName, {
        success: false,
        duration: Date.now() - startTime,
        timestamp: new Date(),
        error: error.message
      });
      
      console.error(`Tool ${toolName} execution failed:`, error);
      throw error;
    }
  }
  
  /**
   * 批量执行工具（并行）
   */
  async executeToolsBatch(toolCalls) {
    const promises = toolCalls.map(({ name, args }) => 
      this.executeTool(name, args)
        .then(result => ({ name, args, result, success: true }))
        .catch(error => ({ name, args, error: error.message, success: false }))
    );
    
    return Promise.all(promises);
  }
  
  /**
   * 记录执行统计
   */
  recordExecution(toolName, stats) {
    if (!this.executionStats.has(toolName)) {
      this.executionStats.set(toolName, []);
    }
    
    const history = this.executionStats.get(toolName);
    history.push(stats);
    
    // 只保留最近100条记录
    if (history.length > 100) {
      history.shift();
    }
  }
  
  /**
   * 获取工具统计信息
   */
  getToolStats(toolName) {
    const history = this.executionStats.get(toolName) || [];
    if (history.length === 0) return null;
    
    const successful = history.filter(h => h.success).length;
    const failed = history.filter(h => !h.success).length;
    const avgDuration = history
      .filter(h => h.success)
      .reduce((sum, h) => sum + h.duration, 0) / (successful || 1);
    
    return {
      toolName,
      totalCalls: history.length,
      successful,
      failed,
      successRate: (successful / history.length * 100).toFixed(2) + '%',
      avgDuration: Math.round(avgDuration) + 'ms',
      lastCall: history[history.length - 1]
    };
  }
  
  /**
   * 获取所有工具列表
   */
  listTools() {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      metadata: tool.metadata,
      registered: tool.registered,
      stats: this.getToolStats(name)
    }));
  }
  
  /**
   * 注册默认工具
   */
  registerDefaultTools() {
    // 磷酸化分析工具
    this.registerTool('phospho_analysis', async (args) => {
      const { function_type, gene, site, ...params } = args;
      
      // 参数映射
      const analysisParams = {
        function: function_type,
        gene: gene
      };
      
      // 处理特定类型的参数
      if (function_type.startsWith('boxplot_') && site) {
        analysisParams.site = site;
      }
      
      if (function_type === 'survival') {
        analysisParams.site = site || params.analysis_params?.site;
        analysisParams.cutoff = params.analysis_params?.cutoff || 'Auto';
        analysisParams.survtype = params.analysis_params?.survival_type || 'OS';
      }
      
      // 调用 phosphoService
      return await phosphoService.analyze(analysisParams);
    }, {
      description: '执行GIST磷酸化蛋白质组学分析',
      category: 'analysis'
    });
    
    // 综合分析工具（特殊处理）
    this.registerTool('comprehensive_analysis', async (args) => {
      const { gene } = args;
      
      return await phosphoService.analyze({
        function: 'comprehensive',
        gene: gene
      });
    }, {
      description: '执行综合磷酸化分析，包含所有分析类型',
      category: 'analysis'
    });
    
    // 转录组分析工具
    this.registerTool('transcriptome_analysis', async (args) => {
      const { function_type, gene, gene2 } = args;

      // 处理综合分析
      if (function_type === 'comprehensive') {
        const result = await transcriptomeService.comprehensiveAnalysis(gene);

        // 为综合分析添加明确的状态信息
        const hasSuccessfulAnalyses = result.summary.successful > 0;
        const hasPlots = Object.values(result.analyses).some(analysis =>
          analysis && analysis.plot
        );

        return {
          ...result,
          status: hasSuccessfulAnalyses ? 'success' : 'partial',
          hasData: true,
          hasPlot: hasPlots,
          hasAnalyses: true,
          message: `${gene}基因综合转录组学分析完成。成功完成${result.summary.successful}项分析，${result.summary.failed}项分析遇到问题。`
        };
      }

      // 参数映射
      const analysisParams = {
        function: function_type,
        gene: gene
      };

      // 对于相关性分析，需要第二个基因
      if (function_type === 'correlation' && gene2) {
        analysisParams.gene2 = gene2;
      }

      // 调用 transcriptomeService
      const result = await transcriptomeService.analyze(analysisParams);

      // 为单个分析添加状态信息
      return {
        ...result,
        hasData: !!result.data,
        hasPlot: !!result.plot,
        hasAnalyses: false
      };
    }, {
      description: '执行GIST转录组学分析',
      category: 'analysis'
    });
    
    // 单细胞分析工具
    this.registerTool('singlecell_analysis', async (args) => {
      const { function_type, gene, dataset } = args;
      
      // 综合分析处理
      if (function_type === 'comprehensive') {
        const result = await singleCellService.comprehensiveAnalysis(gene, dataset === 'auto' ? null : dataset);
        
        // 检查是否有成功的分析
        const hasSuccessfulAnalyses = Object.values(result).some(analysis => 
          analysis && analysis.status === 'success'
        );
        
        const hasPlots = Object.values(result).some(analysis =>
          analysis && analysis.image_base64
        );
        
        const comprehensiveResult = {
          ...result,
          status: hasSuccessfulAnalyses ? 'success' : 'partial',
          hasData: true,
          hasPlot: hasPlots,
          hasAnalyses: true,
          message: `${gene}基因单细胞分析完成。包含基本查询、小提琴图、UMAP细胞类型图和UMAP表达图。`
        };
        
        // 对comprehensive结果也进行规范化处理
        console.log('Comprehensive原始结果:', JSON.stringify(comprehensiveResult, null, 2));
        
        const needsNormalization = Object.values(comprehensiveResult).some(value => Array.isArray(value));
        const normalizedComprehensive = needsNormalization ? {
          ...comprehensiveResult,
          gene: Array.isArray(comprehensiveResult.gene) ? comprehensiveResult.gene[0] : comprehensiveResult.gene,
          dataset: Array.isArray(comprehensiveResult.dataset) ? comprehensiveResult.dataset[0] : comprehensiveResult.dataset,
          status: Array.isArray(comprehensiveResult.status) ? comprehensiveResult.status[0] : comprehensiveResult.status,
          message: Array.isArray(comprehensiveResult.message) ? comprehensiveResult.message[0] : comprehensiveResult.message
        } : comprehensiveResult;
        
        console.log('Comprehensive规范化后:', JSON.stringify(normalizedComprehensive, null, 2));
        
        return normalizedComprehensive;
      }
      
      // 单个分析类型处理
      let result;
      switch (function_type) {
        case 'query':
          result = await singleCellService.queryGeneInfo(gene, dataset === 'auto' ? null : dataset);
          break;
        case 'violin_plot':
          result = await singleCellService.generateViolinPlot(gene, dataset === 'auto' ? null : dataset);
          break;
        case 'umap_celltype':
          result = await singleCellService.generateUMAPCelltype(dataset === 'auto' ? null : dataset);
          break;
        case 'umap_expression':
          result = await singleCellService.generateUMAPExpression(gene, dataset === 'auto' ? null : dataset);
          break;
        default:
          throw new Error(`Unknown single-cell function type: ${function_type}`);
      }
      
      // 为单个分析添加状态信息
      // 处理 R Plumber API 返回的数组格式
      console.log('原始 R Plumber API 响应:', JSON.stringify(result, null, 2));
      
      // 检查是否需要规范化（任何字段是数组）
      const needsNormalization = Object.values(result).some(value => Array.isArray(value));
      
      const normalizedResult = needsNormalization ? {
        ...result,
        status: Array.isArray(result.status) ? result.status[0] : result.status,
        dataset: Array.isArray(result.dataset) ? result.dataset[0] : result.dataset,
        gene: Array.isArray(result.gene) ? result.gene[0] : result.gene,
        plot_type: Array.isArray(result.plot_type) ? result.plot_type[0] : result.plot_type,
        image_base64: Array.isArray(result.image_base64) ? result.image_base64[0] : result.image_base64,
        cell_types: Array.isArray(result.cell_types) && Array.isArray(result.cell_types[0]) ? result.cell_types[0] : result.cell_types,
        summary: Array.isArray(result.summary) ? result.summary[0] : result.summary
      } : result;
      
      console.log('规范化后结果:', JSON.stringify(normalizedResult, null, 2));
      
      const finalResult = {
        ...normalizedResult,
        hasData: !!normalizedResult.data || normalizedResult.status === 'success',
        hasPlot: !!normalizedResult.image_base64,
        hasAnalyses: false
      };
      
      console.log('最终处理结果:');
      console.log('- hasData:', finalResult.hasData);
      console.log('- hasPlot:', finalResult.hasPlot);  
      console.log('- status:', finalResult.status);
      console.log('- image_base64存在:', !!finalResult.image_base64);
      console.log('- image_base64类型:', typeof finalResult.image_base64);
      console.log('- image_base64长度:', finalResult.image_base64 ? finalResult.image_base64.length : 0);
      
      console.log('准备返回的最终结果:', JSON.stringify({
        hasData: finalResult.hasData,
        hasPlot: finalResult.hasPlot,
        status: finalResult.status,
        dataset: finalResult.dataset,
        gene: finalResult.gene
      }));
      
      return finalResult;
    }, {
      description: '执行GIST单细胞RNA测序分析',
      category: 'analysis'
    });
    
    // 数据查询工具（未来扩展）
    this.registerTool('gene_info', async (args) => {
      // 暂时返回模拟数据
      return {
        status: 'success',
        message: `基因 ${args.gene} 的基本信息`,
        data: {
          gene: args.gene,
          description: 'GIST相关基因',
          // 后续可以集成基因数据库
        }
      };
    }, {
      description: '查询基因基本信息',
      category: 'query'
    });
  }
}

// 导出单例
export default new ToolService();