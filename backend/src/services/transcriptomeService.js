import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TranscriptomeService {
  constructor() {
    // Plumber API 配置
    this.plumberAPIEnabled = process.env.TRANSCRIPTOME_PLUMBER_ENABLED === 'true';
    this.plumberAPIUrl = process.env.TRANSCRIPTOME_PLUMBER_URL || 'http://localhost:8002';
    
    // R 脚本路径配置
    this.rScriptPath = path.join(process.cwd(), 'transcriptome_api_adapter.R');
    this.workingDir = process.cwd();
    
    // Plumber API 可用性标志
    this.plumberAPIAvailable = false;
    
    console.log('=== TranscriptomeService 初始化 ===');
    console.log('TRANSCRIPTOME_PLUMBER_ENABLED:', process.env.TRANSCRIPTOME_PLUMBER_ENABLED);
    console.log('plumberAPIEnabled:', this.plumberAPIEnabled);
    console.log('plumberAPIUrl:', this.plumberAPIUrl);
    
    // 如果启用了 Plumber API，进行健康检查
    if (this.plumberAPIEnabled) {
      console.log('Plumber API 已启用，正在检查健康状态...');
      this.healthCheckPromise = this.checkPlumberAPIHealth();
    } else {
      console.log('Plumber API 未启用，将使用命令行模式');
      this.healthCheckPromise = Promise.resolve(false);
    }
  }

  /**
   * 检查 Plumber API 健康状态
   */
  async checkPlumberAPIHealth() {
    if (!this.plumberAPIEnabled) {
      return false;
    }
    
    // 重试3次，每次间隔2秒
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Transcriptome Plumber API 健康检查 (尝试 ${attempt}/3)...`);
        const response = await axios.get(`${this.plumberAPIUrl}/transcriptome/health`, {
          timeout: 5000
        });
        
        if (response.data && 
            (response.data.status === 'healthy' || 
             (Array.isArray(response.data.status) && response.data.status[0] === 'healthy'))) {
          console.log('Transcriptome Plumber API 健康检查响应:', response.data);
          this.plumberAPIAvailable = true;
          console.log(`✓ Transcriptome Plumber API 连接成功: ${this.plumberAPIUrl}`);
          return true;
        }
      } catch (error) {
        console.warn(`Transcriptome Plumber API 健康检查失败 (尝试 ${attempt}/3):`);
        console.warn('Error:', error.message);
        if (error.response) {
          console.warn('Response status:', error.response.status);
          console.warn('Response data:', error.response.data);
        }
        
        // 如果不是最后一次尝试，等待2秒
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    this.plumberAPIAvailable = false;
    console.log('Transcriptome Plumber API 不可用，将降级到命令行模式');
    return false;
  }

  /**
   * 通过 Plumber API 执行分析
   */
  async analyzeViaPlumber(params) {
    const { function: funcName, gene, gene2 } = params;
    
    // 构建 API 端点
    let endpoint = '';
    let data = { gene };
    
    switch (funcName) {
      case 'query':
        endpoint = '/transcriptome/query';
        break;
      case 'boxplot_gender':
        endpoint = '/transcriptome/boxplot/gender';
        break;
      case 'boxplot_tvn':
        endpoint = '/transcriptome/boxplot/tvn';
        break;
      case 'boxplot_risk':
        endpoint = '/transcriptome/boxplot/risk';
        break;
      case 'boxplot_location':
        endpoint = '/transcriptome/boxplot/location';
        break;
      case 'boxplot_mutation':
        endpoint = '/transcriptome/boxplot/mutation';
        break;
      case 'boxplot_age':
        endpoint = '/transcriptome/boxplot/age';
        break;
      case 'boxplot_tumorsize':
        endpoint = '/transcriptome/boxplot/tumorsize';
        break;
      case 'boxplot_grade':
        endpoint = '/transcriptome/boxplot/grade';
        break;
      case 'correlation':
        endpoint = '/transcriptome/correlation';
        data = { gene1: gene, gene2: gene2 };
        break;
      case 'drug':
        endpoint = '/transcriptome/drug';
        break;
      case 'prepost':
        endpoint = '/transcriptome/prepost';
        break;
      default:
        throw new Error(`不支持的分析类型: ${funcName}`);
    }
    
    console.log('=== TRANSCRIPTOME PLUMBER API CALL ===');
    console.log('Endpoint:', endpoint);
    console.log('Data:', data);
    
    try {
      const response = await axios.post(
        `${this.plumberAPIUrl}${endpoint}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30秒超时
        }
      );
      
      console.log('API Response Status:', response.status);
      
      if (response.data) {
        // 处理数组格式的响应（Plumber API 特性）
        const getValue = (field) => {
          const value = response.data[field];
          return Array.isArray(value) ? value[0] : value;
        };
        
        const result = {
          status: getValue('status'),
          message: getValue('message'),
          timestamp: getValue('timestamp')
        };
        
        // 处理数据字段
        if (response.data.data) {
          result.data = response.data.data;
        }
        
        // 处理图片字段
        if (response.data.plot) {
          result.plot = getValue('plot');
        }
        
        // 处理相关性统计
        if (response.data.correlation_stats) {
          result.correlation_stats = response.data.correlation_stats;
        }
        
        // 处理 ROC 统计
        if (response.data.roc_stats) {
          result.roc_stats = response.data.roc_stats;
        }
        
        // 日志处理结果
        console.log('Processed result:', {
          status: result.status,
          hasData: !!result.data,
          hasPlot: !!result.plot,
          hasStats: !!(result.correlation_stats || result.roc_stats)
        });
        
        return result;
      }
      
      throw new Error('API 返回了空响应');
    } catch (error) {
      console.error('Transcriptome Plumber API 错误:', error.message);
      throw error;
    }
  }

  /**
   * 执行转录组分析（主入口）
   */
  async analyze(params) {
    console.log('\n使用 Plumber API 执行分析...');
    
    try {
      // 等待健康检查完成
      await this.healthCheckPromise;
      
      // 如果 Plumber API 可用，使用它
      if (this.plumberAPIAvailable) {
        return await this.analyzeViaPlumber(params);
      }
      
      // 否则返回错误（暂不实现命令行模式）
      throw new Error('Transcriptome Plumber API 不可用，请先启动 API 服务');
      
    } catch (error) {
      console.error('TranscriptomeService error:', error);
      throw error;
    }
  }

  /**
   * 综合分析入口
   */
  async comprehensiveAnalysis(gene) {
    const analyses = {
      query: null,
      gender: null,
      tvn: null,
      risk: null,
      location: null,
      mutation: null
    };
    
    const results = {
      gene: gene,
      timestamp: new Date().toISOString(),
      analyses: analyses,
      summary: {
        total: 6,
        successful: 0,
        failed: 0
      }
    };
    
    // 执行各种分析
    const analysisTypes = [
      { key: 'query', func: 'query' },
      { key: 'gender', func: 'boxplot_gender' },
      { key: 'tvn', func: 'boxplot_tvn' },
      { key: 'risk', func: 'boxplot_risk' },
      { key: 'location', func: 'boxplot_location' },
      { key: 'mutation', func: 'boxplot_mutation' }
    ];
    
    for (const { key, func } of analysisTypes) {
      try {
        console.log(`执行 ${key} 分析...`);
        analyses[key] = await this.analyze({
          function: func,
          gene: gene
        });
        results.summary.successful++;
      } catch (error) {
        console.error(`${key} 分析失败:`, error.message);
        analyses[key] = {
          status: 'error',
          message: error.message
        };
        results.summary.failed++;
      }
    }
    
    return results;
  }
}

// 创建单例实例
const transcriptomeService = new TranscriptomeService();

export default transcriptomeService;