// 直接测试Kimi API
import axios from 'axios';
import 'dotenv/config';

async function testKimiDirect() {
  console.log('=== 直接测试Kimi API ===\n');
  
  const apiKey = process.env.KIMI_API_KEY;
  console.log('API Key from env:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  
  if (!apiKey) {
    console.error('错误：未找到KIMI_API_KEY环境变量');
    return;
  }
  
  const requestData = {
    model: "kimi-k2-0711-preview",  // 最新的Kimi模型
    messages: [
      {
        role: "system",
        content: "你是Kimi，由Moonshot AI提供的AI助手。"
      },
      {
        role: "user",
        content: "你好，请简单介绍一下自己。"
      }
    ],
    temperature: 0.6
  };
  
  console.log('\n请求配置:');
  console.log('URL:', 'https://api.moonshot.cn/v1/chat/completions');
  console.log('Model:', requestData.model);
  console.log('Headers:', {
    'Authorization': `Bearer ${apiKey.substring(0, 10)}...`,
    'Content-Type': 'application/json'
  });
  
  try {
    console.log('\n发送请求...');
    const response = await axios.post(
      'https://api.moonshot.cn/v1/chat/completions',
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('\n✓ 请求成功！');
    console.log('响应状态:', response.status);
    console.log('响应内容:', response.data.choices[0].message.content);
    
  } catch (error) {
    console.error('\n✗ 请求失败！');
    console.error('错误状态:', error.response?.status);
    console.error('错误信息:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('\n可能的原因:');
      console.error('1. API Key 无效或已过期');
      console.error('2. API Key 格式不正确');
      console.error('3. 账户权限问题');
    }
  }
}

// 运行测试
testKimiDirect().catch(console.error);