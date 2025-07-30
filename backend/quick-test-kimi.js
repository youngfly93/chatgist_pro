// 快速测试新的Kimi API密钥
import axios from 'axios';
import 'dotenv/config';

async function quickTest() {
  console.log('=== 测试新的Kimi API密钥 ===\n');
  
  const apiKey = process.env.KIMI_API_KEY;
  console.log('新API Key (前10字符):', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT FOUND');
  console.log('API Key长度:', apiKey ? apiKey.length : 0);
  
  try {
    console.log('\n正在测试API连接...');
    const response = await axios.post(
      'https://api.moonshot.ai/v1/chat/completions',
      {
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content: "你是Kimi，一个专业的AI助手。"
          },
          {
            role: "user",
            content: "请用一句话介绍GIST"
          }
        ],
        temperature: 0.6,
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('\n✓ API连接成功！');
    console.log('Kimi回复:', response.data.choices[0].message.content);
    console.log('\n您可以开始使用Kimi API了！');
    
  } catch (error) {
    console.error('\n✗ API连接失败');
    console.error('错误代码:', error.response?.status);
    console.error('错误信息:', error.response?.data || error.message);
  }
}

quickTest();