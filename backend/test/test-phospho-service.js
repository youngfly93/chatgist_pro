import phosphoService from '../src/services/phosphoService.js';

async function testPhosphoService() {
  console.log('=== 测试PhosphoService ===\n');

  // 测试1: 查询磷酸化位点
  console.log('测试1: 查询KIT的磷酸化位点');
  try {
    const result1 = await phosphoService.analyze({
      function: 'query',
      gene: 'KIT'
    });
    console.log('结果:', JSON.stringify(result1, null, 2));
  } catch (error) {
    console.error('错误:', error.message);
  }
  console.log('\n----------------------------------------\n');

  // 测试2: 肿瘤vs正常分析
  console.log('测试2: KIT在肿瘤vs正常组织的分析');
  try {
    const result2 = await phosphoService.analyze({
      function: 'boxplot_TvsN',
      gene: 'KIT'
    });
    console.log('状态:', result2.status);
    console.log('消息:', result2.message);
    console.log('包含图表:', !!result2.plot);
  } catch (error) {
    console.error('错误:', error.message);
  }
  console.log('\n----------------------------------------\n');

  // 测试3: 解析用户请求
  console.log('测试3: 解析用户请求');
  const testMessages = [
    '我想查询TP53的磷酸化位点',
    '分析KIT在肿瘤和正常组织中的差异',
    '看看PDGFRA的风险分析',
    '研究BRAF的生存影响'
  ];

  testMessages.forEach(msg => {
    const parsed = phosphoService.parseUserRequest(msg);
    console.log(`消息: "${msg}"`);
    console.log(`解析结果:`, parsed);
    console.log('');
  });
  console.log('\n----------------------------------------\n');

  // 测试4: 参数验证
  console.log('测试4: 参数验证');
  try {
    phosphoService.validateParams({ function: 'invalid_func', gene: 'KIT' });
  } catch (error) {
    console.log('预期的错误:', error.message);
  }

  try {
    phosphoService.validateParams({ function: 'query' }); // 缺少gene
  } catch (error) {
    console.log('预期的错误:', error.message);
  }
  console.log('\n----------------------------------------\n');

  // 测试5: 获取支持的功能列表
  console.log('测试5: 支持的分析类型');
  const functions = phosphoService.getSupportedFunctions();
  functions.forEach(func => {
    console.log(`- ${func.name}: ${func.description}`);
  });

  console.log('\n=== 测试完成 ===');
}

// 运行测试
testPhosphoService().catch(console.error);