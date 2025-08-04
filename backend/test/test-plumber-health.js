import axios from 'axios';

async function testPlumberHealth() {
  console.log('=== 测试 Plumber API 健康状态 ===');
  
  try {
    console.log('正在连接 http://localhost:8001/phospho/health ...');
    const response = await axios.get('http://localhost:8001/phospho/health', {
      timeout: 5000
    });
    
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data.status === 'healthy' || response.data.status?.[0] === 'healthy') {
      console.log('✅ Plumber API 正常运行！');
    } else {
      console.log('❌ Plumber API 状态异常');
    }
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Plumber API 服务未启动在 8001 端口');
    }
  }
}

// 测试 phosphoService 中的健康检查逻辑
async function testHealthCheckLogic() {
  console.log('\n=== 测试健康检查逻辑 ===');
  
  try {
    const response = await axios.get('http://localhost:8001/phospho/health');
    const data = response.data;
    
    console.log('原始响应:', data);
    console.log('response.data.status:', data.status);
    console.log('response.data.status === "healthy":', data.status === 'healthy');
    console.log('response.data.status 类型:', typeof data.status);
    
    // 注意：Plumber 可能返回数组格式
    if (Array.isArray(data.status)) {
      console.log('status 是数组，第一个元素:', data.status[0]);
      console.log('data.status[0] === "healthy":', data.status[0] === 'healthy');
    }
  } catch (error) {
    console.error('错误:', error.message);
  }
}

async function main() {
  await testPlumberHealth();
  await testHealthCheckLogic();
}

main();