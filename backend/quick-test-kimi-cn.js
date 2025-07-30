// 快速测试Kimi API (.cn域名)
import axios from 'axios';
import 'dotenv/config';

async function quickTest() {
  console.log('=== 测试Kimi API (.cn域名) ===\n');
  
  const apiKey = process.env.KIMI_API_KEY;
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  
  try {
    const response = await axios.post(
      'https://api.moonshot.cn/v1/chat/completions',
      {
        model: "kimi-k2-0711-preview",
        messages: [
          { role: "system", content: "你是Kimi，一个专业的AI助手。" },
          { role: "user", content: "1+1等于多少？" }
        ],
        temperature: 0.6
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ 成功！');
    console.log('回复:', response.data.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ 失败');
    console.error('状态码:', error.response?.status);
    console.error('错误:', error.response?.data || error.message);
  }
}

quickTest();