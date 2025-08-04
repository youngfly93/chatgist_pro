# Tool Calling 迁移指南

## 概述

本文档说明如何将 ChatGIST Pro 从当前的"隐藏JSON块"方式迁移到标准的 Tool Calling 方式。

## 当前实现 vs Tool Calling

### 当前方式
```
用户 → AI (生成隐藏JSON) → 后端解析 → 执行R脚本 → 返回结果
```

### Tool Calling 方式
```
用户 → AI (tool_calls) → 后端执行工具 → AI (基于结果生成回复) → 用户
```

## 迁移步骤

### 1. 保持向后兼容

在过渡期间，同时支持两种方式：

```javascript
// backend/src/index.js
import chatRouter from './routes/chat.js';          // 原有方式
import chatWithToolsRouter from './routes/chat_with_tools.js';  // Tool Calling

app.use('/api/chat', chatRouter);
app.use('/api/chat/v2', chatWithToolsRouter);  // 新端点
```

### 2. 前端适配

修改前端支持新的API端点：

```typescript
// frontend/src/pages/AIChat.tsx
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

const handleSendMessage = async () => {
  const endpoint = API_VERSION === 'v2' 
    ? '/api/chat/v2'  // Tool Calling
    : '/api/chat';    // 原有方式
    
  const response = await axios.post(endpoint, {
    message: inputMessage,
    sessionId
  });
};
```

### 3. 工具定义最佳实践

```javascript
const phosphoTools = [
  {
    type: "function",
    function: {
      name: "phospho_analysis",  // 简洁的名称
      description: "执行磷酸化分析。支持查询、箱线图、生存分析等",
      parameters: {
        type: "object",
        properties: {
          function: {
            type: "string",
            enum: ["query", "boxplot_TvsN", "boxplot_Risk", "survival", "comprehensive"],
            description: "分析类型"
          },
          gene: {
            type: "string",
            description: "基因名称，如KIT、PDGFRA"
          },
          site: {
            type: "string",
            description: "磷酸化位点（可选），如KIT/S25"
          }
        },
        required: ["function", "gene"]
      }
    }
  }
];
```

### 4. 处理并行调用

Tool Calling 支持并行调用多个工具：

```javascript
// 并行执行所有工具调用
const toolPromises = choice.message.tool_calls.map(async (toolCall) => {
  try {
    const result = await toolHandlers[toolCall.function.name](
      JSON.parse(toolCall.function.arguments)
    );
    return {
      tool_call_id: toolCall.id,
      name: toolCall.function.name,
      content: JSON.stringify(result)
    };
  } catch (error) {
    return {
      tool_call_id: toolCall.id,
      name: toolCall.function.name,
      content: JSON.stringify({ 
        status: 'error', 
        message: error.message 
      })
    };
  }
});

const toolResults = await Promise.all(toolPromises);
```

### 5. 优化提示词

Tool Calling 模式下的系统提示词应该更简洁：

```javascript
const systemPrompt = `你是Kimi，GIST磷酸化分析助手。
你可以使用提供的工具进行数据分析。
根据用户的问题，选择合适的工具并解释结果。`;
```

## 测试方法

### 1. 运行测试脚本
```bash
cd backend
node test/test-tool-calling.js
```

### 2. 使用新端点测试
```bash
curl -X POST http://localhost:8000/api/chat/v2 \
  -H "Content-Type: application/json" \
  -d '{
    "message": "请分析KIT基因的磷酸化情况",
    "sessionId": "test"
  }'
```

## 性能对比

| 指标 | 当前方式 | Tool Calling |
|-----|---------|--------------|
| 响应时间 | 1次请求 | 2次请求（工具调用+生成回复） |
| 准确性 | 依赖提示词 | AI自主判断 |
| 灵活性 | 固定模式 | 动态选择工具 |
| 并行处理 | 不支持 | 原生支持 |

## 注意事项

1. **Token消耗**：tools参数会占用token，注意不要定义过多工具
2. **错误处理**：工具执行失败时，AI会基于错误信息生成合理回复
3. **流式输出**：Tool Calling也支持流式输出，但实现更复杂

## 建议

1. **渐进式迁移**：先在新功能中使用Tool Calling
2. **A/B测试**：对比两种方式的效果
3. **监控指标**：关注响应时间、成功率等指标

## 总结

Tool Calling 是更标准、更灵活的实现方式，虽然会增加一次API调用，但带来了更好的可维护性和扩展性。建议在新功能开发中优先采用Tool Calling方式。