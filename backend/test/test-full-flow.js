import axios from 'axios';

async function testFullFlow() {
  console.log('=== 测试完整的 Tool Calling 流程 ===\n');
  
  try {
    // 1. 先测试简单问候
    console.log('1. 测试简单对话:');
    const helloResponse = await axios.post('http://localhost:8000/api/chat', {
      message: '你好',
      sessionId: 'test'
    });
    console.log('回复长度:', helloResponse.data.reply?.length);
    console.log('有 phosphoAnalysis?', !!helloResponse.data.phosphoAnalysis);
    
    // 2. 测试单个分析
    console.log('\n2. 测试单个分析 - 查询KIT基因:');
    const queryResponse = await axios.post('http://localhost:8000/api/chat', {
      message: '请查询KIT基因的磷酸化位点',
      sessionId: 'test'
    });
    console.log('回复:', queryResponse.data.reply?.substring(0, 100) + '...');
    console.log('有 phosphoAnalysis?', !!queryResponse.data.phosphoAnalysis);
    
    if (queryResponse.data.phosphoAnalysis) {
      const analysis = queryResponse.data.phosphoAnalysis;
      console.log('\n磷酸化分析结果:');
      console.log('- 状态:', analysis.status);
      console.log('- 消息:', analysis.message);
      console.log('- 有数据?', !!analysis.data);
      console.log('- 数据条数:', analysis.data?.length);
      console.log('- 第一条数据:', analysis.data?.[0]);
    }
    
    // 3. 测试综合分析
    console.log('\n3. 测试综合分析:');
    const comprehensiveResponse = await axios.post('http://localhost:8000/api/chat', {
      message: '对KIT基因进行全面分析',
      sessionId: 'test'
    });
    console.log('回复:', comprehensiveResponse.data.reply?.substring(0, 100) + '...');
    console.log('有 phosphoAnalysis?', !!comprehensiveResponse.data.phosphoAnalysis);
    
    if (comprehensiveResponse.data.phosphoAnalysis) {
      const analysis = comprehensiveResponse.data.phosphoAnalysis;
      console.log('\n综合分析结果:');
      console.log('- 状态:', analysis.status);
      console.log('- 消息:', analysis.message);
      console.log('- 有 analyses?', !!analysis.analyses);
      console.log('- 有 summary?', !!analysis.summary);
      
      if (analysis.analyses) {
        console.log('- 分析类型:', Object.keys(analysis.analyses));
        
        // 检查第一个分析的图片
        const firstAnalysis = Object.values(analysis.analyses)[0];
        if (firstAnalysis && firstAnalysis.plot) {
          console.log('\n第一个分析有图片!');
          console.log('图片格式:', firstAnalysis.plot.substring(0, 50) + '...');
        }
      }
    }
    
    // 4. 检查 toolCalls
    if (comprehensiveResponse.data.toolCalls) {
      console.log('\n工具调用详情:');
      console.log('调用次数:', comprehensiveResponse.data.toolCalls.length);
      comprehensiveResponse.data.toolCalls.forEach((tc, i) => {
        console.log(`\n工具 ${i+1}:`, tc.tool);
        console.log('参数:', tc.args);
        console.log('结果状态:', tc.result?.status);
      });
    }
    
  } catch (error) {
    console.error('\n测试失败:');
    console.error('状态码:', error.response?.status);
    console.error('错误:', error.response?.data || error.message);
  }
}

testFullFlow();