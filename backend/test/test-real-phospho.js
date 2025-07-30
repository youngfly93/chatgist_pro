import phosphoService from '../src/services/phosphoService.js';

console.log('=== 测试真实 GIST Phosphoproteomics 集成 ===\n');

// 测试函数
async function testPhosphoAnalysis() {
  const tests = [
    {
      name: '查询磷酸化位点',
      params: {
        function: 'query',
        gene: 'KIT'
      }
    },
    {
      name: '肿瘤vs正常组织分析',
      params: {
        function: 'boxplot_TvsN',
        gene: 'KIT',
        site: 'KIT/S959'  // 使用真实的磷酸化位点格式
      }
    },
    {
      name: '风险分组分析',
      params: {
        function: 'boxplot_Risk',
        gene: 'PDGFRA',
        site: 'PDGFRA/S561'
      }
    },
    {
      name: '生存分析',
      params: {
        function: 'survival',
        gene: 'ACSS2',
        site: 'ACSS2/S30',
        cutoff: 'Auto',
        survtype: 'OS'
      }
    }
  ];

  for (const test of tests) {
    console.log(`\n测试: ${test.name}`);
    console.log('参数:', test.params);
    
    try {
      const result = await phosphoService.analyze(test.params);
      
      console.log('状态:', result.status);
      console.log('消息:', result.message);
      
      if (result.data) {
        console.log('数据行数:', Array.isArray(result.data) ? result.data.length : 
                    (result.data.PhosphoSites ? result.data.PhosphoSites.length : 0));
      }
      
      if (result.plot) {
        console.log('图片已生成:', typeof result.plot === 'string' ? result.plot.substring(0, 50) + '...' : '图片数据');
      }
      
    } catch (error) {
      console.error('错误:', error.message);
    }
  }
}

// 执行测试
testPhosphoAnalysis().then(() => {
  console.log('\n=== 测试完成 ===');
}).catch(error => {
  console.error('测试失败:', error);
});