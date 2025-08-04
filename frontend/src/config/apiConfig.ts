// API 配置文件

export interface ApiConfig {
  version: 'v1' | 'v2';
  baseUrl: string;
  endpoints: {
    chat: string;
    gene: string;
    phospho: string;
  };
}

// 获取 API 版本（可以从环境变量或 localStorage 读取）
export function getApiVersion(): 'v1' | 'v2' {
  // 优先级：环境变量 > localStorage > 默认值
  const envVersion = import.meta.env.VITE_API_VERSION;
  if (envVersion === 'v2') return 'v2';
  
  const storedVersion = localStorage.getItem('api_version');
  if (storedVersion === 'v2') return 'v2';
  
  return 'v1'; // 默认使用 v1
}

// 设置 API 版本
export function setApiVersion(version: 'v1' | 'v2') {
  localStorage.setItem('api_version', version);
}

// 获取 API 配置
export function getApiConfig(): ApiConfig {
  const version = getApiVersion();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  
  return {
    version,
    baseUrl,
    endpoints: {
      chat: version === 'v2' ? '/api/chat/v2' : '/api/chat',
      gene: '/api/gene',
      phospho: '/api/phospho'
    }
  };
}

// API 版本特性对比
export const API_FEATURES = {
  v1: {
    name: '传统模式',
    description: '使用隐藏JSON块方式调用分析',
    features: [
      '单次请求-响应',
      '快速响应',
      '适合简单查询'
    ]
  },
  v2: {
    name: 'Tool Calling 模式',
    description: '使用标准 Tool Calling API',
    features: [
      'AI 智能决策工具调用',
      '支持并行分析',
      '更好的错误处理',
      '可解释的分析过程'
    ]
  }
};