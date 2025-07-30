import express from 'express';
import phosphoService from '../services/phosphoService.js';

const router = express.Router();

// 磷酸化位点查询
router.post('/query', async (req, res) => {
  try {
    const { gene } = req.body;

    if (!gene) {
      return res.status(400).json({
        error: '缺少必需参数: gene'
      });
    }

    console.log(`磷酸化查询请求: ${gene}`);

    const result = await phosphoService.analyze({
      function: 'query',
      gene: gene
    });
    res.json(result);
  } catch (error) {
    console.error('磷酸化查询错误:', error);
    res.status(500).json({
      error: '磷酸化查询失败',
      details: error.message
    });
  }
});

// 箱线图分析
router.post('/boxplot', async (req, res) => {
  try {
    const { gene, type = 'TvsN' } = req.body;

    if (!gene) {
      return res.status(400).json({
        error: '缺少必需参数: gene'
      });
    }

    console.log(`箱线图分析请求: ${gene}, 类型: ${type}`);

    const result = await phosphoService.analyze({
      function: `boxplot_${type}`,
      gene: gene
    });
    res.json(result);
  } catch (error) {
    console.error('箱线图分析错误:', error);
    res.status(500).json({
      error: '箱线图分析失败',
      details: error.message
    });
  }
});

// 生存分析
router.post('/survival', async (req, res) => {
  try {
    const { gene } = req.body;

    if (!gene) {
      return res.status(400).json({
        error: '缺少必需参数: gene'
      });
    }

    console.log(`生存分析请求: ${gene}`);

    const result = await phosphoService.analyze({
      function: 'survival',
      gene: gene
    });
    res.json(result);
  } catch (error) {
    console.error('生存分析错误:', error);
    res.status(500).json({
      error: '生存分析失败',
      details: error.message
    });
  }
});

// 健康检查
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'phospho-analysis',
    timestamp: new Date().toISOString()
  });
});

export default router;
