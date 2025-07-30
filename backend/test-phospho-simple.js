// 简单测试磷酸化分析
import axios from 'axios';

async function testPhospho() {
  console.log('测试磷酸化分析...\n');
  
  try {
    // 测试1: 基本聊天
    console.log('1. 测试基本聊天（非流式）');
    const res1 = await axios.post('http://localhost:8000/api/chat', {
      message: '你好',
      stream: false
    });
    console.log('基本聊天成功:', res1.data.reply.substring(0, 50) + '...');
    
    // 测试2: 磷酸化查询
    console.log('\n2. 测试磷酸化查询');
    const res2 = await axios.post('http://localhost:8000/api/chat', {
      message: '我想查询KIT的磷酸化位点',
      stream: false
    });
    console.log('磷酸化查询响应:');
    console.log('- AI回复:', res2.data.reply.substring(0, 100) + '...');
    console.log('- 包含磷酸化分析:', !!res2.data.phosphoAnalysis);
    
    if (res2.data.phosphoAnalysis) {
      console.log('- 分析状态:', res2.data.phosphoAnalysis.status);
      console.log('- 分析消息:', res2.data.phosphoAnalysis.message);
    }
    
  } catch (error) {
    console.error('错误:', error.response?.data || error.message);
  }
}

testPhospho();