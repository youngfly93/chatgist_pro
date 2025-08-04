/**
 * 蛋白质组学分析 API 路由
 * 提供蛋白质组学数据分析的HTTP端点
 */

import express from 'express';
import ProteomicsService from '../services/proteomicsService.js';

const router = express.Router();
const proteomicsService = new ProteomicsService();

/**
 * 蛋白质基本信息查询
 * POST /api/proteomics/query
 */
router.post('/query', async (req, res) => {
  try {
    const { gene } = req.body;
    
    if (!gene) {
      return res.status(400).json({
        status: 'error',
        message: '请提供蛋白质ID',
        data: null,
        plot: null
      });
    }
    
    console.log('蛋白质查询请求:', { gene });
    const result = await proteomicsService.queryProtein(gene);
    
    res.json(result);
  } catch (error) {
    console.error('蛋白质查询错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
      data: null,
      plot: null
    });
  }
});

/**
 * 临床特征箱线图分析
 * POST /api/proteomics/boxplot
 */
router.post('/boxplot', async (req, res) => {
  try {
    const { gene, analysis_type = 'TvsN' } = req.body;
    
    if (!gene) {
      return res.status(400).json({
        status: 'error',
        message: '请提供蛋白质ID',
        data: null,
        plot: null
      });
    }
    
    console.log('箱线图分析请求:', { gene, analysis_type });
    const result = await proteomicsService.boxplotAnalysis(gene, analysis_type);
    
    res.json(result);
  } catch (error) {
    console.error('箱线图分析错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
      data: null,
      plot: null
    });
  }
});

/**
 * 蛋白质相关性分析
 * POST /api/proteomics/correlation
 */
router.post('/correlation', async (req, res) => {
  try {
    const { gene1, gene2 } = req.body;
    
    if (!gene1 || !gene2) {
      return res.status(400).json({
        status: 'error',
        message: '请提供两个蛋白质ID',
        data: null,
        plot: null
      });
    }
    
    console.log('相关性分析请求:', { gene1, gene2 });
    const result = await proteomicsService.correlationAnalysis(gene1, gene2);
    
    res.json(result);
  } catch (error) {
    console.error('相关性分析错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
      data: null,
      plot: null
    });
  }
});

/**
 * 药物耐药性分析
 * POST /api/proteomics/drug_resistance
 */
router.post('/drug_resistance', async (req, res) => {
  try {
    const { gene } = req.body;
    
    if (!gene) {
      return res.status(400).json({
        status: 'error',
        message: '请提供蛋白质ID',
        data: null,
        plot: null
      });
    }
    
    console.log('药物耐药性分析请求:', { gene });
    const result = await proteomicsService.drugResistanceAnalysis(gene);
    
    res.json(result);
  } catch (error) {
    console.error('药物耐药性分析错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
      data: null,
      plot: null
    });
  }
});

/**
 * 单基因富集分析
 * POST /api/proteomics/enrichment
 */
router.post('/enrichment', async (req, res) => {
  try {
    const { 
      gene, 
      dataset = "Sun's Study", 
      analysis_type = "both", 
      top_positive = 50, 
      top_negative = 50, 
      nperm = 1000 
    } = req.body;
    
    if (!gene) {
      return res.status(400).json({
        status: 'error',
        message: '请提供蛋白质ID',
        data: null,
        plot: null
      });
    }
    
    console.log('富集分析请求:', { gene, dataset, analysis_type, top_positive, top_negative, nperm });
    const result = await proteomicsService.enrichmentAnalysis(
      gene, dataset, analysis_type, top_positive, top_negative, nperm
    );
    
    res.json(result);
  } catch (error) {
    console.error('富集分析错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
      data: null,
      plot: null
    });
  }
});

/**
 * 综合分析
 * POST /api/proteomics/comprehensive
 */
router.post('/comprehensive', async (req, res) => {
  try {
    const { gene, analyses } = req.body;
    
    if (!gene) {
      return res.status(400).json({
        status: 'error',
        message: '请提供蛋白质ID',
        data: null,
        plot: null
      });
    }
    
    console.log('综合分析请求:', { gene, analyses });
    const result = await proteomicsService.comprehensiveAnalysis(gene, analyses);
    
    res.json(result);
  } catch (error) {
    console.error('综合分析错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
      data: null,
      plot: null
    });
  }
});

/**
 * 批量分析
 * POST /api/proteomics/batch
 */
router.post('/batch', async (req, res) => {
  try {
    const { gene, analysis_types } = req.body;
    
    if (!gene || !analysis_types || !Array.isArray(analysis_types)) {
      return res.status(400).json({
        status: 'error',
        message: '请提供蛋白质ID和分析类型数组',
        data: null,
        plot: null
      });
    }
    
    console.log('批量分析请求:', { gene, analysis_types });
    const results = await proteomicsService.batchAnalysis(gene, analysis_types);
    
    res.json({
      status: 'success',
      message: '批量分析完成',
      gene: gene,
      results: results
    });
  } catch (error) {
    console.error('批量分析错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
      data: null,
      plot: null
    });
  }
});

/**
 * 健康检查
 * GET /api/proteomics/health
 */
router.get('/health', async (req, res) => {
  try {
    // 检查服务状态
    const healthStatus = {
      status: 'healthy',
      message: '蛋白质组学服务运行正常',
      timestamp: new Date().toISOString(),
      plumber_api_enabled: proteomicsService.plumberAPIEnabled,
      plumber_api_url: proteomicsService.plumberAPIUrl
    };
    
    res.json(healthStatus);
  } catch (error) {
    console.error('健康检查错误:', error);
    res.status(500).json({
      status: 'error',
      message: '健康检查失败',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;