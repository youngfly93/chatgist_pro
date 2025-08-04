// 测试修复后的单细胞分析功能
import axios from 'axios';

async function testSingleCellFixed() {
  console.log('=== 测试修复后的单细胞分析功能 ===\n');
  
  const baseURL = 'http://localhost:8000/api';
  
  try {
    // 1. 测试单细胞小提琴图分析
    console.log('1. 测试单细胞小提琴图分析 (KIT)...');
    const violinResponse = await axios.post(`${baseURL}/tool-call`, {
      tool_calls: [{
        name: 'singlecell_analysis',
        args: {
          function_type: 'violin_plot',
          gene: 'KIT',
          dataset: 'auto'
        }
      }]
    }, {
      timeout: 120000
    });
    
    if (violinResponse.status === 200) {
      const result = violinResponse.data.results[0];
      console.log('✅ 单细胞小提琴图分析响应成功');
      console.log('状态:', result.success ? '成功' : '失败');
      if (result.success) {
        console.log('hasData:', result.result.hasData);
        console.log('hasPlot:', result.result.hasPlot);
        console.log('数据集:', result.result.dataset);
        console.log('基因:', result.result.gene);
        console.log('图片数据长度:', result.result.image_base64 ? result.result.image_base64.length : 0);
      } else {
        console.log('错误:', result.error);
      }
    }
    
    // 2. 测试基因查询
    console.log('\n2. 测试基因查询 (KIT)...');
    const queryResponse = await axios.post(`${baseURL}/tool-call`, {
      tool_calls: [{
        name: 'singlecell_analysis',
        args: {
          function_type: 'query',
          gene: 'KIT',
          dataset: 'auto'
        }
      }]
    }, {
      timeout: 60000
    });
    
    if (queryResponse.status === 200) {
      const result = queryResponse.data.results[0];
      console.log('✅ 基因查询响应成功');
      console.log('状态:', result.success ? '成功' : '失败');
      if (result.success) {
        console.log('hasData:', result.result.hasData);
        console.log('数据集:', result.result.dataset);
        console.log('细胞类型数量:', result.result.cell_types ? result.result.cell_types.length : 0);
      } else {
        console.log('错误:', result.error);
      }
    }
    
    console.log('\n✅ 修复后的单细胞分析功能测试完成！');
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
  }
}

testSingleCellFixed();