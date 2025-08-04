/**
 * 蛋白质组学分析服务
 * 提供与GIST蛋白质组学Plumber API的集成
 */

import { spawn } from 'child_process';
import axios from 'axios';
import path from 'path';

class ProteomicsService {
  constructor() {
    console.log('=== ProteomicsService 初始化 ===');
    
    // 环境变量配置
    this.plumberAPIEnabled = process.env.PROTEOMICS_PLUMBER_ENABLED === 'true';
    this.plumberAPIUrl = process.env.PROTEOMICS_PLUMBER_URL || 'http://localhost:8004';
    
    // R脚本路径配置
    this.currentDir = process.cwd();
    this.workingDir = path.resolve(this.currentDir, '..');
    this.rScriptPath = path.resolve(this.workingDir, 'proteomics_api_adapter.R');
    
    console.log('PROTEOMICS_PLUMBER_ENABLED:', process.env.PROTEOMICS_PLUMBER_ENABLED);
    console.log('plumberAPIEnabled:', this.plumberAPIEnabled);
    console.log('plumberAPIUrl:', this.plumberAPIUrl);
    console.log('当前工作目录:', this.currentDir);
    console.log('R 脚本路径:', this.rScriptPath);
    console.log('工作目录:', this.workingDir);
    
    // 检查R脚本文件是否存在
    try {
      import('fs').then(fs => {
        const scriptExists = fs.existsSync(this.rScriptPath);
        console.log('R 脚本文件存在:', scriptExists);
      }).catch(err => {
        console.log('检查R脚本文件时出错:', err.message);
      });
    } catch (err) {
      console.log('检查R脚本文件时出错:', err.message);
    }
    
    if (this.plumberAPIEnabled) {
      console.log('蛋白质组学 Plumber API 已启用，正在检查健康状态...');
      this.checkAPIHealth();
    } else {
      console.log('蛋白质组学 Plumber API 已禁用，将使用命令行模式');
    }
  }

  /**
   * 检查Plumber API健康状态
   */
  async checkAPIHealth(retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`蛋白质组学 Plumber API 健康检查 (尝试 ${attempt}/${retries})...`);
        
        const response = await axios.get(`${this.plumberAPIUrl}/health`, {
          timeout: 5000
        });
        
        console.log('蛋白质组学 Plumber API 健康检查响应:', response.data);
        console.log('✓ 蛋白质组学 Plumber API 连接成功:', this.plumberAPIUrl);
        console.log('Plumber API 初始化完成，将优先使用 Plumber API');
        return;
        
      } catch (error) {
        console.log(`蛋白质组学 Plumber API 健康检查失败 (尝试 ${attempt}/${retries}):`, error.message);
        
        if (attempt === retries) {
          console.log('❌ 蛋白质组学 Plumber API 连接失败，将回退到命令行模式');
          this.plumberAPIEnabled = false;
        } else {
          // 等待2秒后重试
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  }

  /**
   * 规范化Plumber API返回的数组格式数据
   */
  normalizeResponse(data) {
    if (!data || typeof data !== 'object') return data;
    
    const normalized = {};
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length === 1) {
        normalized[key] = value[0];
      } else {
        normalized[key] = value;
      }
    }
    return normalized;
  }

  /**
   * 通过Plumber API执行分析
   */
  async executeViaPlumberAPI(endpoint, params) {
    try {
      console.log(`调用蛋白质组学 API: ${endpoint}`);
      console.log('参数:', params);
      
      const response = await axios.post(`${this.plumberAPIUrl}${endpoint}`, params, {
        timeout: 900000, // 增加到15分钟，确保GSEA分析有充足的计算时间
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let result = response.data;
      
      // 规范化响应数据
      result = this.normalizeResponse(result);
      
      console.log('蛋白质组学 API 响应状态:', result.status);
      
      if (result.status === 'success') {
        const hasData = !!(result.data);
        const hasPlot = !!(result.plot);
        console.log(`蛋白质组学分析结果: hasData=${hasData}, hasPlot=${hasPlot}`);
      }
      
      return result;
      
    } catch (error) {
      console.error('蛋白质组学 Plumber API 调用失败:', error.message);
      throw new Error(`蛋白质组学分析失败: ${error.message}`);
    }
  }

  /**
   * 通过命令行执行R脚本
   */
  async executeViaCommandLine(functionName, params) {
    return new Promise((resolve, reject) => {
      console.log('使用命令行模式执行蛋白质组学分析');
      console.log('函数:', functionName);
      console.log('参数:', params);
      
      // 构建命令参数
      const args = ['--vanilla', this.rScriptPath, `--function=${functionName}`];
      
      // 添加参数
      for (const [key, value] of Object.entries(params)) {
        args.push(`--${key}=${value}`);
      }
      
      console.log('执行命令:', 'Rscript', args.join(' '));
      
      // 在Windows上使用批处理文件
      let command, commandArgs;
      if (process.platform === 'win32') {
        // 创建临时批处理文件内容
        const batchContent = `@echo off
cd /d "${this.workingDir}"
"E:\\R-4.4.1\\bin\\Rscript.exe" ${args.join(' ')}`;
        
        command = 'cmd';
        commandArgs = ['/c', batchContent];
      } else {
        command = 'Rscript';
        commandArgs = args;
      }
      
      const process = spawn(command, commandArgs, {
        cwd: this.workingDir,
        env: { ...process.env }
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('R输出:', data.toString().trim());
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('R错误:', data.toString().trim());
      });

      process.on('close', (code) => {
        console.log(`R脚本执行完成，退出码: ${code}`);

        if (code === 0) {
          try {
            // 解析JSON输出
            const lines = stdout.split('\n').filter(line => line.trim());
            const jsonLine = lines.find(line => line.startsWith('{') || line.startsWith('['));
            
            if (jsonLine) {
              const result = JSON.parse(jsonLine);
              resolve(result);
            } else {
              resolve({
                status: 'success',
                message: '分析完成',
                data: { output: stdout },
                plot: null
              });
            }
          } catch (error) {
            console.error('解析R脚本输出失败:', error);
            resolve({
              status: 'error',
              message: '输出解析失败',
              data: { stdout, stderr },
              plot: null
            });
          }
        } else {
          reject(new Error(`R脚本执行失败 (退出码: ${code}): ${stderr}`));
        }
      });

      process.on('error', (error) => {
        console.error('命令行执行错误:', error);
        reject(new Error(`命令执行失败: ${error.message}`));
      });
    });
  }

  /**
   * 蛋白质基本信息查询
   */
  async queryProtein(gene) {
    try {
      if (this.plumberAPIEnabled) {
        return await this.executeViaPlumberAPI('/query', { gene });
      } else {
        return await this.executeViaCommandLine('query', { gene });
      }
    } catch (error) {
      console.error('蛋白质查询失败:', error);
      return {
        status: 'error',
        message: error.message,
        data: null,
        plot: null
      };
    }
  }

  /**
   * 临床特征箱线图分析
   */
  async boxplotAnalysis(gene, analysisType = 'TvsN') {
    try {
      if (this.plumberAPIEnabled) {
        return await this.executeViaPlumberAPI('/boxplot', { 
          gene, 
          analysis_type: analysisType 
        });
      } else {
        return await this.executeViaCommandLine('boxplot', { 
          gene, 
          type: analysisType 
        });
      }
    } catch (error) {
      console.error('箱线图分析失败:', error);
      return {
        status: 'error',
        message: error.message,
        data: null,
        plot: null
      };
    }
  }

  /**
   * 蛋白质相关性分析
   */
  async correlationAnalysis(gene1, gene2) {
    try {
      if (this.plumberAPIEnabled) {
        return await this.executeViaPlumberAPI('/correlation', { gene1, gene2 });
      } else {
        return await this.executeViaCommandLine('correlation', { gene1, gene2 });
      }
    } catch (error) {
      console.error('相关性分析失败:', error);
      return {
        status: 'error',
        message: error.message,
        data: null,
        plot: null
      };
    }
  }

  /**
   * 药物耐药性分析
   */
  async drugResistanceAnalysis(gene) {
    try {
      if (this.plumberAPIEnabled) {
        return await this.executeViaPlumberAPI('/drug_resistance', { gene });
      } else {
        return await this.executeViaCommandLine('drug_resistance', { gene });
      }
    } catch (error) {
      console.error('药物耐药性分析失败:', error);
      return {
        status: 'error',
        message: error.message,
        data: null,
        plot: null
      };
    }
  }

  /**
   * 单基因富集分析
   */
  async enrichmentAnalysis(gene, dataset = "Sun's Study", analysisType = "both", topPositive = 50, topNegative = 50, nperm = 1000) {
    try {
      if (this.plumberAPIEnabled) {
        return await this.executeViaPlumberAPI('/enrichment', { 
          gene, 
          dataset,
          analysis_type: analysisType,
          top_positive: topPositive,
          top_negative: topNegative,
          nperm
        });
      } else {
        return await this.executeViaCommandLine('enrichment', { 
          gene, 
          dataset,
          analysis_type: analysisType,
          top_positive: topPositive,
          top_negative: topNegative,
          nperm
        });
      }
    } catch (error) {
      console.error('富集分析失败:', error);
      return {
        status: 'error',
        message: error.message,
        data: null,
        plot: null
      };
    }
  }

  /**
   * 综合分析
   */
  async comprehensiveAnalysis(gene, analyses = null) {
    try {
      const params = { gene };
      if (analyses) {
        params.analyses = Array.isArray(analyses) ? analyses : [analyses];
      }
      
      if (this.plumberAPIEnabled) {
        return await this.executeViaPlumberAPI('/comprehensive', params);
      } else {
        return await this.executeViaCommandLine('comprehensive', params);
      }
    } catch (error) {
      console.error('综合分析失败:', error);
      return {
        status: 'error',
        message: error.message,
        data: null,
        plot: null
      };
    }
  }

  /**
   * 批量分析（用于工具调用）
   */
  async batchAnalysis(gene, analysisTypes) {
    const results = {};
    
    for (const analysisType of analysisTypes) {
      try {
        let result;
        switch (analysisType) {
          case 'query':
            result = await this.queryProtein(gene);
            break;
          case 'comprehensive':
            result = await this.comprehensiveAnalysis(gene);
            break;
          case 'correlation':
            // 需要两个基因参数，这里使用默认的相关蛋白
            result = await this.correlationAnalysis(gene, 'FN1');
            break;
          case 'drug_resistance':
            result = await this.drugResistanceAnalysis(gene);
            break;
          case 'enrichment':
            result = await this.enrichmentAnalysis(gene);
            break;
          default:
            result = await this.boxplotAnalysis(gene, analysisType);
        }
        
        results[analysisType] = result;
      } catch (error) {
        console.error(`批量分析中 ${analysisType} 失败:`, error);
        results[analysisType] = {
          status: 'error',
          message: error.message,
          data: null,
          plot: null
        };
      }
    }
    
    return results;
  }
}

export default ProteomicsService;