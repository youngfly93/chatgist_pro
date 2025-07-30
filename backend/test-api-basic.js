// 基础API测试
import axios from 'axios';
import 'dotenv/config';

async function testBasic() {
  console.log('=== 基础API测试 ===\n');
  
  // 显示当前配置
  console.log('USE_KIMI:', process.env.USE_KIMI);
  console.log('KIMI_API_KEY exists:', !!process.env.KIMI_API_KEY);
  console.log('Backend URL: http://localhost:8000\n');
  
  try {
    // 1. 测试后端是否运行
    console.log('1. 测试后端连接...');
    const healthCheck = await axios.get('http://localhost:8000/api/gene/search/KIT');
    console.log('✓ 后端正在运行\n');
  } catch (error) {
    console.error('✗ 后端连接失败:', error.message);
    console.log('请确保后端服务正在运行 (npm run dev)\n');
    return;
  }
  
  try {
    // 2. 测试简单聊天
    console.log('2. 测试Kimi聊天API...');
    const response = await axios.post('http://localhost:8000/api/chat', {
      message: '你好',
      stream: false
    }, {
      timeout: 10000
    });
    
    console.log('✓ 聊天API工作正常');
    console.log('AI回复:', response.data.reply.substring(0, 100) + '...\n');
    
  } catch (error) {
    console.error('\n✗ 聊天API错误:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else if (error.request) {
      console.error('无响应，请检查后端是否正常运行');
    } else {
      console.error('请求错误:', error.message);
    }
  }
}

testBasic();