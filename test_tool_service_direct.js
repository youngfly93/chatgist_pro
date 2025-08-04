// Direct test of tool service with environment variables set
process.env.SINGLECELL_PLUMBER_ENABLED = 'true';
process.env.SINGLECELL_PLUMBER_URL = 'http://localhost:8003';

import toolService from './backend/src/services/toolService.js';

async function testToolServiceDirect() {
  console.log('=== 直接测试工具服务 ===\n');
  
  try {
    console.log('测试 PDGFRA 小提琴图分析...');
    const result = await toolService.executeTool('singlecell_analysis', {
      function_type: 'violin_plot',
      gene: 'PDGFRA',
      dataset: 'auto'
    });
    
    console.log('\n=== 最终结果 ===');
    console.log('hasData:', result.hasData);
    console.log('hasPlot:', result.hasPlot);
    console.log('status:', result.status);
    console.log('dataset:', result.dataset);
    console.log('gene:', result.gene);
    console.log('图片数据长度:', result.image_base64 ? result.image_base64.length : 0);
    
    if (result.hasPlot && result.image_base64) {
      console.log('\n✅ 修复成功！结果解析正确');
    } else {
      console.log('\n❌ 仍有问题');
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    console.error(error);
  }
}

testToolServiceDirect();