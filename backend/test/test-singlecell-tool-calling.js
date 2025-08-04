// 测试单细胞工具调用集成
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

// 测试工具调用功能
async function testSingleCellToolCalling() {
  console.log('=== 测试 Single-cell Tool Calling ===\n');
  
  const testCases = [
    {
      name: '基因查询',
      message: 'KIT基因在单细胞数据中的表达情况如何？',
      expected_tools: ['singlecell_analysis']
    },
    {
      name: '小提琴图分析',
      message: '请生成MCM7基因在不同细胞类型中的表达小提琴图',
      expected_tools: ['singlecell_analysis']
    },
    {
      name: 'UMAP可视化',
      message: '显示单细胞数据的UMAP图，按细胞类型着色',
      expected_tools: ['singlecell_analysis']
    },
    {
      name: '基因表达UMAP',
      message: '在UMAP图上显示KIT基因的表达水平',
      expected_tools: ['singlecell_analysis']
    },
    {
      name: '综合单细胞分析',
      message: 'PDGFRA基因单细胞分析，包括所有可用的分析类型',
      expected_tools: ['singlecell_analysis']
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`${i + 1}. ${testCase.name}...`);
    
    try {
      const response = await axios.post(`${BASE_URL}/chat`, {
        message: testCase.message,
        sessionId: `test-singlecell-${i}`
      }, {
        timeout: 300000, // 5分钟超时
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        const data = response.data;
        console.log('✅ 请求成功');
        console.log('响应长度:', data.response ? data.response.length : 0, '字符');
        
        // 检查是否包含预期的工具调用
        if (data.tool_calls && data.tool_calls.length > 0) {
          console.log('工具调用数量:', data.tool_calls.length);
          const toolNames = data.tool_calls.map(call => call.name);
          console.log('调用的工具:', toolNames);
          
          // 检查是否调用了期望的工具
          const hasExpectedTool = testCase.expected_tools.some(tool => toolNames.includes(tool));
          if (hasExpectedTool) {
            console.log('✅ 调用了期望的工具');
          } else {
            console.log('⚠️ 未调用期望的工具');
          }
        } else {
          console.log('⚠️ 无工具调用');
        }
        
        // 检查响应是否包含相关内容
        if (data.response) {
          const hasImageContent = data.response.includes('base64') || data.response.includes('图');
          const hasAnalysisContent = data.response.includes('分析') || data.response.includes('表达') || data.response.includes('细胞');
          
          if (hasImageContent) {
            console.log('✅ 响应包含图像内容');
          }
          if (hasAnalysisContent) {
            console.log('✅ 响应包含分析内容');
          }
        }
        
      } else {
        console.log('❌ 请求失败，状态码:', response.status);
      }
      
    } catch (error) {
      console.log('❌ 请求出错:', error.message);
      if (error.response) {
        console.log('错误状态:', error.response.status);
        console.log('错误信息:', error.response.data);
      }
    }
    
    console.log();
    
    // 等待1秒再进行下一个测试
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('=== 所有工具调用测试完成 ===');
}

// 测试单细胞API端点
async function testSingleCellAPI() {
  console.log('=== 测试 Single-cell API 端点 ===\n');
  
  const apiTests = [
    {
      name: '健康检查',
      method: 'GET',
      url: `${BASE_URL}/singlecell/health`,
      data: null
    },
    {
      name: '基因查询',
      method: 'POST',
      url: `${BASE_URL}/singlecell/query`,
      data: { gene: 'KIT' }
    },
    {
      name: '小提琴图',
      method: 'POST',
      url: `${BASE_URL}/singlecell/violin`,
      data: { gene: 'MCM7' }
    },
    {
      name: 'UMAP细胞类型',
      method: 'POST', 
      url: `${BASE_URL}/singlecell/umap-celltype`,
      data: {}
    },
    {
      name: 'UMAP基因表达',
      method: 'POST',
      url: `${BASE_URL}/singlecell/umap-expression`,
      data: { gene: 'KIT' }
    }
  ];
  
  for (const test of apiTests) {
    console.log(`测试 ${test.name}...`);
    
    try {
      let response;
      if (test.method === 'GET') {
        response = await axios.get(test.url, { timeout: 60000 });
      } else {
        response = await axios.post(test.url, test.data, { timeout: 60000 });
      }
      
      if (response.status === 200) {
        console.log('✅ API调用成功');
        const data = response.data;
        
        if (data.status === 'success' || data.status === 'healthy') {
          console.log('✅ 返回成功状态');
        } else {
          console.log('⚠️ 返回状态:', data.status);
        }
        
        if (data.image_base64) {
          console.log('✅ 包含图像数据');
        }
        
      } else {
        console.log('❌ API调用失败，状态码:', response.status);
      }
      
    } catch (error) {
      console.log('❌ API调用出错:', error.message);
    }
    
    console.log();
  }
  
  console.log('=== API端点测试完成 ===');
}

// 运行所有测试
async function runAllTests() {
  console.log('开始测试 ChatGIST Pro 单细胞集成...\n');
  
  // 首先测试API端点
  await testSingleCellAPI();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 然后测试工具调用
  await testSingleCellToolCalling();
  
  console.log('\n=== 所有测试完成 ===');
}

// 检查服务可用性
async function checkServices() {
  console.log('检查服务可用性...\n');
  
  const services = [
    { name: '后端API', url: `${BASE_URL}/chat` },
    { name: '单细胞API', url: `${BASE_URL}/singlecell/health` }
  ];
  
  for (const service of services) {
    try {
      const response = await axios.get(service.url, { timeout: 5000 });
      console.log(`✅ ${service.name} 可用`);
    } catch (error) {
      console.log(`❌ ${service.name} 不可用:`, error.message);
    }
  }
  
  console.log();
}

// 主函数
async function main() {
  await checkServices();
  await runAllTests();
}

main().catch(console.error);