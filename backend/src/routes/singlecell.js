import express from 'express';
import singleCellService from '../services/singleCellService.js';

const router = express.Router();

// 基因信息查询
router.post('/query', async (req, res) => {
  try {
    console.log('=== Single-cell Query Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { gene, dataset } = req.body;
    
    if (!gene) {
      return res.status(400).json({
        error: 'Gene parameter is required',
        message: 'Please provide a gene symbol for query'
      });
    }
    
    const result = await singleCellService.queryGeneInfo(gene, dataset);
    
    console.log('Single-cell query completed successfully');
    res.json(result);
    
  } catch (error) {
    console.error('Single-cell query failed:', error);
    res.status(500).json({
      error: error.message,
      endpoint: '/singlecell/query'
    });
  }
});

// Violin Plot 分析
router.post('/violin', async (req, res) => {
  try {
    console.log('=== Single-cell Violin Plot Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { gene, dataset } = req.body;
    
    if (!gene) {
      return res.status(400).json({
        error: 'Gene parameter is required',
        message: 'Please provide a gene symbol for violin plot analysis'
      });
    }
    
    const result = await singleCellService.generateViolinPlot(gene, dataset);
    
    console.log('Single-cell violin plot completed successfully');
    res.json(result);
    
  } catch (error) {
    console.error('Single-cell violin plot failed:', error);
    res.status(500).json({
      error: error.message,
      endpoint: '/singlecell/violin'
    });
  }
});

// UMAP 分析 - 支持两种模式
router.post('/umap', async (req, res) => {
  try {
    console.log('=== Single-cell UMAP Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { mode, gene, dataset } = req.body;
    
    if (!mode || !['celltype', 'expression'].includes(mode)) {
      return res.status(400).json({
        error: 'Invalid mode parameter',
        message: 'Mode must be either "celltype" or "expression"'
      });
    }
    
    let result;
    
    if (mode === 'celltype') {
      result = await singleCellService.generateUMAPCelltype(dataset);
    } else if (mode === 'expression') {
      if (!gene) {
        return res.status(400).json({
          error: 'Gene parameter is required for expression mode',
          message: 'Please provide a gene symbol for UMAP expression analysis'
        });
      }
      result = await singleCellService.generateUMAPExpression(gene, dataset);
    }
    
    console.log('Single-cell UMAP analysis completed successfully');
    res.json(result);
    
  } catch (error) {
    console.error('Single-cell UMAP analysis failed:', error);
    res.status(500).json({
      error: error.message,
      endpoint: '/singlecell/umap'
    });
  }
});

// UMAP 细胞类型图（独立端点，保持向后兼容）
router.post('/umap-celltype', async (req, res) => {
  try {
    console.log('=== Single-cell UMAP Celltype Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { dataset } = req.body;
    
    const result = await singleCellService.generateUMAPCelltype(dataset);
    
    console.log('Single-cell UMAP celltype analysis completed successfully');
    res.json(result);
    
  } catch (error) {
    console.error('Single-cell UMAP celltype analysis failed:', error);
    res.status(500).json({
      error: error.message,
      endpoint: '/singlecell/umap-celltype'
    });
  }
});

// UMAP 基因表达图（独立端点，保持向后兼容）
router.post('/umap-expression', async (req, res) => {
  try {
    console.log('=== Single-cell UMAP Expression Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { gene, dataset } = req.body;
    
    if (!gene) {
      return res.status(400).json({
        error: 'Gene parameter is required',
        message: 'Please provide a gene symbol for UMAP expression analysis'
      });
    }
    
    const result = await singleCellService.generateUMAPExpression(gene, dataset);
    
    console.log('Single-cell UMAP expression analysis completed successfully');
    res.json(result);
    
  } catch (error) {
    console.error('Single-cell UMAP expression analysis failed:', error);
    res.status(500).json({
      error: error.message,
      endpoint: '/singlecell/umap-expression'
    });
  }
});

// 综合分析
router.post('/comprehensive', async (req, res) => {
  try {
    console.log('=== Single-cell Comprehensive Analysis Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { gene, dataset } = req.body;
    
    if (!gene) {
      return res.status(400).json({
        error: 'Gene parameter is required',
        message: 'Please provide a gene symbol for comprehensive analysis'
      });
    }
    
    const result = await singleCellService.comprehensiveAnalysis(gene, dataset);
    
    console.log('Single-cell comprehensive analysis completed successfully');
    res.json(result);
    
  } catch (error) {
    console.error('Single-cell comprehensive analysis failed:', error);
    res.status(500).json({
      error: error.message,
      endpoint: '/singlecell/comprehensive'
    });
  }
});

// 健康检查
router.get('/health', async (req, res) => {
  try {
    console.log('=== Single-cell Health Check ===');
    
    const healthStatus = await singleCellService.getHealthStatus();
    
    console.log('Single-cell health check completed');
    res.json({
      status: 'healthy',
      service: 'single-cell-service',
      timestamp: new Date().toISOString(),
      details: healthStatus
    });
    
  } catch (error) {
    console.error('Single-cell health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      service: 'single-cell-service',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// 获取可用数据集信息
router.get('/datasets', async (req, res) => {
  try {
    console.log('=== Single-cell Datasets Info Request ===');
    
    const datasets = await singleCellService.getAvailableDatasets();
    
    console.log('Single-cell datasets info retrieved successfully');
    res.json({
      status: 'success',
      datasets: datasets,
      total_datasets: datasets.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Single-cell datasets info failed:', error);
    res.status(500).json({
      error: error.message,
      endpoint: '/singlecell/datasets'
    });
  }
});

// 批量分析（用于工具调用）
router.post('/batch', async (req, res) => {
  try {
    console.log('=== Single-cell Batch Analysis Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { analyses } = req.body;
    
    if (!analyses || !Array.isArray(analyses)) {
      return res.status(400).json({
        error: 'Invalid analyses parameter',
        message: 'analyses must be an array of analysis requests'
      });
    }
    
    const results = [];
    
    for (const analysis of analyses) {
      try {
        const { function_type, gene, dataset } = analysis;
        let result;
        
        switch (function_type) {
          case 'query':
            result = await singleCellService.queryGeneInfo(gene, dataset);
            break;
          case 'violin_plot':
            result = await singleCellService.generateViolinPlot(gene, dataset);
            break;
          case 'umap_celltype':
            result = await singleCellService.generateUMAPCelltype(dataset);
            break;
          case 'umap_expression':
            result = await singleCellService.generateUMAPExpression(gene, dataset);
            break;
          case 'comprehensive':
            result = await singleCellService.comprehensiveAnalysis(gene, dataset);
            break;
          default:
            result = {
              status: 'error',
              message: `Unknown function type: ${function_type}`
            };
        }
        
        results.push({
          analysis: analysis,
          result: result,
          success: result.status !== 'error'
        });
        
      } catch (error) {
        results.push({
          analysis: analysis,
          result: {
            status: 'error',
            message: error.message
          },
          success: false
        });
      }
    }
    
    console.log('Single-cell batch analysis completed');
    res.json({
      status: 'completed',
      total_analyses: analyses.length,
      successful_analyses: results.filter(r => r.success).length,
      results: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Single-cell batch analysis failed:', error);
    res.status(500).json({
      error: error.message,
      endpoint: '/singlecell/batch'
    });
  }
});

export default router;