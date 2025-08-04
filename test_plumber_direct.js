// 直接测试 Plumber API
import axios from 'axios';

const PLUMBER_URL = 'http://localhost:8003';

async function testPlumberAPI() {
  console.log('=== 测试 Single-cell Plumber API ===\n');
  
  try {
    // 1. 健康检查
    console.log('1. 健康检查...');
    const healthResponse = await axios.get(`${PLUMBER_URL}/singlecell/health`, {
      timeout: 5000
    });
    
    if (healthResponse.status === 200) {
      console.log('✅ Plumber API 运行正常');
      console.log('健康状态:', healthResponse.data);
    }
    
    // 2. 基因查询
    console.log('\n2. 测试基因查询 (KIT)...');
    const queryResponse = await axios.post(`${PLUMBER_URL}/singlecell/query`, {
      gene: 'KIT'
    }, {
      timeout: 60000
    });
    
    if (queryResponse.status === 200) {
      console.log('✅ 基因查询成功');
      console.log('数据集:', queryResponse.data.dataset);
      console.log('细胞类型:', queryResponse.data.cell_types);
    }
    
    // 3. 小提琴图
    console.log('\n3. 测试小提琴图生成 (KIT)...');
    const violinResponse = await axios.post(`${PLUMBER_URL}/singlecell/violin`, {
      gene: 'KIT'
    }, {
      timeout: 120000
    });
    
    if (violinResponse.status === 200) {
      console.log('✅ 小提琴图生成成功');
      console.log('图片数据长度:', violinResponse.data.image_base64 ? violinResponse.data.image_base64.length : 0);
    }
    
    console.log('\n✅ 所有 Plumber API 测试通过！');
    
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

testPlumberAPI();