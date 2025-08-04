import phosphoService from '../src/services/phosphoService.js';

async function testPhosphoAPI() {
  console.log('=== 测试 PhosphoService API ===\n');
  
  try {
    // 确保使用 Plumber API
    await phosphoService.healthCheckPromise;
    console.log('Plumber API 可用:', phosphoService.plumberAPIAvailable);
    
    // 1. 测试查询
    console.log('\n1. 测试查询 KIT 基因:');
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
    
    // 2. 测试箱线图（使用具体的磷酸化位点）
    console.log('\n2. 测试 boxplot_TvsN (使用 KIT/S25):');
    const boxplotResult = await phosphoService.analyze({
      function: 'boxplot_TvsN',
      gene: 'KIT',
      site: 'KIT/S25'
    });
    
    console.log('状态:', boxplotResult.status);
    console.log('消息:', boxplotResult.message);
    console.log('有图片吗?', !!boxplotResult.plot);
    if (boxplotResult.plot) {
      console.log('图片格式正确?', boxplotResult.plot.startsWith('data:image/png;base64,'));
      console.log('图片长度:', boxplotResult.plot.length);
    }
    
    // 3. 测试不带位点的箱线图
    console.log('\n3. 测试 boxplot_TvsN (只用基因名):');
    const boxplotResult2 = await phosphoService.analyze({
      function: 'boxplot_TvsN',
      gene: 'KIT'
    });
    
    console.log('状态:', boxplotResult2.status);
    console.log('消息:', boxplotResult2.message);
    console.log('有图片吗?', !!boxplotResult2.plot);
    
  } catch (error) {
    console.error('测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

testPhosphoAPI();