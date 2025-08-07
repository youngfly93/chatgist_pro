import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SingleCellService {
  constructor() {
    // Plumber API 配置
    this.plumberAPIEnabled = process.env.SINGLECELL_PLUMBER_ENABLED === 'true';
    this.plumberAPIUrl = process.env.SINGLECELL_PLUMBER_URL || 'http://localhost:8003';
    
    // R 脚本路径配置 - 需要考虑从 backend 目录运行的情况
    const isInBackend = process.cwd().endsWith('backend');
    if (isInBackend) {
      this.rScriptPath = path.join(process.cwd(), '..', 'singlecell_api_adapter.R');
      this.workingDir = path.join(process.cwd(), '..');
    } else {
      this.rScriptPath = path.join(process.cwd(), 'singlecell_api_adapter.R');
      this.workingDir = process.cwd();
    }
    
    // Plumber API 可用性标志
    this.plumberAPIAvailable = false;
    
    console.log('=== SingleCellService 初始化 ===');
    console.log('SINGLECELL_PLUMBER_ENABLED:', process.env.SINGLECELL_PLUMBER_ENABLED);
    console.log('plumberAPIEnabled:', this.plumberAPIEnabled);
    console.log('plumberAPIUrl:', this.plumberAPIUrl);
    console.log('当前工作目录:', process.cwd());
    console.log('R 脚本路径:', this.rScriptPath);
    console.log('工作目录:', this.workingDir);
    console.log('R 脚本文件存在:', fs.existsSync(this.rScriptPath));
    
    // 如果启用了 Plumber API，进行健康检查
    if (this.plumberAPIEnabled) {
      console.log('Single-cell Plumber API 已启用，正在检查健康状态...');
      this.healthCheckPromise = this.checkPlumberAPIHealth();
    } else {
      console.log('Single-cell Plumber API 未启用，将使用命令行模式');
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
        console.log(`Single-cell Plumber API 健康检查 (尝试 ${attempt}/3)...`);
        const response = await axios.get(`${this.plumberAPIUrl}/singlecell/health`, {
          timeout: 5000
        });
        
        if (response.status === 200) {
          console.log('Single-cell Plumber API 健康检查通过');
          this.plumberAPIAvailable = true;
          return true;
        }
      } catch (error) {
        console.log(`Single-cell Plumber API 健康检查失败 (尝试 ${attempt}/3):`, error.message);
        if (attempt < 3) {
          // 等待2秒后重试
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    console.log('Single-cell Plumber API 不可用，将使用命令行模式');
    this.plumberAPIAvailable = false;
    return false;
  }

  /**
   * 等待健康检查完成
   */
  async ensureHealthCheck() {
    if (this.healthCheckPromise) {
      await this.healthCheckPromise;
      this.healthCheckPromise = null;
    }
  }

  /**
   * 通过 Plumber API 执行分析
   */
  async executeViaPlumberAPI(functionType, params) {
    try {
      // 映射函数类型到正确的端点
      const endpointMap = {
        'query': 'query',
        'violin_plot': 'violin',
        'umap_celltype': 'umap_celltype', 
        'umap_expression': 'umap_expression',
        'comprehensive': 'comprehensive'
      };
      
      const endpointName = endpointMap[functionType] || functionType;
      const endpoint = `${this.plumberAPIUrl}/singlecell/${endpointName}`;
      console.log(`调用 Single-cell Plumber API: ${endpoint}`);
      console.log('参数:', JSON.stringify(params, null, 2));
      
      const response = await axios.post(endpoint, params, {
        timeout: 300000, // 5分钟超时
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      if (response.status === 200) {
        console.log('Single-cell Plumber API 调用成功');
        return response.data;
      } else {
        throw new Error(`Plumber API 返回状态码: ${response.status}`);
      }
    } catch (error) {
      console.error('Single-cell Plumber API 调用失败:', error.message);
      
      // 如果是网络错误，标记API不可用
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        this.plumberAPIAvailable = false;
      }
      
      throw new Error(`Plumber API 调用失败: ${error.message}`);
    }
  }

  /**
   * 通过命令行执行 R 脚本
   */
  async executeViaCommandLine(functionType, params) {
    return new Promise((resolve, reject) => {
      console.log('=== 使用命令行模式执行 Single-cell 分析 ===');
      console.log('R 脚本路径:', this.rScriptPath);
      console.log('工作目录:', this.workingDir);
      console.log('分析类型:', functionType);
      console.log('参数:', JSON.stringify(params, null, 2));

      // 检查 R 脚本是否存在
      if (!fs.existsSync(this.rScriptPath)) {
        return reject(new Error(`R script not found: ${this.rScriptPath}`));
      }

      // 构建命令行参数
      const args = ['--vanilla', this.rScriptPath, `--function=${functionType}`];
      
      if (params.gene) args.push(`--gene=${params.gene}`);
      if (params.dataset) args.push(`--dataset=${params.dataset}`);

      // 使用系统 shell 执行，避免路径问题
      const isWindows = process.platform === 'win32';
      let rProcess;
      
      if (isWindows) {
        // Windows: 直接使用 Rscript.exe
        const rscriptPath = 'E:\\R-4.4.1\\bin\\Rscript.exe';
        console.log('执行 Rscript.exe:', rscriptPath, args.join(' '));
        
        rProcess = spawn(rscriptPath, args, {
          cwd: this.workingDir,
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: false
        });
      } else {
        // Linux/Mac: 直接执行
        console.log('Spawning: Rscript', args);
        rProcess = spawn('Rscript', args, {
          cwd: this.workingDir,
          stdio: ['pipe', 'pipe', 'pipe']
        });
      }

      let stdout = '';
      let stderr = '';

      rProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      rProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      rProcess.on('close', (code) => {
        console.log(`R 脚本执行完成，退出代码: ${code}`);
        
        if (stderr) {
          console.log('R 脚本 stderr:', stderr);
        }

        if (code !== 0) {
          return reject(new Error(`R script failed with code ${code}: ${stderr}`));
        }

        try {
          // 解析 JSON 输出
          const result = JSON.parse(stdout);
          console.log('R 脚本执行成功');
          resolve(result);
        } catch (error) {
          console.error('JSON 解析失败:', error.message);
          console.error('原始输出:', stdout);
          reject(new Error(`Failed to parse R script output: ${error.message}`));
        }
      });

      rProcess.on('error', (error) => {
        console.error('R 脚本执行错误:', error.message);
        reject(new Error(`Failed to execute R script: ${error.message}`));
      });
    });
  }

  /**
   * 执行分析（自动选择执行模式）
   */
  async executeAnalysis(functionType, params) {
    // 确保健康检查完成
    await this.ensureHealthCheck();

    console.log(`=== 执行 Single-cell 分析: ${functionType} ===`);
    console.log('Plumber API 可用:', this.plumberAPIAvailable);

    try {
      // 优先使用 Plumber API
      if (this.plumberAPIAvailable) {
        return await this.executeViaPlumberAPI(functionType, params);
      } else {
        return await this.executeViaCommandLine(functionType, params);
      }
    } catch (error) {
      console.error(`Single-cell 分析执行失败 (${functionType}):`, error.message);
      
      // 如果 Plumber API 失败，尝试命令行模式
      if (this.plumberAPIAvailable && !error.message.includes('R script')) {
        console.log('Plumber API 失败，尝试命令行模式...');
        this.plumberAPIAvailable = false;
        return await this.executeViaCommandLine(functionType, params);
      }
      
      throw error;
    }
  }

  /**
   * 查询基因信息
   */
  async queryGeneInfo(gene, dataset = null) {
    return await this.executeAnalysis('query', { gene, dataset });
  }

  /**
   * 生成 Violin Plot
   */
  async generateViolinPlot(gene, dataset = null) {
    return await this.executeAnalysis('violin_plot', { gene, dataset });
  }

  /**
   * 生成 UMAP 细胞类型图
   */
  async generateUMAPCelltype(dataset = null) {
    return await this.executeAnalysis('umap_celltype', { dataset });
  }

  /**
   * 生成 UMAP 基因表达图
   */
  async generateUMAPExpression(gene, dataset = null) {
    return await this.executeAnalysis('umap_expression', { gene, dataset });
  }

  /**
   * 综合分析
   */
  async comprehensiveAnalysis(gene, dataset = null) {
    return await this.executeAnalysis('comprehensive', { gene, dataset });
  }

  /**
   * 获取服务健康状态
   */
  async getHealthStatus() {
    await this.ensureHealthCheck();
    
    const status = {
      service: 'SingleCellService',
      plumber_api_enabled: this.plumberAPIEnabled,
      plumber_api_available: this.plumberAPIAvailable,
      plumber_api_url: this.plumberAPIUrl,
      r_script_path: this.rScriptPath,
      r_script_exists: fs.existsSync(this.rScriptPath),
      working_directory: this.workingDir,
      datasets_available: []
    };

    // 检查数据集文件
    const datasetPaths = [
      'ChatGIST_ssc/In_house_ssc_reduce.RDS',
      'ChatGIST_ssc/GSE254762_ssc_reduce.RDS',
      'ChatGIST_ssc/GSE162115_ssc_reduce.RDS'
    ];

    for (const datasetPath of datasetPaths) {
      const fullPath = path.join(this.workingDir, datasetPath);
      if (fs.existsSync(fullPath)) {
        status.datasets_available.push(datasetPath);
      }
    }

    return status;
  }

  /**
   * 获取可用数据集信息
   */
  async getAvailableDatasets() {
    const datasets = [
      {
        name: 'In_house',
        file: 'ChatGIST_ssc/In_house_ssc_reduce.RDS',
        description: 'In-house GIST Single-cell Data',
        priority: 1
      },
      {
        name: 'GSE254762',
        file: 'ChatGIST_ssc/GSE254762_ssc_reduce.RDS',
        description: 'GSE254762 GIST Single-cell Data',
        priority: 2
      },
      {
        name: 'GSE162115',
        file: 'ChatGIST_ssc/GSE162115_ssc_reduce.RDS',
        description: 'GSE162115 GIST Single-cell Data',
        priority: 3
      }
    ];

    // 检查文件存在性
    for (const dataset of datasets) {
      const fullPath = path.join(this.workingDir, dataset.file);
      dataset.available = fs.existsSync(fullPath);
    }

    return datasets.filter(d => d.available);
  }
}

// 导出单例实例
const singleCellService = new SingleCellService();
export default singleCellService;