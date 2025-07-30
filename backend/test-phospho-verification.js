// 测试文件：验证AI是否真的执行了R脚本

import phosphoService from './src/services/phosphoService.js';

console.log('=== 磷酸化服务验证测试 ===\n');

// 测试1：直接调用phosphoService
console.log('测试1：直接调用phosphoService分析KIT基因');
try {
  const result = await phosphoService.analyze({
    function: 'query',
    gene: 'KIT'
  });
  
  if (result.status === 'success') {
    console.log('✓ R脚本执行成功！');
    console.log('返回数据类型:', Object.keys(result));
    if (result.plot) {
      console.log('✓ 包含图表数据 (base64长度):', result.plot.length);
    }
    if (result.data) {
      console.log('✓ 包含分析数据');
    }
  } else {
    console.log('✗ R脚本执行失败:', result.message);
  }
} catch (error) {
  console.log('✗ 错误:', error.message);
}

console.log('\n=== 如何在AI聊天中验证 ===');
console.log('1. 在AI聊天中输入: "帮我分析KIT基因的磷酸化位点"');
console.log('2. 观察响应中是否包含:');
console.log('   - 图表显示');
console.log('   - "查看详细数据"折叠项');
console.log('3. 同时查看后端控制台是否有"PHOSPHO ANALYSIS"相关日志');
console.log('\n如果以上都出现，说明AI确实触发了R脚本执行！');