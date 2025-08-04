import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env') });

// 直接测试 Tool Calling API
async function testToolCalling() {
  const apiKey = process.env.KIMI_API_KEY;
  const apiUrl = process.env.KIMI_API_URL;
  
  if (!apiKey) {
    console.error('请设置 KIMI_API_KEY 环境变量');
    return;
  }
  
  // 定义磷酸化分析工具
  const tools = [
    {
      type: "function",
      function: {
        name: "phospho_query",
        description: "查询基因的磷酸化位点信息",
        parameters: {
          type: "object",
          properties: {
            gene: {
              type: "string",
              description: "基因名称（如KIT、PDGFRA等）"
            }
          },
          required: ["gene"]
        }
      }
    }
  ];
  
  try {
    console.log('=== 测试 Kimi Tool Calling ===');
    console.log('用户问题: 请帮我查询KIT基因的磷酸化位点');
    
    const response = await axios.post(
      apiUrl,
      {
        model: process.env.KIMI_MODEL || 'kimi-k2-0711-preview',
        messages: [
          {
            role: "system",
            content: "你是一个磷酸化分析助手。当用户询问基因的磷酸化位点时，请使用phospho_query工具查询。"
          },
          {
            role: "user",
            content: "请帮我查询KIT基因的磷酸化位点"
          }
        ],
        tools: tools,
        tool_choice: "auto",
        temperature: 0.6
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const choice = response.data.choices[0];
    console.log('\n=== Kimi 响应 ===');
    console.log('finish_reason:', choice.finish_reason);
    
    if (choice.finish_reason === 'tool_calls') {
      console.log('\nKimi 请求调用工具:');
      for (const toolCall of choice.message.tool_calls) {
        console.log('- 工具名:', toolCall.function.name);
        console.log('  参数:', toolCall.function.arguments);
        console.log('  ID:', toolCall.id);
      }
      
      // 模拟工具执行结果
      console.log('\n=== 模拟工具执行 ===');
      console.log('假设我们执行了phospho_query工具，返回了KIT基因的磷酸化位点...');
      
      // 第二次请求，包含工具执行结果
      const messages2 = [
        ...response.data.choices[0].message ? [response.data.choices[0].message] : [],
        {
          role: "tool",
          tool_call_id: choice.message.tool_calls[0].id,
          name: "phospho_query",
          content: JSON.stringify({
            status: "success",
            message: "找到 6 个磷酸化位点",
            data: [
              { PhosphoSites: "KIT/S25", "No..in.Tumor": 8, "Prop.in.Tumor": "11.27%" },
              { PhosphoSites: "KIT/S742", "No..in.Tumor": 7, "Prop.in.Tumor": "9.86%" },
              { PhosphoSites: "KIT/T590", "No..in.Tumor": 7, "Prop.in.Tumor": "9.86%" }
            ]
          })
        }
      ];
      
      const response2 = await axios.post(
        apiUrl,
        {
          model: process.env.KIMI_MODEL || 'kimi-k2-0711-preview',
          messages: [
            {
              role: "system",
              content: "你是一个磷酸化分析助手。当用户询问基因的磷酸化位点时，请使用phospho_query工具查询。"
            },
            {
              role: "user",
              content: "请帮我查询KIT基因的磷酸化位点"
            },
            ...messages2
          ],
          tools: tools,
          temperature: 0.6
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('\n=== Kimi 最终回复 ===');
      console.log(response2.data.choices[0].message.content);
      
    } else {
      console.log('\nKimi 直接回复（未调用工具）:');
      console.log(choice.message.content);
    }
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testToolCalling();