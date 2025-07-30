// 测试磷酸化分析集成
// 运行: node test-phospho-integration.js

import axios from 'axios';

async function testPhosphoIntegration() {
  console.log('=== 测试磷酸化分析集成 ===\n');

  const apiUrl = 'http://localhost:8000/api/chat';

  // 测试消息
  const testMessages = [
    {
      message: "我想查询KIT的磷酸化位点",
      expectedFunction: "query"
    },
    {
      message: "分析KIT在肿瘤和正常组织中的磷酸化水平差异",
      expectedFunction: "boxplot_TvsN"
    },
    {
      message: "研究PDGFRA的风险分层与磷酸化的关系",
      expectedFunction: "boxplot_Risk"
    }
  ];

  for (const test of testMessages) {
    console.log(`\n测试: "${test.message}"`);
    console.log(`期望的分析类型: ${test.expectedFunction}`);
    console.log('---');

    try {
      const response = await axios.post(apiUrl, {
        message: test.message,
        stream: false
      });

      console.log('AI回复摘要:', response.data.reply.substring(0, 200) + '...');
      
      if (response.data.phosphoAnalysis) {
        console.log('\n磷酸化分析结果:');
        console.log('- 状态:', response.data.phosphoAnalysis.status);
        console.log('- 消息:', response.data.phosphoAnalysis.message);
        console.log('- 包含图表:', !!response.data.phosphoAnalysis.plot);
        console.log('- 包含数据:', !!response.data.phosphoAnalysis.data);
      } else {
        console.log('\n⚠️ 未检测到磷酸化分析结果');
      }

    } catch (error) {
      console.error('错误:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50));
  }

  console.log('\n=== 测试完成 ===');
  console.log('\n检查后端控制台日志以查看详细的执行过程。');
}

// 运行测试
testPhosphoIntegration().catch(console.error);