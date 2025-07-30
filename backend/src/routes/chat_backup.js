import express from 'express';
import axios from 'axios';
import phosphoService from '../services/phosphoService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  // 在try块外定义isKimi，这样catch块也能访问
  const isKimi = process.env.USE_KIMI === 'true';
  let apiKey; // 同样在外部定义apiKey
  
  try {
    const { message, image, stream = false } = req.body;
    
    if (isKimi) {
      if (!process.env.KIMI_API_KEY) {
        return res.status(500).json({ 
          error: 'Kimi API未配置' 
        });
      }
    } else {
      if (!process.env.ARK_API_KEY || !process.env.ARK_API_URL) {
        return res.status(500).json({ 
          error: '火山方舟API未配置' 
        });
      }
    }
    
    // 调用AI API - 注意Kimi使用.cn域名
    const apiUrl = isKimi ? 'https://api.moonshot.cn/v1/chat/completions' : process.env.ARK_API_URL;
    apiKey = isKimi ? process.env.KIMI_API_KEY : process.env.ARK_API_KEY;
    // Kimi模型名称：kimi-k2-0711-preview 是最新的模型
    const modelId = isKimi ? 'kimi-k2-0711-preview' : (process.env.ARK_MODEL_ID || "deepseek-v3-250324");
    
    console.log('Calling AI API:', isKimi ? 'Kimi' : 'ARK');
    console.log('API URL:', apiUrl);
    console.log('Using model:', modelId);
    console.log('Stream mode:', stream);
    console.log('Has image:', !!image);
    
    // 调试Kimi API Key
    if (isKimi) {
      console.log('Kimi API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET');
      console.log('Kimi API Key length:', apiKey ? apiKey.length : 0);
    }
    
    // 构建用户消息内容
    let userContent;
    if (image) {
      // 如果有图片，使用多模态格式
      userContent = [
        {
          type: "text",
          text: message
        },
        {
          type: "image_url",
          image_url: {
            url: image // base64格式的图片
          }
        }
      ];
    } else {
      // 只有文本
      userContent = message;
    }
    
    // 系统提示词
    const systemPrompt = isKimi ? 
      "你是Kimi，一名聚焦胃肠道间质瘤（GIST）分子遗传学和磷酸化蛋白质组学的智能助手。你具备调用真实GIST磷酸化数据分析功能，可以执行R脚本进行实时分析和可视化。\n\n**重要：磷酸化分析需要两步**\n\n1. **识别分析请求时**\n   当用户要求磷酸化分析时，你的回复必须包含隐藏的JSON块来触发R脚本。\n\n2. **常见GIST基因和真实磷酸化位点**\n   - KIT基因位点：KIT/S25, KIT/S742, KIT/T590, KIT/S963, KIT/S955, KIT/S28\n   - PDGFRA基因位点：PDGFRA/S561等\n   - 其他基因：SDH（SDHA/B/C/D）、NF1、BRAF、TP53、RB1、PTEN、CDKN2A\n\n3. **分析类型映射（使用真实函数名）**\n   * \"查询\"、\"位点\" → phospho_site_query\n   * \"肿瘤vs正常\"、\"差异磷酸化\" → tumor_vs_normal\n   * \"风险分层\"、\"风险\" → risk_analysis\n   * \"性别差异\" → gender_analysis\n   * \"年龄分组\" → age_analysis\n   * \"肿瘤位置\" → location_analysis\n   * \"WHO分型\" → who_analysis\n   * \"突变类型\" → mutation_analysis\n   * \"生存分析\"、\"预后\" → survival_analysis
   * \"综合分析\"、\"全面分析\"、\"完整分析\"、\"多维分析\" → comprehensive_analysis\n\n4. **回复格式（磷酸化分析时必须使用）**\n   ```\n   我将为您分析[基因]的磷酸化[分析类型]，正在调用真实的GIST磷酸化蛋白质组学数据进行分析...\n   \n   <!--PHOSPHO_ANALYSIS_START-->\n   {\"gene\":\"基因名\",\"analyses\":{\"phosphoproteome\":\"分析类型\",\"transcriptome\":\"\",\"proteome\":\"\"}}\n   <!--PHOSPHO_ANALYSIS_END-->\n   ```\n\n5. **重要说明**\n   * 系统会自动执行R脚本并在界面上显示真实分析结果\n   * 数据来源于真实的GIST患者磷酸化蛋白质组学数据\n   * 你的回复只需说明正在进行分析，不要编造结果\n   * 不要显示JSON代码块给用户看\n\n6. **示例对话**\n   用户：\"查询KIT基因的磷酸化位点\"\n   你的回复：\n   我将为您查询KIT基因的磷酸化位点信息，正在调用真实的GIST磷酸化蛋白质组学数据...\n   \n   <!--PHOSPHO_ANALYSIS_START-->\n   {\"gene\":\"KIT\",\"analyses\":{\"phosphoproteome\":\"phospho_site_query\",\"transcriptome\":\"\",\"proteome\":\"\"}}\n   <!--PHOSPHO_ANALYSIS_END-->\n   \n   用户：\"分析KIT/S25位点在肿瘤和正常组织中的差异\"\n   你的回复：\n   我将分析KIT/S25磷酸化位点在肿瘤组织和正常组织中的表达差异，正在生成箱线图分析...\n   \n   <!--PHOSPHO_ANALYSIS_START-->\n   {\"gene\":\"KIT\",\"site\":\"KIT/S25\",\"analyses\":{\"phosphoproteome\":\"tumor_vs_normal\",\"transcriptome\":\"\",\"proteome\":\"\"}}\n   <!--PHOSPHO_ANALYSIS_END-->" 
      :
      "你是一名聚焦胃肠道间质瘤（GIST）分子遗传学和磷酸化蛋白质组学的智能助手。你具备调用真实GIST磷酸化数据分析功能，可以执行R脚本进行实时分析和可视化。\n\n**重要：磷酸化分析需要两步**\n\n1. **识别分析请求时**\n   当用户要求磷酸化分析时，你的回复必须包含隐藏的JSON块来触发R脚本。\n\n2. **常见GIST基因和真实磷酸化位点**\n   - KIT基因位点：KIT/S25, KIT/S742, KIT/T590, KIT/S963, KIT/S955, KIT/S28\n   - PDGFRA基因位点：PDGFRA/S561等\n   - 其他基因：SDH（SDHA/B/C/D）、NF1、BRAF、TP53、RB1、PTEN、CDKN2A\n\n3. **分析类型映射（使用真实函数名）**\n   * \"查询\"、\"位点\" → phospho_site_query\n   * \"肿瘤vs正常\"、\"差异磷酸化\" → tumor_vs_normal\n   * \"风险分层\"、\"风险\" → risk_analysis\n   * \"性别差异\" → gender_analysis\n   * \"年龄分组\" → age_analysis\n   * \"肿瘤位置\" → location_analysis\n   * \"WHO分型\" → who_analysis\n   * \"突变类型\" → mutation_analysis\n   * \"生存分析\"、\"预后\" → survival_analysis
   * \"综合分析\"、\"全面分析\"、\"完整分析\"、\"多维分析\" → comprehensive_analysis\n\n4. **回复格式（磷酸化分析时必须使用）**\n   ```\n   我将为您分析[基因]的磷酸化[分析类型]，正在调用真实的GIST磷酸化蛋白质组学数据进行分析...\n   \n   <!--PHOSPHO_ANALYSIS_START-->\n   {\"gene\":\"基因名\",\"analyses\":{\"phosphoproteome\":\"分析类型\",\"transcriptome\":\"\",\"proteome\":\"\"}}\n   <!--PHOSPHO_ANALYSIS_END-->\n   ```\n\n5. **重要说明**\n   * 系统会自动执行R脚本并在界面上显示真实分析结果\n   * 数据来源于真实的GIST患者磷酸化蛋白质组学数据\n   * 你的回复只需说明正在进行分析，不要编造结果\n   * 不要显示JSON代码块给用户看\n\n6. **示例对话**\n   用户：\"查询KIT基因的磷酸化位点\"\n   你的回复：\n   我将为您查询KIT基因的磷酸化位点信息，正在调用真实的GIST磷酸化蛋白质组学数据...\n   \n   <!--PHOSPHO_ANALYSIS_START-->\n   {\"gene\":\"KIT\",\"analyses\":{\"phosphoproteome\":\"phospho_site_query\",\"transcriptome\":\"\",\"proteome\":\"\"}}\n   <!--PHOSPHO_ANALYSIS_END-->\n   \n   用户：\"分析KIT/S25位点在肿瘤和正常组织中的差异\"\n   你的回复：\n   我将分析KIT/S25磷酸化位点在肿瘤组织和正常组织中的表达差异，正在生成箱线图分析...\n   \n   <!--PHOSPHO_ANALYSIS_START-->\n   {\"gene\":\"KIT\",\"site\":\"KIT/S25\",\"analyses\":{\"phosphoproteome\":\"tumor_vs_normal\",\"transcriptome\":\"\",\"proteome\":\"\"}}\n   <!--PHOSPHO_ANALYSIS_END-->";

    const requestData = {
      model: modelId,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userContent
        }
      ],
      temperature: isKimi ? 0.6 : 0.7,
      max_tokens: 1500, // 增加token限制以支持图片分析
      stream: stream
    };

    if (stream) {
      // 流式响应
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const arkResponse = await axios.post(
        apiUrl,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream',
          timeout: 60000 // 60秒超时
        }
      );
      
      arkResponse.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                res.write(data.choices[0].delta.content);
              }
            } catch (e) {
              console.error('Parse stream chunk error:', e);
            }
          }
        }
      });
      
      arkResponse.data.on('end', () => {
        res.end();
      });
      
      arkResponse.data.on('error', (error) => {
        console.error('Stream error:', error);
        res.end();
      });
      
    } else {
      // 非流式响应
      const arkResponse = await axios.post(
        apiUrl,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30秒超时
        }
      );
      
      // 提取AI回复
      const reply = arkResponse.data.choices[0].message.content;
      
      // 检查是否包含磷酸化分析请求
      let phosphoAnalysisResult = null;
      let analysisRequest = null; // 移到外层作用域
      let userRequest = null; // 保存分析请求信息
      
      try {
        // 尝试从AI响应中提取JSON - 支持两种格式
        // 1. Markdown代码块格式（旧格式，兼容性）
        let jsonMatch = reply.match(/```json\s*([\s\S]*?)\s*```/);
        
        if (jsonMatch) {
          analysisRequest = JSON.parse(jsonMatch[1]);
        } else {
          // 2. HTML注释格式（新格式，隐藏JSON）
          const hiddenMatch = reply.match(/<!--PHOSPHO_ANALYSIS_START-->\s*([\s\S]*?)\s*<!--PHOSPHO_ANALYSIS_END-->/);
          if (hiddenMatch) {
            analysisRequest = JSON.parse(hiddenMatch[1]);
          }
        }
        
        if (analysisRequest) {
          
          // 如果包含基因信息，尝试执行磷酸化分析
          if (analysisRequest.gene) {
            console.log('=== PHOSPHO ANALYSIS DETECTED ===');
            console.log('Gene:', analysisRequest.gene);
            console.log('Full request:', JSON.stringify(analysisRequest, null, 2));
            
            // 解析用户原始消息，确定分析类型
            userRequest = phosphoService.parseUserRequest(message, analysisRequest.gene);
            console.log('Parsed user request:', userRequest);
            
            // 如果AI已经指定了分析类型，优先使用
            if (analysisRequest.analyses && analysisRequest.analyses.phosphoproteome) {
              console.log('AI specified analysis type:', analysisRequest.analyses.phosphoproteome);
              
              // 检查是否包含多个分析类型（用逗号分隔）
              const analysisTypeString = analysisRequest.analyses.phosphoproteome;
              if (analysisTypeString.includes(',')) {
                console.log('Multiple analysis types detected, using comprehensive analysis');
                userRequest.function = 'comprehensive';
              } else {
                // 映射AI返回的分析类型到实际支持的函数
                const analysisTypeMap = {
                // 查询相关
                'phospho_site_query': 'query',
                'query': 'query',
                
                // 肿瘤vs正常分析
                'tumor_vs_normal': 'boxplot_TvsN',
                'tumor_vs_normal_differential_phosphorylation': 'boxplot_TvsN',
                'differential_phosphorylation': 'boxplot_TvsN',
                'metastatic_phospho_signature': 'boxplot_TvsN',
                
                // 临床分析
                'risk_analysis': 'boxplot_Risk',
                'gender_analysis': 'boxplot_Gender', 
                'age_analysis': 'boxplot_Age',
                'location_analysis': 'boxplot_Location',
                'who_analysis': 'boxplot_WHO',
                'mutation_analysis': 'boxplot_Mutation',
                
                // 生存分析
                'survival_analysis': 'survival',
                'survival': 'survival',
                
                // 综合分析
                'comprehensive_analysis': 'comprehensive',
                'comprehensive': 'comprehensive',
                'all_analyses': 'comprehensive',
                'comprehensive_kit_analysis': 'comprehensive',
                'full_analysis': 'comprehensive',
                'complete_analysis': 'comprehensive',
                'multi_dimensional_analysis': 'comprehensive'
              };
              
                const mappedType = analysisTypeMap[analysisRequest.analyses.phosphoproteome] || 
                                  analysisRequest.analyses.phosphoproteome;
                userRequest.function = mappedType;
                console.log('Mapped to function:', mappedType);
              }
            }
            
            console.log('Final analysis request:', userRequest);
            
            if (userRequest.function) {
              console.log('=== EXECUTING PHOSPHO ANALYSIS ===');
              console.log('Function:', userRequest.function);
              console.log('Gene:', userRequest.gene);
              
              try {
                phosphoAnalysisResult = await phosphoService.analyze(userRequest);
                console.log('Phospho analysis completed:', phosphoAnalysisResult.status);
              } catch (analysisError) {
                console.error('Phospho analysis error:', analysisError);
                phosphoAnalysisResult = {
                  status: 'error',
                  message: analysisError.message
                };
              }
            }
          }
        }
      } catch (e) {
        console.log('No phospho analysis request detected in AI response');
      }
      
      // 清理回复中的隐藏JSON（用户不应该看到）
      let cleanReply = reply;
      cleanReply = cleanReply.replace(/<!--PHOSPHO_ANALYSIS_START-->[\s\S]*?<!--PHOSPHO_ANALYSIS_END-->/g, '').trim();
      
      // 构建最终响应
      const response = {
        reply: cleanReply,
        phosphoAnalysis: phosphoAnalysisResult
      };
      
      // 如果有磷酸化分析结果，让AI解读结果
      let interpretationReply = '';
      if (phosphoAnalysisResult && phosphoAnalysisResult.status === 'success') {
        // 最多重试2次
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries && !interpretationReply) {
          try {
            if (retryCount > 0) {
              console.log(`=== RETRYING AI INTERPRETATION (${retryCount}/${maxRetries}) ===`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒再重试
            } else {
              console.log('=== REQUESTING AI INTERPRETATION ===');
            }
            
            // 根据分析类型构建解读请求
            const gene = analysisRequest?.gene || '未知';
            const analysisType = userRequest?.function || 'query';
            
            // 简化解读提示，提高成功率
            const interpretPrompt = `分析结果：
基因：${gene}
检测到${phosphoAnalysisResult.data?.length || 0}个磷酸化位点

主要发现：
${phosphoAnalysisResult.data?.slice(0, 3).map(item => 
`- ${item.Site}: 肿瘤检出${(item.Tumor_Detection*100).toFixed(0)}% vs 正常${(item.Normal_Detection*100).toFixed(0)}%, 差异${item.Fold_Change}倍, P=${item.P_Value}`
).join('\n') || '无数据'}

请简要解读：
1. 这些磷酸化变化的生物学意义
2. 在GIST中的临床相关性
3. 需要注意什么

限300字内。`;

            // 调用AI进行解读
            const interpretResponse = await axios.post(
              apiUrl,
              {
                model: modelId,
                messages: [
                  {
                    role: "system",
                    content: "你是GIST磷酸化分析专家，请基于提供的真实数据进行专业解读。"
                  },
                  {
                    role: "user",
                    content: interpretPrompt
                  }
                ],
                temperature: 0.5,
                max_tokens: 400
              },
              {
                headers: {
                  'Authorization': `Bearer ${apiKey}`,
                  'Content-Type': 'application/json'
                },
                timeout: 30000 // 30秒超时，可以多次重试
              }
            );
            
            interpretationReply = interpretResponse.data.choices[0].message.content;
            console.log('AI interpretation received');
            break; // 成功则退出循环
          
          } catch (error) {
            console.error(`AI interpretation attempt ${retryCount + 1} failed:`, error.message);
            retryCount++;
            
            if (retryCount > maxRetries) {
              // 所有重试都失败了，明确告知用户
              interpretationReply = '\n\n⚠️ **AI解读服务暂时不可用**\n尝试了多次但无法获取AI的专业解读。磷酸化分析数据已成功生成，请查看上方的详细结果。';
            }
          }
        }
      }
      
      // 调试日志
      console.log('=== FINAL RESPONSE ===');
      console.log('Reply length:', cleanReply.length);
      console.log('Has phosphoAnalysis:', !!phosphoAnalysisResult);
      console.log('Has interpretation:', !!interpretationReply);
      if (phosphoAnalysisResult) {
        console.log('PhosphoAnalysis status:', phosphoAnalysisResult.status);
        console.log('PhosphoAnalysis data items:', phosphoAnalysisResult.data?.length);
      }
      
      // 构建最终响应，包含解读
      const finalReply = cleanReply + (interpretationReply ? '\n\n' + interpretationReply : '');
      
      res.json({
        reply: finalReply,
        phosphoAnalysis: phosphoAnalysisResult
      });
    }
    
  } catch (error) {
    console.error('Chat API error details:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Error Message:', error.message);
    
    if (error.response?.status === 401) {
      const errorMsg = isKimi ? 
        'Kimi API认证失败，请检查API Key是否正确。' : 
        'ARK API认证失败，请检查API Key是否正确。';
      console.error('401 Error - API Service:', isKimi ? 'Kimi' : 'ARK');
      console.error('401 Error - API Key exists:', !!apiKey);
      res.status(500).json({ 
        error: errorMsg,
        service: isKimi ? 'Kimi' : 'ARK'
      });
    } else if (error.response?.status === 429) {
      res.status(500).json({ 
        error: 'API调用频率过高，请稍后再试。' 
      });
    } else {
      res.status(500).json({ 
        error: '抱歉，AI服务暂时不可用，请稍后再试。',
        details: error.response?.data?.error || error.message
      });
    }
  }
});

export default router;