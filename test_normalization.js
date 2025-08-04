// Test the normalization logic directly
const testData = {
  "status": ["success"],
  "dataset": ["In_house"],
  "gene": ["PDGFRA"],
  "plot_type": ["violin_plot"], 
  "image_base64": ["iVBORw0KGgoAAAANSUhEUgAAC..."],
  "cell_types": [["Endothelial", "Fibroblast", "Smooth muscle", "T cell", "B cell", "Macrophage", "Neutrophil", "NK cell", "Dendritic cell", "Mast cell", "Plasma cell"]],
  "summary": ["Violin plot showing PDGFRA expression across 11 cell types in In_house dataset"]
};

function testNormalization() {
  console.log('=== 测试数组格式规范化 ===\n');
  
  console.log('原始 R Plumber API 响应:', JSON.stringify(testData, null, 2));
  
  // 检查是否需要规范化（任何字段是数组）
  const needsNormalization = Object.values(testData).some(value => Array.isArray(value));
  console.log('需要规范化:', needsNormalization);
  
  const normalizedResult = needsNormalization ? {
    ...testData,
    status: Array.isArray(testData.status) ? testData.status[0] : testData.status,
    dataset: Array.isArray(testData.dataset) ? testData.dataset[0] : testData.dataset,
    gene: Array.isArray(testData.gene) ? testData.gene[0] : testData.gene,
    plot_type: Array.isArray(testData.plot_type) ? testData.plot_type[0] : testData.plot_type,
    image_base64: Array.isArray(testData.image_base64) ? testData.image_base64[0] : testData.image_base64,
    cell_types: Array.isArray(testData.cell_types) && Array.isArray(testData.cell_types[0]) ? testData.cell_types[0] : testData.cell_types,
    summary: Array.isArray(testData.summary) ? testData.summary[0] : testData.summary
  } : testData;

  console.log('\\n规范化后结果:', JSON.stringify(normalizedResult, null, 2));

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
  console.log('dataset:', finalResult.dataset);
  console.log('gene:', finalResult.gene);
  console.log('图片数据长度:', finalResult.image_base64 ? finalResult.image_base64.length : 0);

  if (finalResult.hasPlot && finalResult.image_base64) {
    console.log('\\n✅ 规范化逻辑正确！');
  } else {
    console.log('\\n❌ 规范化逻辑有问题');
  }
}

testNormalization();