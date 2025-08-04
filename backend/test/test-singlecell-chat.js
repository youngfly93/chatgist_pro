// 测试修复后的单细胞分析功能 - 通过聊天接口
import axios from 'axios';

async function testSingleCellChat() {
  console.log('=== 测试修复后的单细胞分析功能 (Chat接口) ===\n');
  
  const baseURL = 'http://localhost:8000/api';
  
  try {
    // 设置环境变量测试
    process.env.USE_KIMI = 'true';
    process.env.KIMI_API_KEY = 'sk-test'; // 模拟key，只是测试工具调用
    
    // 1. 测试单细胞小提琴图分析
    console.log('1. 测试单细胞小提琴图分析...');
    const chatResponse = await axios.post(`${baseURL}/chat`, {
      message: '请帮我分析KIT基因的单细胞小提琴图'
    }, {
      timeout: 120000
    });
    
    if (chatResponse.status === 200) {
      console.log('✅ 聊天接口响应成功');
      console.log('响应内容:', chatResponse.data);
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
  }
}

testSingleCellChat();