import axios from 'axios';

async function testSimple() {
  try {
    console.log('测试简单请求到 /api/chat...');
    const response = await axios.post('http://localhost:8000/api/chat', {
      message: '你好',
      sessionId: 'test'
    });
    console.log('成功！响应:', response.data);
  } catch (error) {
    console.error('失败！');
    if (error.code === 'ECONNREFUSED') {
      console.error('错误: 无法连接到服务器，请确保后端服务正在运行');
    } else if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else {
      console.error('错误:', error.message);
    }
  }
}

testSimple();