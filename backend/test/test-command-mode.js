import phosphoService from '../src/services/phosphoService.js';

async function testCommandMode() {
  console.log('=== 测试命令行模式 ===\n');
  
  try {
    // 暂时禁用 Plumber API
    phosphoService.plumberAPIAvailable = false;
    
    console.log('1. 测试查询 KIT 基因:');
    const queryResult = await phosphoService.analyze({
      function: 'query',
      gene: 'KIT'
    });
    
    console.log('状态:', queryResult.status);
    console.log('消息:', queryResult.message);
    console.log('数据条数:', queryResult.data?.length || 0);
    if (queryResult.data && queryResult.data.length > 0) {
      console.log('第一条数据:', queryResult.data[0]);
    }
    
    console.log('\n2. 测试箱线图分析:');
    const boxplotResult = await phosphoService.analyze({
      function: 'boxplot_TvsN',
      gene: 'KIT',
      site: 'KIT/S959'
    });
    
    console.log('状态:', boxplotResult.status);
    console.log('消息:', boxplotResult.message);
    console.log('有图片吗?', !!boxplotResult.plot);
    if (boxplotResult.plot) {
      console.log('图片格式:', boxplotResult.plot.substring(0, 50) + '...');
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

testCommandMode();