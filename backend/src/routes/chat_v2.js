import express from 'express';
import axios from 'axios';
import { phosphoTools, toolHandlers } from '../tools/phosphoTools.js';
import { transcriptomeTools } from '../tools/transcriptomeTools.js';
import { singleCellTools } from '../tools/singleCellTools.js';
import toolService from '../services/toolService.js';
import { getSystemPrompt } from '../config/prompts.js';

const router = express.Router();

// Tool Calling 版本的聊天接口
router.post('/', async (req, res) => {
  try {
    const { message, messages: inputMessages, sessionId, stream = false } = req.body;

    // 检查必要的配置
    const isKimi = process.env.USE_KIMI === 'true';
    if (!isKimi || !process.env.KIMI_API_KEY) {
      return res.status(500).json({
        error: 'Tool Calling 目前仅支持 Kimi API'
      });
    }

    console.log('=== Tool Calling Chat Request ===');
    console.log('Message:', message);
    console.log('InputMessages:', inputMessages);
    console.log('SessionId:', sessionId);
    console.log('Stream:', stream);

    // 初始化消息历史 - 支持两种格式
    let messages;

    if (inputMessages && Array.isArray(inputMessages)) {
      // 新格式：使用传入的messages数组
      messages = [
        {
          role: "system",
          content: getSystemPrompt('tool_calling')
        },
        ...inputMessages
      ];
    } else if (message) {
      // 旧格式：使用单个message字段
      messages = [
        {
          role: "system",
          content: getSystemPrompt('tool_calling')
        },
        {
          role: "user",
          content: message
        }
      ];
    } else {
      return res.status(400).json({
        error: '请提供有效的消息内容'
      });
    }
    
    // 处理流式响应
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // 流式处理逻辑
      await handleStreamingToolCalls(messages, res);
    } else {
      // 非流式处理
      const result = await handleToolCalls(messages);
      res.json(result);
    }
    
  } catch (error) {
    console.error('Tool Calling chat error:', error);
    res.status(500).json({
      error: '处理请求时出错',
      details: error.message
    });
  }
});

// 处理非流式 Tool Calling
async function handleToolCalls(messages) {
  let finalResponse = null;
  let toolCallResults = [];
  let iterations = 0;
  const maxIterations = 6; // 增加到6次以支持复杂的转录组学分析
  
  while (!finalResponse && iterations < maxIterations) {
    iterations++;
    console.log(`\n=== Tool Calling Iteration ${iterations} ===`);
    
    try {
      const kimiResponse = await axios.post(
        process.env.KIMI_API_URL || 'https://api.moonshot.cn/v1/chat/completions',
        {
          model: process.env.KIMI_MODEL || 'kimi-k2-0711-preview',
          messages: messages,
          tools: [...phosphoTools, ...transcriptomeTools, ...singleCellTools],
          tool_choice: "auto",
          temperature: 0.6,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.KIMI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 120秒超时
        }
      );
      
      const choice = kimiResponse.data.choices[0];
      console.log('Finish reason:', choice.finish_reason);
      
      if (choice.finish_reason === 'tool_calls') {
        // AI 请求调用工具
        messages.push(choice.message);
        
        // 并行执行所有工具调用
        const toolPromises = choice.message.tool_calls.map(async (toolCall) => {
          console.log(`Executing tool: ${toolCall.function.name}`);
          console.log('Arguments:', toolCall.function.arguments);
          
          try {
            const toolArgs = JSON.parse(toolCall.function.arguments);
            const result = await toolService.executeTool(
              toolCall.function.name,
              toolArgs
            );
            
            console.log(`Tool ${toolCall.function.name} result:`, {
              status: result?.status,
              hasData: result?.hasData,
              hasPlot: result?.hasPlot,
              hasAnalyses: result?.hasAnalyses
            });
            
            // 记录成功的工具调用结果
            toolCallResults.push({
              tool: toolCall.function.name,
              args: toolArgs,
              result: result
            });
            
            // 创建一个不包含大数据的简化版本发送给AI
            const simplifiedResult = {
              status: result?.status,
              message: result?.message,
              timestamp: result?.timestamp,
              hasData: result?.hasData,
              hasPlot: result?.hasPlot,
              hasCorrelationStats: !!result?.correlation_stats,
              hasRocStats: !!result?.roc_stats,
              hasAnalyses: result?.hasAnalyses
            };

            // 如果有统计数据，包含简化版本
            if (result?.correlation_stats) {
              simplifiedResult.correlation_stats = {
                correlation: result.correlation_stats.correlation,
                p_value: result.correlation_stats.p_value,
                method: result.correlation_stats.method
              };
            }

            if (result?.roc_stats) {
              simplifiedResult.roc_stats = {
                auc: result.roc_stats.auc,
                p_value: result.roc_stats.p_value
              };
            }

            return {
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify(simplifiedResult)
            };
          } catch (error) {
            console.error(`Tool execution error for ${toolCall.function.name}:`, error);
            return {
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify({
                status: 'error',
                message: error.message || '工具执行失败'
              })
            };
          }
        });
        
        // 等待所有工具执行完成
        const toolResponses = await Promise.all(toolPromises);
        messages.push(...toolResponses);
        
      } else {
        // AI 生成了最终回复
        finalResponse = choice.message.content;
        console.log('Final response generated');
      }
      
    } catch (error) {
      console.error('Kimi API error:', error.response?.data || error.message);
      
      // 特殊处理超时错误
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        // 如果有部分结果，返回部分结果
        if (toolCallResults.length > 0) {
          console.warn('Kimi API 超时，返回部分结果');
          finalResponse = '分析请求处理超时，以下是部分分析结果。';
          break;
        }
      }
      
      throw error;
    }
  }
  
  if (!finalResponse && iterations >= maxIterations) {
    console.log('达到最大迭代次数，返回部分结果');
    // 生成一个基于已有工具调用结果的总结回复
    if (toolCallResults.length > 0) {
      finalResponse = `分析已完成，但由于复杂性达到了处理限制。以下是已完成的分析结果：\n\n`;
      toolCallResults.forEach((result, index) => {
        if (result.status === 'success' || result.hasPlot) {
          finalResponse += `✅ 分析 ${index + 1}: 已成功完成\n`;
        } else {
          finalResponse += `⚠️ 分析 ${index + 1}: 部分完成\n`;
        }
      });
      finalResponse += `\n请查看上方的分析图表和数据。如需更详细的分析，请尝试分别询问各个具体的分析类型。`;
    } else {
      finalResponse = '抱歉，分析过程遇到了复杂性限制。请尝试询问更具体的分析类型，比如"KIT基因的风险分组分析"。';
    }
  }
  
  // 构建返回结果
  const response = {
    reply: finalResponse,
    sessionId: 'tool-calling-session',
    toolCalls: toolCallResults.length > 0 ? toolCallResults : undefined
  };
  
  // 如果有分析结果，添加到响应中（兼容旧版前端）
  if (toolCallResults.length > 0) {
    console.log('=== Tool Call Results ===');
    console.log('Total tool calls:', toolCallResults.length);

    const phosphoResults = toolCallResults.filter(tc =>
      tc.tool === 'phospho_analysis' && tc.result && tc.result.status === 'success'
    );

    const transcriptomeResults = toolCallResults.filter(tc =>
      tc.tool === 'transcriptome_analysis' && tc.result && tc.result.status === 'success'
    );

    const singleCellResults = toolCallResults.filter(tc =>
      tc.tool === 'singlecell_analysis' && tc.result && 
      (tc.result.status === 'success' || tc.result.hasPlot)
    );

    console.log('Successful phospho results:', phosphoResults.length);
    console.log('Successful transcriptome results:', transcriptomeResults.length);
    console.log('Successful single-cell results:', singleCellResults.length);
    
    // 检查是否有综合分析结果
    const comprehensiveResult = phosphoResults.find(pr => 
      pr.args.function_type === 'comprehensive' && pr.result.analyses
    );
    
    if (comprehensiveResult) {
      // 如果有综合分析，直接使用它
      console.log('Using comprehensive analysis result');
      response.phosphoAnalysis = comprehensiveResult.result;
    } else if (phosphoResults.length === 1) {
      // 单个分析结果
      console.log('Using single analysis result');
      response.phosphoAnalysis = phosphoResults[0].result;
    } else if (phosphoResults.length > 1) {
      // 多个分析结果，构建综合格式
      console.log('Combining multiple analysis results');
      response.phosphoAnalysis = {
        status: 'success',
        message: '多项分析完成',
        gene: phosphoResults[0].args.gene,
        analyses: {},
        summary: {
          total: phosphoResults.length,
          successful: phosphoResults.length,
          failed: 0,
          warnings: 0
        }
      };
      
      // 将每个分析结果添加到 analyses 对象中
      phosphoResults.forEach(pr => {
        const analysisType = pr.args.function_type;
        response.phosphoAnalysis.analyses[analysisType] = pr.result;
      });
    }
    
    // 调试输出
    if (response.phosphoAnalysis) {
      console.log('PhosphoAnalysis added to response');
      console.log('Has data:', !!response.phosphoAnalysis.data);
      console.log('Has plot:', !!response.phosphoAnalysis.plot);
      console.log('Has analyses:', !!response.phosphoAnalysis.analyses);
    }

    // 处理转录组分析结果
    if (transcriptomeResults.length > 0) {
      console.log('=== Processing Transcriptome Results ===');

      if (transcriptomeResults.length === 1) {
        // 单个转录组分析结果
        console.log('Using single transcriptome analysis result');
        response.transcriptomeAnalysis = transcriptomeResults[0].result;
      } else {
        // 多个转录组分析结果，使用第一个（或者可以构建综合格式）
        console.log('Using first transcriptome analysis result');
        response.transcriptomeAnalysis = transcriptomeResults[0].result;
      }

      // 调试输出
      if (response.transcriptomeAnalysis) {
        console.log('TranscriptomeAnalysis added to response');
        console.log('Has data:', !!response.transcriptomeAnalysis.data);
        console.log('Has plot:', !!response.transcriptomeAnalysis.plot);
        console.log('Has correlation_stats:', !!response.transcriptomeAnalysis.correlation_stats);
        console.log('Has roc_stats:', !!response.transcriptomeAnalysis.roc_stats);
      }
    }

    // 处理单细胞分析结果
    if (singleCellResults.length > 0) {
      console.log('=== Processing Single-cell Results ===');

      if (singleCellResults.length === 1) {
        // 单个单细胞分析结果
        console.log('Using single single-cell analysis result');
        response.singleCellAnalysis = singleCellResults[0].result;
      } else {
        // 多个单细胞分析结果，使用第一个
        console.log('Using first single-cell analysis result');
        response.singleCellAnalysis = singleCellResults[0].result;
      }

      // 调试输出
      if (response.singleCellAnalysis) {
        console.log('SingleCellAnalysis added to response');
        console.log('Has data:', response.singleCellAnalysis.hasData);
        console.log('Has plot:', response.singleCellAnalysis.hasPlot);
        console.log('Has analyses:', response.singleCellAnalysis.hasAnalyses);
        console.log('Image base64 length:', response.singleCellAnalysis.image_base64 ? response.singleCellAnalysis.image_base64.length : 0);
      }
    }
  }
  
  return response;
}

// 处理流式 Tool Calling（简化版本，后续可以优化）
async function handleStreamingToolCalls(messages, res) {
  // 暂时使用非流式方式获取结果，然后流式发送
  try {
    const result = await handleToolCalls(messages);
    
    // 模拟流式输出
    const chunks = result.reply.split(' ');
    for (const chunk of chunks) {
      res.write(`data: ${JSON.stringify({ content: chunk + ' ' })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 50)); // 模拟打字效果
    }
    
    // 发送结束信号
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}

export default router;