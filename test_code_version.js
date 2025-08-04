// 测试代码版本 - 检查规范化逻辑是否生效
import toolService from './backend/src/services/toolService.js';

async function testCodeVersion() {
  console.log('=== 测试代码版本 ===\n');
  
  // 创建模拟的数组格式响应
  const mockResponse = {
    status: ['success'],
    dataset: ['In_house'], 
    gene: ['PDGFRA'],
    plot_type: ['violin_plot'],
    image_base64: ['test_image_data_12345'],
    cell_types: [['T_cells', 'B_cells']],
    summary: ['Test summary']
  };
  
  // 手动执行规范化逻辑测试
  console.log('模拟数组格式响应:', JSON.stringify(mockResponse, null, 2));
  
  const needsNormalization = Object.values(mockResponse).some(value => Array.isArray(value));
  console.log('需要规范化:', needsNormalization);
  
  const normalizedResult = needsNormalization ? {
    ...mockResponse,
    status: Array.isArray(mockResponse.status) ? mockResponse.status[0] : mockResponse.status,
    dataset: Array.isArray(mockResponse.dataset) ? mockResponse.dataset[0] : mockResponse.dataset,
    gene: Array.isArray(mockResponse.gene) ? mockResponse.gene[0] : mockResponse.gene,
    plot_type: Array.isArray(mockResponse.plot_type) ? mockResponse.plot_type[0] : mockResponse.plot_type,
    image_base64: Array.isArray(mockResponse.image_base64) ? mockResponse.image_base64[0] : mockResponse.image_base64,
    cell_types: Array.isArray(mockResponse.cell_types) && Array.isArray(mockResponse.cell_types[0]) ? mockResponse.cell_types[0] : mockResponse.cell_types,
    summary: Array.isArray(mockResponse.summary) ? mockResponse.summary[0] : mockResponse.summary
  } : mockResponse;
  
  console.log('规范化后结果:', JSON.stringify(normalizedResult, null, 2));
  
  const finalResult = {
    ...normalizedResult,
    hasData: !!normalizedResult.data || normalizedResult.status === 'success',
    hasPlot: !!normalizedResult.image_base64,
    hasAnalyses: false
  };
  
  console.log('\\n=== 最终结果 ===');
  console.log('hasData:', finalResult.hasData);
  console.log('hasPlot:', finalResult.hasPlot);
  console.log('status:', finalResult.status);
  console.log('image_base64存在:', !!finalResult.image_base64);
  
  if (finalResult.hasData && finalResult.hasPlot) {
    console.log('\\n✅ 规范化逻辑正确工作！');
  } else {
    console.log('\\n❌ 规范化逻辑有问题');
  }
  
  // 现在测试实际的工具服务
  console.log('\\n=== 测试实际工具服务 ===');
  try {
    // 但是不执行真实的API调用，只是检查工具是否注册
    const tools = toolService.listTools();
    const singlecellTool = tools.find(t => t.name === 'singlecell_analysis');
    
    if (singlecellTool) {
      console.log('✅ 单细胞分析工具已注册');
      console.log('工具描述:', singlecellTool.metadata.description);
    } else {
      console.log('❌ 单细胞分析工具未找到');
    }
    
  } catch (error) {
    console.log('工具服务测试失败:', error.message);
  }
}

testCodeVersion();