/**
 * 蛋白质组学集成测试脚本
 * 测试从前端到后端的完整蛋白质组学分析流程
 */

const axios = require('axios');

const TEST_CONFIG = {
  backend_url: 'http://localhost:8000',
  plumber_url: 'http://localhost:8004',
  test_gene: 'P4HA1'
};

async function testProteomicsIntegration() {
  console.log('🧪 开始蛋白质组学集成测试...\n');

  // 测试序列
  const tests = [
    {
      name: '1. 测试Plumber API健康状态',
      test: testPlumberHealth
    },
    {
      name: '2. 测试后端蛋白质组学API健康状态',
      test: testBackendHealth
    },
    {
      name: '3. 测试蛋白质基本查询',
      test: testProteinQuery
    },
    {
      name: '4. 测试箱线图分析',
      test: testBoxplotAnalysis
    },
    {
      name: '5. 测试相关性分析',
      test: testCorrelationAnalysis
    },
    {
      name: '6. 测试药物耐药性分析',
      test: testDrugResistanceAnalysis
    },
    {
      name: '7. 测试综合分析',
      test: testComprehensiveAnalysis
    },
    {
      name: '8. 测试AI工具调用',
      test: testAIToolCalling
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    console.log(`\n📋 ${test.name}`);
    console.log('=' .repeat(50));
    
    try {
      await test.test();
      console.log(`✅ ${test.name} - 通过`);
      passedTests++;
    } catch (error) {
      console.error(`❌ ${test.name} - 失败:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🏁 测试完成: ${passedTests}/${totalTests} 通过`);
  console.log('='.repeat(60));
}

// 1. 测试Plumber API健康状态
async function testPlumberHealth() {
  try {
    const response = await axios.get(`${TEST_CONFIG.plumber_url}/health`, {
      timeout: 10000
    });
    
    console.log('✓ Plumber API响应状态:', response.status);
    console.log('✓ 健康状态:', response.data.status);
    console.log('✓ 数据加载状态:', response.data.data_loaded);
    
    if (response.data.status !== 'healthy') {
      throw new Error('Plumber API状态不健康');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Plumber API服务未启动 (端口8004)');
    }
    throw error;
  }
}

// 2. 测试后端蛋白质组学API健康状态
async function testBackendHealth() {
  try {
    const response = await axios.get(`${TEST_CONFIG.backend_url}/api/proteomics/health`, {
      timeout: 10000
    });
    
    console.log('✓ 后端API响应状态:', response.status);
    console.log('✓ 服务状态:', response.data.status);
    console.log('✓ Plumber API启用:', response.data.plumber_api_enabled);
    
    if (response.data.status !== 'healthy') {
      throw new Error('后端蛋白质组学服务状态不健康');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('后端服务未启动 (端口8000)');
    }
    throw error;
  }
}

// 3. 测试蛋白质基本查询
async function testProteinQuery() {
  try {
    const response = await axios.post(`${TEST_CONFIG.backend_url}/api/proteomics/query`, {
      gene: TEST_CONFIG.test_gene
    }, {
      timeout: 30000
    });
    
    console.log('✓ 查询响应状态:', response.status);
    console.log('✓ 查询结果状态:', response.data.status);
    console.log('✓ 查询消息:', response.data.message);
    
    if (response.data.data) {
      console.log('✓ 找到数据集:', response.data.data.datasets_found);
    }
    
    if (response.data.status === 'not_found') {
      throw new Error(`蛋白质 ${TEST_CONFIG.test_gene} 未找到`);
    }
    
  } catch (error) {
    if (error.response) {
      throw new Error(`请求失败: ${error.response.status} - ${error.response.data?.message || error.message}`);
    }
    throw error;
  }
}

// 4. 测试箱线图分析
async function testBoxplotAnalysis() {
  try {
    const response = await axios.post(`${TEST_CONFIG.backend_url}/api/proteomics/boxplot`, {
      gene: TEST_CONFIG.test_gene,
      analysis_type: 'TvsN'
    }, {
      timeout: 60000
    });
    
    console.log('✓ 箱线图分析响应状态:', response.status);
    console.log('✓ 分析结果状态:', response.data.status);
    console.log('✓ 分析消息:', response.data.message);
    
    const hasPlot = !!(response.data.plot);
    console.log('✓ 图片生成:', hasPlot ? '是' : '否');
    
    if (response.data.status !== 'success') {
      throw new Error(`箱线图分析失败: ${response.data.message}`);
    }
    
  } catch (error) {
    if (error.response) {
      throw new Error(`请求失败: ${error.response.status} - ${error.response.data?.message || error.message}`);
    }
    throw error;
  }
}

// 5. 测试相关性分析
async function testCorrelationAnalysis() {
  try {
    const response = await axios.post(`${TEST_CONFIG.backend_url}/api/proteomics/correlation`, {
      gene1: TEST_CONFIG.test_gene,
      gene2: 'FN1'
    }, {
      timeout: 60000
    });
    
    console.log('✓ 相关性分析响应状态:', response.status);
    console.log('✓ 分析结果状态:', response.data.status);
    console.log('✓ 分析消息:', response.data.message);
    
    const hasPlot = !!(response.data.plot);
    console.log('✓ 图片生成:', hasPlot ? '是' : '否');
    
    if (response.data.status !== 'success') {
      throw new Error(`相关性分析失败: ${response.data.message}`);
    }
    
  } catch (error) {
    if (error.response) {
      throw new Error(`请求失败: ${error.response.status} - ${error.response.data?.message || error.message}`);
    }
    throw error;
  }
}

// 6. 测试药物耐药性分析
async function testDrugResistanceAnalysis() {
  try {
    const response = await axios.post(`${TEST_CONFIG.backend_url}/api/proteomics/drug_resistance`, {
      gene: TEST_CONFIG.test_gene
    }, {
      timeout: 60000
    });
    
    console.log('✓ 药物耐药性分析响应状态:', response.status);
    console.log('✓ 分析结果状态:', response.data.status);
    console.log('✓ 分析消息:', response.data.message);
    
    const hasPlot = !!(response.data.plot);
    console.log('✓ 图片生成:', hasPlot ? '是' : '否');
    
    if (response.data.status !== 'success') {
      console.log('⚠️  药物耐药性分析可能不支持此蛋白质');
    }
    
  } catch (error) {
    if (error.response) {
      throw new Error(`请求失败: ${error.response.status} - ${error.response.data?.message || error.message}`);
    }
    throw error;
  }
}

// 7. 测试综合分析
async function testComprehensiveAnalysis() {
  try {
    const response = await axios.post(`${TEST_CONFIG.backend_url}/api/proteomics/comprehensive`, {
      gene: TEST_CONFIG.test_gene
    }, {
      timeout: 120000 // 2分钟超时，综合分析需要更长时间
    });
    
    console.log('✓ 综合分析响应状态:', response.status);
    console.log('✓ 分析结果状态:', response.data.status);
    console.log('✓ 分析消息:', response.data.message);
    
    if (response.data.summary) {
      console.log('✓ 分析统计:');
      console.log(`  - 总计: ${response.data.summary.total}`);
      console.log(`  - 成功: ${response.data.summary.successful}`);
      console.log(`  - 失败: ${response.data.summary.failed}`);
      console.log(`  - 警告: ${response.data.summary.warnings}`);
    }
    
    if (response.data.analyses) {
      console.log('✓ 包含分析类型:', Object.keys(response.data.analyses).join(', '));
    }
    
  } catch (error) {
    if (error.response) {
      throw new Error(`请求失败: ${error.response.status} - ${error.response.data?.message || error.message}`);
    }
    throw error;
  }
}

// 8. 测试AI工具调用
async function testAIToolCalling() {
  try {
    const response = await axios.post(`${TEST_CONFIG.backend_url}/api/chat`, {
      message: `请分析${TEST_CONFIG.test_gene}蛋白质的表达情况`,
      sessionId: `test-proteomics-${Date.now()}`
    }, {
      timeout: 180000 // 3分钟超时，AI分析需要较长时间
    });
    
    console.log('✓ AI工具调用响应状态:', response.status);
    console.log('✓ AI回复存在:', !!(response.data.reply));
    
    // 检查是否有蛋白质组学分析结果
    const hasProteomicsAnalysis = !!(response.data.proteomicsAnalysis);
    console.log('✓ 蛋白质组学分析结果:', hasProteomicsAnalysis ? '是' : '否');
    
    if (hasProteomicsAnalysis) {
      console.log('✓ 分析状态:', response.data.proteomicsAnalysis.status);
      console.log('✓ 分析消息:', response.data.proteomicsAnalysis.message);
    }
    
    // 显示AI回复的前100个字符
    if (response.data.reply) {
      const replyPreview = response.data.reply.substring(0, 100) + '...';
      console.log('✓ AI回复预览:', replyPreview);
    }
    
  } catch (error) {
    if (error.response) {
      throw new Error(`请求失败: ${error.response.status} - ${error.response.data?.message || error.message}`);
    }
    throw error;
  }
}

// 运行测试
if (require.main === module) {
  testProteomicsIntegration().catch(console.error);
}

module.exports = {
  testProteomicsIntegration,
  TEST_CONFIG
};