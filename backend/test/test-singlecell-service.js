// 测试单细胞服务集成
import singleCellService from '../src/services/singleCellService.js';

async function testSingleCellService() {
  console.log('=== 测试 Single-cell Service ===\n');
  
  try {
    // 1. 健康检查
    console.log('1. 健康检查...');
    const health = await singleCellService.getHealthStatus();
    console.log('健康状态:', JSON.stringify(health, null, 2));
    console.log('✅ 健康检查完成\n');
    
    // 2. 查询基因信息
    console.log('2. 查询基因信息 (KIT)...');
    const queryResult = await singleCellService.queryGeneInfo('KIT');
    if (queryResult.status === 'success') {
      console.log('✅ 基因查询成功');
      console.log('数据集:', queryResult.dataset);
      console.log('细胞类型数量:', queryResult.n_cell_types);
      console.log('总细胞数:', queryResult.total_cells);
    } else {
      console.log('❌ 基因查询失败:', queryResult.message);
    }
    console.log();
    
    // 3. 生成小提琴图
    console.log('3. 生成小提琴图 (MCM7)...');
    const violinResult = await singleCellService.generateViolinPlot('MCM7');
    if (violinResult.status === 'success') {
      console.log('✅ 小提琴图生成成功');
      console.log('数据集:', violinResult.dataset);
      console.log('细胞类型:', violinResult.cell_types);
      console.log('图片大小:', violinResult.image_base64 ? (violinResult.image_base64.length + ' 字符') : '无图片');
    } else {
      console.log('❌ 小提琴图生成失败:', violinResult.message);
    }
    console.log();
    
    // 4. 生成 UMAP 细胞类型图
    console.log('4. 生成 UMAP 细胞类型图...');
    const umapCelltypeResult = await singleCellService.generateUMAPCelltype();
    if (umapCelltypeResult.status === 'success') {
      console.log('✅ UMAP 细胞类型图生成成功');
      console.log('数据集:', umapCelltypeResult.dataset);
      console.log('细胞类型:', umapCelltypeResult.cell_types);
      console.log('总细胞数:', umapCelltypeResult.total_cells);
    } else {
      console.log('❌ UMAP 细胞类型图生成失败:', umapCelltypeResult.message);
    }
    console.log();
    
    // 5. 生成 UMAP 基因表达图
    console.log('5. 生成 UMAP 基因表达图 (KIT)...');
    const umapExprResult = await singleCellService.generateUMAPExpression('KIT');
    if (umapExprResult.status === 'success') {
      console.log('✅ UMAP 基因表达图生成成功');
      console.log('数据集:', umapExprResult.dataset);
      console.log('表达细胞数:', umapExprResult.positive_cells);
      console.log('表达范围:', umapExprResult.expression_range);
    } else {
      console.log('❌ UMAP 基因表达图生成失败:', umapExprResult.message);
    }
    console.log();
    
    // 6. 综合分析
    console.log('6. 综合分析 (PDGFRA)...');
    const comprehensiveResult = await singleCellService.comprehensiveAnalysis('PDGFRA');
    if (comprehensiveResult.summary && comprehensiveResult.summary.status === 'success') {
      console.log('✅ 综合分析完成');
      console.log('基因:', comprehensiveResult.summary.gene);
      console.log('数据集:', comprehensiveResult.summary.dataset);
      console.log('分析类型:', comprehensiveResult.summary.analysis_types);
      console.log('成功的分析:', comprehensiveResult.summary.successful_analyses, '/', comprehensiveResult.summary.total_analyses);
    } else {
      console.log('❌ 综合分析失败:', comprehensiveResult.message || '未知错误');
    }
    
    console.log('\n=== 所有测试完成 ===');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
    console.error('错误详情:', error.stack);
  }
}

// 运行测试
testSingleCellService();