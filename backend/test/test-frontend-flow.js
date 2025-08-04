import axios from 'axios';

async function testFrontendFlow() {
  console.log('=== 测试前端工作流程 ===\n');
  
  try {
    // 模拟前端发送的请求
    console.log('1. 发送箱线图分析请求 (KIT基因):');
    const response = await axios.post('http://localhost:8000/api/chat', {
      message: '对KIT进行肿瘤vs正常组织分析',
      sessionId: 'test-frontend'
    }, {
      timeout: 30000
    });
    
    console.log('\n响应状态:', response.status);
    console.log('有回复?', !!response.data.reply);
    console.log('回复长度:', response.data.reply?.length);
    
    if (response.data.phosphoAnalysis) {
      console.log('\n磷酸化分析结果:');
      console.log('- 状态:', response.data.phosphoAnalysis.status);
      console.log('- 消息:', response.data.phosphoAnalysis.message);
      console.log('- 有图片?', !!response.data.phosphoAnalysis.plot);
      
      if (response.data.phosphoAnalysis.plot) {
        console.log('- 图片格式正确?', response.data.phosphoAnalysis.plot.startsWith('data:image/png;base64,'));
        console.log('- 图片长度:', response.data.phosphoAnalysis.plot.length);
      }
    } else {
      console.log('\n没有磷酸化分析结果');
    }
    
    // 测试具体位点
    console.log('\n\n2. 发送具体位点分析请求 (KIT/S25):');
    const response2 = await axios.post('http://localhost:8000/api/chat', {
      message: '分析KIT/S25在肿瘤和正常组织中的差异',
      sessionId: 'test-frontend-2'
    }, {
      timeout: 30000
    });
    
    console.log('响应状态:', response2.status);
    if (response2.data.phosphoAnalysis) {
      console.log('分析结果:', {
        status: response2.data.phosphoAnalysis.status,
        hasPlot: !!response2.data.phosphoAnalysis.plot
      });
    }
    
  } catch (error) {
    console.error('\n请求失败:');
    console.error('错误类型:', error.code);
    console.error('错误消息:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testFrontendFlow();