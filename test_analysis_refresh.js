/**
 * 测试分析结果刷新功能
 * 这个脚本模拟连续发送不同类型的分析请求，验证结果面板是否正确刷新
 */

const TEST_URL = 'http://localhost:8000/api/chat';

async function testAnalysisRefresh() {
  console.log('🧪 开始测试分析结果刷新功能...\n');

  // 测试序列：转录组 -> 磷酸化 -> 单细胞
  const testCases = [
    {
      name: '转录组分析',
      message: 'KIT基因的转录组学分析',
      expectedType: 'transcriptomeAnalysis'
    },
    {
      name: '磷酸化分析',
      message: 'KIT基因的磷酸化分析',
      expectedType: 'phosphoAnalysis'
    },
    {
      name: '单细胞分析',
      message: 'KIT基因的单细胞小提琴图分析',
      expectedType: 'singleCellAnalysis'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📊 测试 ${i + 1}: ${testCase.name}`);
    console.log(`发送消息: "${testCase.message}"`);

    try {
      const response = await fetch(TEST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testCase.message,
          sessionId: `test-session-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ 响应状态:', response.status);
      console.log('📝 AI回复:', data.reply ? data.reply.substring(0, 100) + '...' : '无回复');
      
      // 检查分析结果
      const hasPhospho = !!data.phosphoAnalysis;
      const hasTranscriptome = !!data.transcriptomeAnalysis;  
      const hasSingleCell = !!data.singleCellAnalysis;
      
      console.log('🔬 分析结果:');
      console.log(`  - 磷酸化分析: ${hasPhospho ? '✓' : '✗'}`);
      console.log(`  - 转录组分析: ${hasTranscriptome ? '✓' : '✗'}`);
      console.log(`  - 单细胞分析: ${hasSingleCell ? '✓' : '✗'}`);
      
      // 验证预期结果
      const hasExpectedResult = data[testCase.expectedType];
      if (hasExpectedResult) {
        console.log(`✅ 预期的${testCase.name}结果存在`);
      } else {
        console.log(`❌ 预期的${testCase.name}结果不存在`);
      }

      // 检查是否有意外的其他分析结果
      const otherResults = Object.keys(data).filter(key => 
        key.endsWith('Analysis') && key !== testCase.expectedType && data[key]
      );
      
      if (otherResults.length > 0) {
        console.log(`⚠️  检测到其他分析结果: ${otherResults.join(', ')}`);
      } else {
        console.log('✅ 没有意外的其他分析结果');
      }
      
    } catch (error) {
      console.error(`❌ 测试失败:`, error.message);
    }

    // 等待2秒再进行下一个测试
    if (i < testCases.length - 1) {
      console.log('\n⏳ 等待2秒再进行下一个测试...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n🏁 测试完成！');
}

// 运行测试
testAnalysisRefresh().catch(console.error);