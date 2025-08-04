import express from 'express';
import axios from 'axios';
import phosphoService from '../services/phosphoService.js';

const router = express.Router();

// 定义磷酸化分析工具
const phosphoTools = [
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
  },
  {
    type: "function",
    function: {
      name: "phospho_boxplot",
      description: "生成磷酸化位点的箱线图分析",
      parameters: {
        type: "object",
        properties: {
          gene: {
            type: "string",
            description: "基因名称"
          },
          analysis_type: {
            type: "string",
            enum: ["TvsN", "Risk", "Gender", "Age", "Location", "WHO", "Mutation", "TumorSize", "MitoticCount", "IMResponse"],
            description: "分析类型"
          },
          site: {
            type: "string",
            description: "磷酸化位点（可选，如KIT/S25）"
          }
        },
        required: ["gene", "analysis_type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "phospho_survival",
      description: "执行生存分析",
      parameters: {
        type: "object",
        properties: {
          gene: {
            type: "string",
            description: "基因名称"
          },
          site: {
            type: "string",
            description: "磷酸化位点"
          },
          cutoff: {
            type: "string",
            enum: ["Auto", "Median", "Q1", "Q3"],
            description: "分组阈值"
          },
          survtype: {
            type: "string",
            enum: ["OS", "PFS", "DFS"],
            description: "生存类型"
          }
        },
        required: ["gene"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "phospho_comprehensive",
      description: "执行综合分析（包含所有分析类型）",
      parameters: {
        type: "object",
        properties: {
          gene: {
            type: "string",
            description: "基因名称"
          }
        },
        required: ["gene"]
      }
    }
  }
];

// 工具执行函数映射
const toolHandlers = {
  phospho_query: async (args) => {
    return await phosphoService.analyze({
      function: 'query',
      gene: args.gene
    });
  },
  
  phospho_boxplot: async (args) => {
    return await phosphoService.analyze({
      function: `boxplot_${args.analysis_type}`,
      gene: args.gene,
      site: args.site
    });
  },
  
  phospho_survival: async (args) => {
    return await phosphoService.analyze({
      function: 'survival',
      gene: args.gene,
      site: args.site,
      cutoff: args.cutoff || 'Auto',
      survtype: args.survtype || 'OS'
    });
  },
  
  phospho_comprehensive: async (args) => {
    return await phosphoService.analyze({
      function: 'comprehensive',
      gene: args.gene
    });
  }
};

// Tool Calling 版本的聊天接口
router.post('/', async (req, res) => {
  try {
    const { message, sessionId, stream = false } = req.body;

    // 初始化消息历史
    const messages = [
      {
        role: "system",
        content: `你是Kimi，一名聚焦胃肠道间质瘤（GIST）分子遗传学和磷酸化蛋白质组学的智能助手。
你可以使用以下工具进行真实的GIST磷酸化数据分析：
- phospho_query: 查询基因的磷酸化位点
- phospho_boxplot: 生成各种临床分组的箱线图分析
- phospho_survival: 执行生存分析
- phospho_comprehensive: 执行综合分析

当用户询问磷酸化相关问题时，请使用合适的工具进行分析。`
      },
      {
        role: "user",
        content: message
      }
    ];

    if (stream) {
      // 流式响应处理
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      await handleStreamingToolCalls(messages, res, sessionId);
    } else {
      // 非流式响应处理
      const result = await handleNonStreamingToolCalls(messages, sessionId);
      res.json(result);
    }

  } catch (error) {
    console.error('Tool calling chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: '处理请求时出错',
        details: error.message
      });
    }
  }
});

// 处理非流式Tool Calling
async function handleNonStreamingToolCalls(messages, sessionId) {
  let finalResponse = null;
  let toolCallResults = [];
  let iterations = 0;
  const maxIterations = 3;

  // 循环处理直到获得最终回复
  while (!finalResponse && iterations < maxIterations) {
    iterations++;
    console.log(`Tool calling iteration ${iterations}/${maxIterations}`);

    const kimiResponse = await axios.post(
      process.env.KIMI_API_URL,
      {
        model: process.env.KIMI_MODEL,
        messages: messages,
        tools: phosphoTools,
        tool_choice: "auto",
        temperature: 0.6
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.KIMI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const choice = kimiResponse.data.choices[0];

    if (choice.finish_reason === 'tool_calls') {
      // AI 请求调用工具
      messages.push(choice.message);

      // 执行所有工具调用
      for (const toolCall of choice.message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        console.log(`执行工具调用: ${toolName}`, toolArgs);

        try {
          const result = await toolHandlers[toolName](toolArgs);

          // 添加工具执行结果到消息历史
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolName,
            content: JSON.stringify(result)
          });

          toolCallResults.push(result);
        } catch (error) {
          // 工具执行失败
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolName,
            content: JSON.stringify({
              status: 'error',
              message: error.message
            })
          });
        }
      }
    } else {
      // AI 生成了最终回复
      finalResponse = choice.message.content;
    }
  }

  if (!finalResponse) {
    finalResponse = "抱歉，分析过程中遇到了问题，请稍后重试。";
  }

  return {
    reply: finalResponse,
    phosphoAnalysis: toolCallResults.length > 0 ? toolCallResults[0] : null,
    sessionId: sessionId || 'default'
  };
}

export default router;