// 测试Kimi API集成
// 运行: node test-kimi-integration.js

import axios from 'axios';

async function testKimiIntegration() {
  console.log('=== 测试Kimi API集成 ===\n');

  const apiUrl = 'http://localhost:8000/api/chat';

  // 测试消息
  const testCases = [
    {
      name: "基本对话测试",
      message: "你好，请介绍一下GIST",
      expectedContent: ["GIST", "胃肠道间质瘤"]
    },
    {
      name: "磷酸化查询测试",
      message: "我想查询KIT的磷酸化位点",
      expectedContent: ["KIT", "磷酸化", "位点"],
      expectsPhosphoAnalysis: true
    },
    {
      name: "肿瘤vs正常分析测试",
      message: "分析PDGFRA在肿瘤和正常组织中的磷酸化水平差异",
      expectedContent: ["PDGFRA", "肿瘤", "正常"],
      expectsPhosphoAnalysis: true
    },
    {
      name: "生存分析测试",
      message: "研究TP53磷酸化水平对生存的影响",
      expectedContent: ["TP53", "生存"],
      expectsPhosphoAnalysis: true
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n测试: ${testCase.name}`);
    console.log(`消息: "${testCase.message}"`);
    console.log('---');

    try {
      const startTime = Date.now();
      const response = await axios.post(apiUrl, {
        message: testCase.message,
        stream: false
      });
      const endTime = Date.now();

      console.log(`响应时间: ${endTime - startTime}ms`);
      console.log('状态: 成功');

      // 检查响应内容
      const reply = response.data.reply;
      console.log(`回复长度: ${reply.length} 字符`);
      
      // 验证预期内容
      const containsExpected = testCase.expectedContent.every(keyword => 
        reply.includes(keyword)
      );
      console.log(`包含预期内容: ${containsExpected ? '✓' : '✗'}`);

      // 检查磷酸化分析
      if (testCase.expectsPhosphoAnalysis) {
        const hasPhosphoAnalysis = !!response.data.phosphoAnalysis;
        console.log(`包含磷酸化分析: ${hasPhosphoAnalysis ? '✓' : '✗'}`);
        
        if (hasPhosphoAnalysis) {
          const analysis = response.data.phosphoAnalysis;
          console.log(`  - 状态: ${analysis.status}`);
          console.log(`  - 消息: ${analysis.message}`);
          console.log(`  - 包含图表: ${!!analysis.plot}`);
        }
      }

      // 显示部分回复
      console.log('\nAI回复摘要:');
      console.log(reply.substring(0, 200) + '...');

    } catch (error) {
      console.log('状态: 失败');
      console.error('错误:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(60));
  }

  console.log('\n=== 测试完成 ===');
  console.log('\n注意事项:');
  console.log('1. 确保后端服务已启动 (npm run dev)');
  console.log('2. 确保.env文件中USE_KIMI=true');
  console.log('3. 确保KIMI_API_KEY已正确配置');
  console.log('4. 查看后端控制台日志了解详细执行情况');
}

// 运行测试
testKimiIntegration().catch(console.error);