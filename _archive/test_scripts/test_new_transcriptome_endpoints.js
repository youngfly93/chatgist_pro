// 测试新增的转录组API端点
// 验证年龄分组、肿瘤大小、WHO分级分析功能

const axios = require('axios');

// API配置
const TRANSCRIPTOME_API_URL = 'http://localhost:8002';
const TEST_GENE = 'KIT'; // 使用KIT基因进行测试

// 测试用例配置
const testCases = [
  {
    name: '年龄分组分析',
    endpoint: '/transcriptome/boxplot/age',
    data: { gene: TEST_GENE, cutoff: 65 },
    description: '测试年龄分组分析功能（默认65岁分界）'
  },
  {
    name: '肿瘤大小分析',
    endpoint: '/transcriptome/boxplot/tumorsize',
    data: { gene: TEST_GENE },
    description: '测试肿瘤大小分析功能'
  },
  {
    name: 'WHO分级分析',
    endpoint: '/transcriptome/boxplot/grade',
    data: { gene: TEST_GENE },
    description: '测试WHO分级分析功能'
  }
];

// 辅助函数：格式化时间戳
function formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// 辅助函数：检查API健康状态
async function checkAPIHealth() {
  try {
    console.log(`[${formatTimestamp()}] 检查转录组API健康状态...`);
    const response = await axios.get(`${TRANSCRIPTOME_API_URL}/transcriptome/health`, {
      timeout: 10000
    });
    
    if (response.data.status === 'healthy') {
      console.log(`✅ API健康检查通过`);
      console.log(`   - 数据已加载: ${response.data.data_loaded}`);
      console.log(`   - 数据集数量: ${response.data.datasets_count}`);
      return true;
    } else {
      console.log(`❌ API健康检查失败: ${response.data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API健康检查失败: ${error.message}`);
    return false;
  }
}

// 辅助函数：执行单个测试用例
async function runTestCase(testCase) {
  try {
    console.log(`\n[${formatTimestamp()}] 开始测试: ${testCase.name}`);
    console.log(`   描述: ${testCase.description}`);
    console.log(`   端点: POST ${testCase.endpoint}`);
    console.log(`   参数: ${JSON.stringify(testCase.data)}`);
    
    const startTime = Date.now();
    const response = await axios.post(
      `${TRANSCRIPTOME_API_URL}${testCase.endpoint}`,
      testCase.data,
      {
        timeout: 60000, // 60秒超时
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // 检查响应状态
    if (response.data.status === 'success') {
      console.log(`✅ ${testCase.name} 测试成功`);
      console.log(`   - 响应时间: ${duration}ms`);
      console.log(`   - 消息: ${response.data.message}`);
      
      // 检查是否有图片数据
      if (response.data.plot) {
        const plotSize = response.data.plot.length;
        console.log(`   - 图片数据大小: ${Math.round(plotSize / 1024)}KB`);
        console.log(`   - 图片格式: Base64 PNG`);
      } else {
        console.log(`   - ⚠️  未返回图片数据`);
      }
      
      return { success: true, duration, testCase: testCase.name };
    } else if (response.data.status === 'warning') {
      console.log(`⚠️  ${testCase.name} 测试警告`);
      console.log(`   - 响应时间: ${duration}ms`);
      console.log(`   - 警告消息: ${response.data.message}`);
      return { success: false, duration, testCase: testCase.name, warning: true };
    } else {
      console.log(`❌ ${testCase.name} 测试失败`);
      console.log(`   - 响应时间: ${duration}ms`);
      console.log(`   - 错误消息: ${response.data.message}`);
      return { success: false, duration, testCase: testCase.name, error: response.data.message };
    }
    
  } catch (error) {
    console.log(`❌ ${testCase.name} 测试异常`);
    console.log(`   - 错误类型: ${error.name}`);
    console.log(`   - 错误消息: ${error.message}`);
    
    if (error.response) {
      console.log(`   - HTTP状态: ${error.response.status}`);
      console.log(`   - 响应数据: ${JSON.stringify(error.response.data)}`);
    }
    
    return { success: false, testCase: testCase.name, exception: error.message };
  }
}

// 主测试函数
async function runAllTests() {
  console.log('🧬 转录组API新端点测试开始');
  console.log('=' .repeat(60));
  console.log(`测试目标: ${TRANSCRIPTOME_API_URL}`);
  console.log(`测试基因: ${TEST_GENE}`);
  console.log(`测试用例数量: ${testCases.length}`);
  
  // 1. 健康检查
  const isHealthy = await checkAPIHealth();
  if (!isHealthy) {
    console.log('\n❌ API健康检查失败，终止测试');
    process.exit(1);
  }
  
  // 2. 执行所有测试用例
  const results = [];
  for (const testCase of testCases) {
    const result = await runTestCase(testCase);
    results.push(result);
    
    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 3. 生成测试报告
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));
  
  const successCount = results.filter(r => r.success).length;
  const warningCount = results.filter(r => r.warning).length;
  const failureCount = results.filter(r => !r.success && !r.warning).length;
  
  console.log(`总测试数: ${results.length}`);
  console.log(`成功: ${successCount} ✅`);
  console.log(`警告: ${warningCount} ⚠️`);
  console.log(`失败: ${failureCount} ❌`);
  console.log(`成功率: ${Math.round((successCount / results.length) * 100)}%`);
  
  // 详细结果
  console.log('\n📋 详细结果:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : (result.warning ? '⚠️' : '❌');
    const duration = result.duration ? `${result.duration}ms` : 'N/A';
    console.log(`${index + 1}. ${status} ${result.testCase} (${duration})`);
    
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    if (result.exception) {
      console.log(`   异常: ${result.exception}`);
    }
  });
  
  // 4. 测试建议
  console.log('\n💡 测试建议:');
  if (successCount === results.length) {
    console.log('🎉 所有新端点测试通过！API功能完整。');
  } else if (successCount > 0) {
    console.log('⚠️  部分端点存在问题，建议检查失败的端点配置。');
  } else {
    console.log('🚨 所有端点测试失败，请检查API服务和数据配置。');
  }
  
  console.log('\n🔧 如果测试失败，请检查:');
  console.log('1. 转录组Plumber API是否正常运行 (端口8002)');
  console.log('2. GIST_Transcriptome/global.R是否正确加载');
  console.log('3. 相关数据集ID是否存在 (Age_ID, Stage_ID等)');
  console.log('4. R函数是否正确定义和导出');
  
  console.log(`\n测试完成时间: ${formatTimestamp()}`);
  
  // 返回测试结果
  return {
    total: results.length,
    success: successCount,
    warning: warningCount,
    failure: failureCount,
    successRate: Math.round((successCount / results.length) * 100)
  };
}

// 执行测试
if (require.main === module) {
  runAllTests()
    .then(summary => {
      console.log('\n🏁 测试执行完成');
      process.exit(summary.failure > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('\n💥 测试执行异常:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, checkAPIHealth };
