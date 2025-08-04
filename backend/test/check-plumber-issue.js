import axios from 'axios';

async function checkPlumberIssue() {
  console.log('=== 检查 Plumber API 问题 ===\n');
  
  try {
    // 1. 健康检查
    console.log('1. 健康检查:');
    const healthResponse = await axios.get('http://localhost:8001/phospho/health');
    console.log('健康状态:', healthResponse.data);
    console.log('数据已加载?', healthResponse.data.data_loaded);
    
    // 2. 测试不同的基因
    const genes = ['KIT', 'PDGFRA', 'ACSS2', 'INVALID_GENE'];
    
    for (const gene of genes) {
      console.log(`\n2. 查询 ${gene} 基因:`);
      try {
        const response = await axios.post('http://localhost:8001/phospho/query', {
          gene: gene
        });
        
        console.log(`状态: ${response.data.status}`);
        console.log(`消息: ${response.data.message}`);
        
        if (response.data.data) {
          if (Array.isArray(response.data.data)) {
            console.log(`数据条数: ${response.data.data.length}`);
          } else if (typeof response.data.data === 'object') {
            console.log(`数据类型: object, 键数量: ${Object.keys(response.data.data).length}`);
          } else {
            console.log(`数据类型: ${typeof response.data.data}`);
          }
        }
      } catch (error) {
        console.log(`查询 ${gene} 失败:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('检查失败:', error.message);
  }
}

checkPlumberIssue();