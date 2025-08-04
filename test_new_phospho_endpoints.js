// 测试新增的3个磷酸化分析端点
import axios from 'axios';

const PLUMBER_API_URL = 'http://localhost:8001';

async function testNewEndpoints() {
  console.log('=== 测试新增的磷酸化分析端点 ===\n');
  
  const testGene = 'KIT';
  const testSite = 'KIT/S25';
  
  // 测试端点列表
  const endpoints = [
    {
      name: '肿瘤大小分析',
      url: '/phospho/boxplot/TumorSize',
      description: 'Tumor Size Analysis'
    },
    {
      name: '核分裂计数分析',
      url: '/phospho/boxplot/MitoticCount', 
      description: 'Mitotic Count Analysis'
    },
    {
      name: '伊马替尼反应分析',
      url: '/phospho/boxplot/IMResponse',
      description: 'Imatinib Response Analysis'
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n--- 测试 ${endpoint.name} (${endpoint.description}) ---`);
    
    try {
      const response = await axios.post(`${PLUMBER_API_URL}${endpoint.url}`, {
        gene: testGene,
        site: testSite
      }, {
        timeout: 30000
      });
      
      console.log('✅ 状态:', response.data.status);
      console.log('📝 消息:', response.data.message);
      console.log('🖼️ 图片:', response.data.plot ? '已生成' : '未生成');
      console.log('⏰ 时间戳:', response.data.timestamp);
      
      if (response.data.status === 'error') {
        console.log('❌ 错误详情:', response.data.message);
      }
      
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
      if (error.response) {
        console.log('   状态码:', error.response.status);
        console.log('   响应:', error.response.data);
      }
    }
  }
  
  // 测试综合分析是否包含新的分析类型
  console.log('\n--- 测试综合分析 (包含新增分析类型) ---');
  
  try {
    const response = await axios.post(`${PLUMBER_API_URL}/phospho/comprehensive`, {
      gene: testGene
    }, {
      timeout: 120000 // 综合分析需要更长时间
    });
    
    console.log('✅ 综合分析状态:', response.data.status);
    console.log('📊 总分析数量:', response.data.summary?.total || 'N/A');
    console.log('✅ 成功数量:', response.data.summary?.successful || 'N/A');
    console.log('⚠️ 警告数量:', response.data.summary?.warnings || 'N/A');
    console.log('❌ 失败数量:', response.data.summary?.failed || 'N/A');
    
    if (response.data.analyses) {
      console.log('\n📋 分析结果详情:');
      
      // 检查新增的分析类型
      const newAnalysisTypes = [
        'boxplot_Tumor.size',
        'boxplot_Mitotic.count', 
        'boxplot_IM.Response'
      ];
      
      for (const analysisType of newAnalysisTypes) {
        const result = response.data.analyses[analysisType];
        if (result) {
          console.log(`   ${analysisType}: ${result.status} - ${result.message}`);
        } else {
          console.log(`   ${analysisType}: ❌ 未找到`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ 综合分析失败:', error.message);
    if (error.response) {
      console.log('   状态码:', error.response.status);
      console.log('   响应:', error.response.data);
    }
  }
}

// 健康检查
async function healthCheck() {
  console.log('=== Plumber API 健康检查 ===');
  
  try {
    const response = await axios.get(`${PLUMBER_API_URL}/phospho/health`, {
      timeout: 10000
    });
    
    console.log('✅ API 状态:', response.data.status);
    console.log('📝 消息:', response.data.message);
    console.log('🧬 可用基因数量:', response.data.available_genes?.length || 'N/A');
    console.log('🔬 可用位点数量:', response.data.available_sites?.length || 'N/A');
    
    return true;
  } catch (error) {
    console.log('❌ 健康检查失败:', error.message);
    console.log('请确保 Plumber API 服务正在运行在', PLUMBER_API_URL);
    return false;
  }
}

// 主函数
async function main() {
  console.log('🧪 磷酸化分析新端点测试工具');
  console.log('📡 API地址:', PLUMBER_API_URL);
  console.log('🧬 测试基因:', 'KIT');
  console.log('🔬 测试位点:', 'KIT/S25');
  console.log('=' .repeat(50));
  
  // 先进行健康检查
  const isHealthy = await healthCheck();
  
  if (isHealthy) {
    // 测试新端点
    await testNewEndpoints();
  } else {
    console.log('\n⚠️ 跳过端点测试，因为API不可用');
    console.log('\n💡 启动Plumber API的方法:');
    console.log('   1. 进入项目根目录');
    console.log('   2. 运行: Rscript start_plumber_api.R');
    console.log('   3. 或者: Rscript phospho_plumber_api_fixed.R');
  }
  
  console.log('\n🏁 测试完成');
}

// 运行测试
main().catch(console.error);
