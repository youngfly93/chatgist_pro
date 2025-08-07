// 测试单细胞服务路径修复
import singleCellService from './backend/src/services/singleCellService.js';

async function testSingleCellService() {
  console.log('=== 测试单细胞服务路径修复 ===\n');
  
  try {
    // 检查健康状态
    console.log('1. 检查服务健康状态...');
    const health = await singleCellService.getHealthStatus();
    console.log('健康状态:', JSON.stringify(health, null, 2));
    
    if (!health.r_script_exists) {
      console.log('❌ R 脚本文件不存在，路径配置仍有问题');
      return;
    }
    
    console.log('✅ R 脚本文件路径正确');
    
    // 测试简单的基因查询
    console.log('\n2. 测试基因查询 (KIT)...');
    const queryResult = await singleCellService.queryGeneInfo('KIT');
    
    if (queryResult.status === 'success') {
      console.log('✅ 基因查询成功!');
      console.log('数据集:', queryResult.dataset);
      console.log('细胞类型数量:', queryResult.n_cell_types);
      console.log('总细胞数:', queryResult.total_cells);
    } else {
      console.log('❌ 基因查询失败:', queryResult.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error.stack);
  }
}

testSingleCellService();