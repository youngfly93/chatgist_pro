import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testKimiDirect() {
  console.log('=== 直接测试 Kimi API ===\n');
  
  const apiKey = process.env.KIMI_API_KEY;
  const apiUrl = process.env.KIMI_API_URL;
  const model = process.env.KIMI_MODEL;
  
  console.log('API URL:', apiUrl);
  console.log('Model:', model);
  console.log('API Key:', apiKey ? '已配置' : '未配置');
  
  try {
    console.log('\n发送请求...');
    const startTime = Date.now();
    
    const response = await axios.post(
      apiUrl,
      {
        model: model,
        messages: [
          {
            role: "system",
            content: "你是一个友好的助手"
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
        timeout: 20000 // 20秒超时
      }
    );
    
    const endTime = Date.now();
    console.log(`\n响应时间: ${endTime - startTime}ms`);
    console.log('响应状态:', response.status);
    console.log('响应内容:', response.data.choices[0].message.content);
    
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

testKimiDirect();