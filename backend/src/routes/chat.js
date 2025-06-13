import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, stream = false } = req.body;
    
    // 检查API配置
    if (!process.env.ARK_API_KEY || !process.env.ARK_API_URL) {
      return res.status(500).json({ 
        error: '火山方舟API未配置' 
      });
    }
    
    // 调用火山方舟API
    console.log('Calling ARK API with URL:', process.env.ARK_API_URL);
    console.log('Using model:', process.env.ARK_MODEL_ID || "deepseek-v3-250324");
    console.log('Stream mode:', stream);
    
    const requestData = {
      model: process.env.ARK_MODEL_ID || "deepseek-v3-250324",
      messages: [
        {
          role: "system",
          content: "你是一个专注于胃肠道间质瘤（GIST）的辅助智能助手。你的主要功能是协助用户了解和学习GIST相关知识，包括：\n\n1. GIST的基本概念和分子机制\n2. 常见的基因突变（如KIT、PDGFRA等）\n3. GIST的诊断方法和病理特征\n4. 治疗选择和药物信息\n5. 相关研究进展和文献信息\n\n请用通俗易懂的语言回答用户问题，重点提供科普性和教育性内容。如果遇到具体的医疗决策问题，请提醒用户咨询专业医生。当问题与GIST相关度较低时，可以尝试从GIST角度提供相关信息。"
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: stream
    };

    if (stream) {
      // 流式响应
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const arkResponse = await axios.post(
        process.env.ARK_API_URL,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.ARK_API_KEY}`,
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
        process.env.ARK_API_URL,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.ARK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30秒超时
        }
      );
      
      // 提取AI回复
      const reply = arkResponse.data.choices[0].message.content;
      res.json({ reply });
    }
    
  } catch (error) {
    console.error('Chat API error details:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Error Message:', error.message);
    
    if (error.response?.status === 401) {
      res.status(500).json({ 
        error: 'API认证失败，请检查API Key是否正确。' 
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