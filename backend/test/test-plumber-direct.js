// Direct test of Plumber API to see raw response
import axios from 'axios';

async function testPlumberDirect() {
  console.log('=== 直接测试 Single-cell Plumber API ===\n');
  
  const PLUMBER_URL = 'http://localhost:8003';
  
  try {
    // Test violin plot for PDGFRA
    console.log('测试 PDGFRA 小提琴图...');
    const violinResponse = await axios.post(`${PLUMBER_URL}/singlecell/violin`, {
      gene: 'PDGFRA'
    }, {
      timeout: 120000
    });
    
    if (violinResponse.status === 200) {
      console.log('✅ Plumber API 调用成功');
      console.log('原始响应结构:');
      console.log('- status type:', typeof violinResponse.data.status, 'value:', violinResponse.data.status);
      console.log('- dataset type:', typeof violinResponse.data.dataset, 'value:', violinResponse.data.dataset);
      console.log('- gene type:', typeof violinResponse.data.gene, 'value:', violinResponse.data.gene);
      console.log('- plot_type type:', typeof violinResponse.data.plot_type, 'value:', violinResponse.data.plot_type);
      console.log('- image_base64 type:', typeof violinResponse.data.image_base64, 'length:', violinResponse.data.image_base64 ? violinResponse.data.image_base64.length : 0);
      console.log('- cell_types type:', typeof violinResponse.data.cell_types, 'length:', violinResponse.data.cell_types ? violinResponse.data.cell_types.length : 0);
      
      console.log('\n完整原始响应:');
      console.log(JSON.stringify(violinResponse.data, null, 2));
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ 无法连接到 Plumber API');
      console.log('请运行: start_singlecell_api.bat 启动 API 服务器');
    } else {
      console.log('❌ 测试失败:', error.message);
      if (error.response) {
        console.log('响应状态:', error.response.status);
        console.log('响应数据:', error.response.data);
      }
    }
  }
}

testPlumberDirect();