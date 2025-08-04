// 测试 Plumber API 的脚本
import axios from 'axios';

const PLUMBER_API_URL = 'http://localhost:8001';

// 彩色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function testAPI() {
  log('\n=== 测试 Plumber API ===\n', 'blue');
  
  try {
    // 1. 健康检查
    log('1. 测试健康检查端点...', 'yellow');
    const healthResponse = await axios.get(`${PLUMBER_API_URL}/phospho/health`);
    log('✓ 健康检查成功: ' + JSON.stringify(healthResponse.data), 'green');
    
    // 2. 查询磷酸化位点
    log('\n2. 测试查询磷酸化位点 (KIT基因)...', 'yellow');
    const queryResponse = await axios.post(`${PLUMBER_API_URL}/phospho/query`, {
      gene: 'KIT'
    });
    log('✓ 查询成功: ' + queryResponse.data.message, 'green');
    if (queryResponse.data.data) {
      log(`  找到 ${queryResponse.data.data.length} 个磷酸化位点`, 'green');
    }
    
    // 3. 肿瘤vs正常分析
    log('\n3. 测试肿瘤vs正常分析...', 'yellow');
    const tvsNResponse = await axios.post(`${PLUMBER_API_URL}/phospho/boxplot/TvsN`, {
      gene: 'KIT',
      site: 'KIT/S25'
    });
    log('✓ 分析成功: ' + tvsNResponse.data.message, 'green');
    if (tvsNResponse.data.plot) {
      log('  已生成图表 (base64)', 'green');
    }
    
    // 4. 生存分析
    log('\n4. 测试生存分析...', 'yellow');
    const survivalResponse = await axios.post(`${PLUMBER_API_URL}/phospho/survival`, {
      gene: 'KIT',
      site: 'KIT/S25',
      cutoff: 'Auto',
      survtype: 'OS'
    });
    log('✓ 生存分析成功: ' + survivalResponse.data.message, 'green');
    
    // 5. 综合分析
    log('\n5. 测试综合分析...', 'yellow');
    const comprehensiveResponse = await axios.post(`${PLUMBER_API_URL}/phospho/comprehensive`, {
      gene: 'KIT'
    });
    log('✓ 综合分析成功: ' + comprehensiveResponse.data.message, 'green');
    log(`  完成分析: 成功 ${comprehensiveResponse.data.summary.successful}, 失败 ${comprehensiveResponse.data.summary.failed}, 警告 ${comprehensiveResponse.data.summary.warnings}`, 'green');
    
    log('\n✅ 所有测试通过！Plumber API 工作正常。', 'green');
    
  } catch (error) {
    log('\n❌ 测试失败！', 'red');
    
    if (error.code === 'ECONNREFUSED') {
      log('错误: 无法连接到 Plumber API 服务器', 'red');
      log('请确保已经启动了 Plumber API：', 'yellow');
      log('  Rscript start_plumber_api.R', 'yellow');
    } else if (error.response) {
      log(`错误响应: ${error.response.status} - ${error.response.statusText}`, 'red');
      if (error.response.data) {
        log(`详情: ${JSON.stringify(error.response.data)}`, 'red');
      }
    } else {
      log(`错误: ${error.message}`, 'red');
    }
    
    process.exit(1);
  }
}

// 运行测试
testAPI();