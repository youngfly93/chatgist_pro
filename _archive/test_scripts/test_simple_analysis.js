// 简单测试PDGFRA分析
import axios from 'axios';

async function testSimpleAnalysis() {
  console.log('=== 测试单个PDGFRA分析 ===\n');
  
  try {
    const response = await axios.post('http://localhost:8000/api/chat/v2', {
      message: 'PDGFRA基因单细胞小提琴图分析'
    }, {
      timeout: 180000
    });
    
    if (response.status === 200) {
      console.log('✅ 分析完成');
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

testSimpleAnalysis();