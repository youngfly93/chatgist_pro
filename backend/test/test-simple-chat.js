import axios from 'axios';

async function testSimpleChat() {
  console.log('=== 简单聊天测试 ===\n');
  
  try {
    // 测试不需要工具调用的简单对话
    console.log('1. 测试简单问候:');
    const response = await axios.post('http://localhost:8000/api/chat', {
      message: '你好，请简单介绍一下GIST',
      sessionId: 'test-simple'
    }, {
      timeout: 30000 // 30秒超时
    });
    
    console.log('状态码:', response.status);
    console.log('有回复吗?', !!response.data.reply);
    console.log('回复长度:', response.data.reply?.length);
    console.log('回复前100字符:', response.data.reply?.substring(0, 100) + '...');
    
  } catch (error) {
    console.error('\n错误详情:');
    console.error('错误类型:', error.code);
    console.error('错误消息:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testSimpleChat();