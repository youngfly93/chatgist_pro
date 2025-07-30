// 仅用于测试的非流式聊天路由
import express from 'express';
import axios from 'axios';
import phosphoService from '../services/phosphoService.js';

const router = express.Router();

router.post('/test', async (req, res) => {
  const isKimi = process.env.USE_KIMI === 'true';
  let apiKey;
  
  try {
    const { message } = req.body;
    
    console.log('=== CHAT TEST (NO STREAM) ===');
    console.log('Message:', message);
    
    const apiUrl = isKimi ? 'https://api.moonshot.cn/v1/chat/completions' : process.env.ARK_API_URL;
    apiKey = isKimi ? process.env.KIMI_API_KEY : process.env.ARK_API_KEY;
    const modelId = isKimi ? 'kimi-k2-0711-preview' : (process.env.ARK_MODEL_ID || "deepseek-v3-250324");
    
    console.log('Using:', isKimi ? 'Kimi' : 'ARK');
    console.log('Model:', modelId);
    
    const response = await axios.post(
      apiUrl,
      {
        model: modelId,
        messages: [
          {
            role: "system",
            content: "你是Kimi，一个专业的AI助手。"
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.6,
        stream: false  // 强制非流式
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('API响应成功');
    res.json({ 
      success: true,
      reply: response.data.choices[0].message.content 
    });
    
  } catch (error) {
    console.error('Chat test error:', error.response?.status, error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      error: error.response?.data || error.message 
    });
  }
});

export default router;