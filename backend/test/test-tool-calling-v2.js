import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env') });

// 测试配置
const API_BASE_URL = 'http://localhost:8000';
const TEST_CASES = [
  {
    name: '查询磷酸化位点',
    message: '请帮我查询KIT基因的磷酸化位点'
  },
  {
    name: '箱线图分析',
    message: '分析KIT基因在肿瘤和正常组织中的差异'
  },
  {
    name: '综合分析',
    message: '对PDGFRA基因进行全面的磷酸化分析'
  },
  {
    name: '生存分析',
    message: '分析KIT基因S742位点的生存曲线'
  },
  {
    name: '多基因查询',
    message: '分别查询KIT和PDGFRA基因的磷酸化位点'
  }
];

// 测试 Tool Calling API
async function testToolCallingAPI(testCase) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`测试: ${testCase.name}`);
  console.log(`消息: ${testCase.message}`);
  console.log('='.repeat(50));
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post(
      `${API_BASE_URL}/api/chat/v2`,
      {
        message: testCase.message,
        sessionId: 'test-session'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60秒超时
      }
    );
    
    const duration = Date.now() - startTime;
    
    console.log('\n响应时间:', duration, 'ms');
    console.log('\n=== AI 回复 ===');
    console.log(response.data.reply);
    
    if (response.data.toolCalls) {
      console.log('\n=== 工具调用详情 ===');
      response.data.toolCalls.forEach((tc, index) => {
        console.log(`\n工具 ${index + 1}:`);
        console.log('- 名称:', tc.tool);
        console.log('- 参数:', JSON.stringify(tc.args, null, 2));
        console.log('- 结果状态:', tc.result?.status);
        if (tc.result?.message) {
          console.log('- 消息:', tc.result.message);
        }
      });
    }
    
    if (response.data.phosphoAnalysis) {
      console.log('\n=== 磷酸化分析结果 ===');
      console.log('状态:', response.data.phosphoAnalysis.status);
      console.log('消息:', response.data.phosphoAnalysis.message);
      
      if (response.data.phosphoAnalysis.data) {
        const data = response.data.phosphoAnalysis.data;
        if (Array.isArray(data) && data.length > 0) {
          console.log(`找到 ${data.length} 个磷酸化位点`);
          console.log('前3个位点:', data.slice(0, 3));
        }
      }
      
      if (response.data.phosphoAnalysis.plot) {
        console.log('包含图表: 是');
      }
    }
    
    return { success: true, duration };
    
  } catch (error) {
    console.error('\n测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('无响应，检查服务器是否运行在', API_BASE_URL);
      console.error('请求错误:', error.code);
    } else {
      console.error('错误:', error.message);
    }
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始 Tool Calling V2 API 测试');
  console.log('API 地址:', API_BASE_URL);
  console.log('Kimi API Key:', process.env.KIMI_API_KEY ? '已配置' : '未配置');
  
  const results = [];
  
  for (const testCase of TEST_CASES) {
    const result = await testToolCallingAPI(testCase);
    results.push({
      name: testCase.name,
      ...result
    });
    
    // 测试间隔，避免过快调用
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 打印测试总结
  console.log(`\n${'='.repeat(50)}`);
  console.log('测试总结');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`总测试数: ${results.length}`);
  console.log(`成功: ${successful}`);
  console.log(`失败: ${failed}`);
  console.log(`成功率: ${(successful / results.length * 100).toFixed(2)}%`);
  
  if (successful > 0) {
    const avgDuration = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.duration, 0) / successful;
    console.log(`平均响应时间: ${Math.round(avgDuration)}ms`);
  }
  
  console.log('\n详细结果:');
  results.forEach(r => {
    console.log(`- ${r.name}: ${r.success ? '✓ 成功' : '✗ 失败'} ${r.duration ? `(${r.duration}ms)` : ''}`);
    if (!r.success && r.error) {
      console.log(`  错误: ${r.error}`);
    }
  });
}

// 测试单个功能
async function testSingleFeature() {
  console.log('\n=== 测试单个 Tool Calling 功能 ===');
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/chat/v2`,
      {
        message: "请查询KIT基因的磷酸化位点，然后分析KIT/S25在肿瘤和正常组织中的差异",
        sessionId: 'test-single'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('响应:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--single')) {
    await testSingleFeature();
  } else {
    await runAllTests();
  }
}

// 运行测试
main().catch(console.error);