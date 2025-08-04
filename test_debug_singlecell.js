// Debug single-cell analysis to see raw API response
import axios from 'axios';

async function testDebugSingleCell() {
  console.log('=== Debug Single-cell Analysis ===\n');
  
  const baseURL = 'http://localhost:8000/api';
  
  try {
    console.log('测试 PDGFRA 基因单细胞小提琴图分析...');
    
    const response = await axios.post(`${baseURL}/chat`, {
      message: 'PDGFRA基因单细胞水平的小提琴图分析'
    }, {
      timeout: 120000
    });
    
    if (response.status === 200) {
      console.log('✅ 聊天接口响应成功');
      console.log('AI响应:', response.data.response);
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
  }
}

testDebugSingleCell();