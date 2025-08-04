// 直接测试单细胞服务
import singleCellService from './backend/src/services/singleCellService.js';
import toolService from './backend/src/services/toolService.js';

async function testSingleCellService() {
  console.log('=== 直接测试单细胞服务 ===\n');
  
  try {
    // 1. 测试基本查询
    console.log('1. 测试基本查询 (KIT)...');
    const queryResult = await singleCellService.queryGeneInfo('KIT');
    console.log('查询结果:', {
      status: queryResult.status,
      dataset: queryResult.dataset,
      gene: queryResult.gene,
      cell_types: queryResult.cell_types ? queryResult.cell_types.length : 0
    });
    
    // 2. 通过工具服务测试 (测试数组结果规范化)
    console.log('\n2. 通过工具服务测试小提琴图...');
    const toolResult = await toolService.executeTool('singlecell_analysis', {
      function_type: 'violin_plot',
      gene: 'KIT',
      dataset: 'auto'
    });
    
    console.log('工具服务结果:');
    console.log('hasData:', toolResult.hasData);
    console.log('hasPlot:', toolResult.hasPlot);
    console.log('status:', toolResult.status);
    console.log('dataset:', toolResult.dataset);
    console.log('gene:', toolResult.gene);
    console.log('图片数据长度:', toolResult.image_base64 ? toolResult.image_base64.length : 0);
    
    if (toolResult.hasPlot && toolResult.image_base64) {
      console.log('✅ 修复成功！现在能正确解析数组格式的结果');
    } else {
      console.log('❌ 仍有问题，需要进一步调试');
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    console.error(error);
  }
}

testSingleCellService();