import axios from 'axios';

async function testPlumberData() {
  console.log('=== 测试 Plumber API 数据返回 ===\n');
  
  try {
    // 测试查询
    console.log('1. 测试查询 KIT 基因:');
    const queryResponse = await axios.post('http://localhost:8001/phospho/query', {
      gene: 'KIT'
    });
    console.log('状态:', queryResponse.data.status);
    console.log('消息:', queryResponse.data.message);
    console.log('数据条数:', queryResponse.data.data?.length || 0);
    console.log('第一条数据:', queryResponse.data.data?.[0]);
    
    // 测试箱线图
    console.log('\n2. 测试 boxplot_TvsN:');
    const boxplotResponse = await axios.post('http://localhost:8001/phospho/boxplot/TvsN', {
      gene: 'KIT',
      site: 'KIT/S25'
    });
    console.log('状态:', boxplotResponse.data.status);
    console.log('有图片吗?', !!boxplotResponse.data.plot);
    if (boxplotResponse.data.plot) {
      console.log('图片格式:', boxplotResponse.data.plot.substring(0, 30) + '...');
    }
    
    // 测试综合分析
    console.log('\n3. 测试综合分析:');
    const comprehensiveResponse = await axios.post('http://localhost:8001/phospho/comprehensive', {
      gene: 'KIT'
    });
    console.log('状态:', comprehensiveResponse.data.status);
    console.log('有 analyses 吗?', !!comprehensiveResponse.data.analyses);
    if (comprehensiveResponse.data.analyses) {
      console.log('分析类型:', Object.keys(comprehensiveResponse.data.analyses));
    }
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testPlumberData();