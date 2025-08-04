import { exec, spawn } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import axios from 'axios';

const execAsync = promisify(exec);

class PhosphoService {
  constructor() {
    // Plumber API 配置
    this.plumberAPIEnabled = process.env.PLUMBER_API_ENABLED === 'true';
    this.plumberAPIUrl = process.env.PLUMBER_API_URL || 'http://localhost:8001';
    this.plumberAPIAvailable = false; // 默认不可用，健康检查成功后才设置为 true
    this.healthCheckPromise = null; // 保存健康检查的 Promise
    
    console.log('=== PhosphoService 初始化 ===');
    console.log('PLUMBER_API_ENABLED:', process.env.PLUMBER_API_ENABLED);
    console.log('PLUMBER_API_ENABLED type:', typeof process.env.PLUMBER_API_ENABLED);
    console.log('plumberAPIEnabled:', this.plumberAPIEnabled);
    console.log('plumberAPIUrl:', this.plumberAPIUrl);
    
    // 检查是否存在真实项目（支持从根目录和backend目录运行）
    const realProjectPath1 = path.resolve('../GIST_Phosphoproteomics');
    const realProjectPath2 = path.resolve('./GIST_Phosphoproteomics');
    const hasRealProject = fs.existsSync(realProjectPath1) || fs.existsSync(realProjectPath2);
    
    if (hasRealProject) {
      // 使用真实项目的适配器
      if (fs.existsSync(realProjectPath1)) {
        this.rScriptPath = path.resolve('../phospho_api_adapter.R');
        this.workingDir = path.resolve('../');
      } else {
        this.rScriptPath = path.resolve('./phospho_api_adapter.R');
        this.workingDir = path.resolve('./');
      }
      console.log('使用真实的 GIST_Phosphoproteomics 项目');
    } else {
      // 使用演示脚本
      this.rScriptPath = path.resolve('../phospho_api_demo.R');
      this.workingDir = path.resolve('../');
      console.log('使用演示脚本');
    }
    
    // 支持的分析类型
    this.supportedFunctions = [
      'query',
      'boxplot_TvsN',
      'boxplot_Risk',
      'boxplot_Gender',
      'boxplot_Age',
      'boxplot_Location',
      'boxplot_WHO',
      'boxplot_Mutation',
      'boxplot_TumorSize',
      'boxplot_MitoticCount',
      'boxplot_IMResponse',
      'survival',
      'comprehensive'
    ];
    
    // 初始化时检查 Plumber API 状态
    if (this.plumberAPIEnabled) {
      console.log('Plumber API 已启用，正在检查健康状态...');
      // 保存健康检查的 Promise，以便后续等待
      this.healthCheckPromise = this.checkPlumberAPIHealth();
      this.healthCheckPromise.then(() => {
        if (this.plumberAPIAvailable) {
          console.log('Plumber API 初始化完成，将优先使用 Plumber API');
        }
      });
    } else {
      console.log('Plumber API 未启用，将使用命令行模式');
      this.plumberAPIAvailable = false;
      this.healthCheckPromise = Promise.resolve(); // 空的已完成 Promise
    }
  }

  /**
   * 检查 Plumber API 健康状态
   */
  async checkPlumberAPIHealth() {
    try {
      const response = await axios.get(`${this.plumberAPIUrl}/phospho/health`);
      console.log('Plumber API 健康检查响应:', response.data);
      
      // Plumber 可能返回数组格式的响应
      const status = Array.isArray(response.data.status) 
        ? response.data.status[0] 
        : response.data.status;
      
      if (status === 'healthy') {
        console.log('✓ Plumber API 连接成功:', this.plumberAPIUrl);
        this.plumberAPIAvailable = true;
      } else {
        console.log('✗ Plumber API 状态异常:', status);
        this.plumberAPIAvailable = false;
      }
    } catch (error) {
      console.warn('✗ Plumber API 不可用，将使用命令行模式:', error.message);
      this.plumberAPIAvailable = false;
    }
  }

  /**
   * 验证输入参数
   */
  validateParams(params) {
    const { function: funcName, gene } = params;
    
    if (!funcName || !gene) {
      throw new Error('缺少必需参数：function 和 gene');
    }
    
    if (!this.supportedFunctions.includes(funcName)) {
      throw new Error(`不支持的分析类型：${funcName}`);
    }
    
    // 基因名验证 - 只允许字母数字和一些特殊字符
    if (!/^[A-Za-z0-9_-]+$/.test(gene)) {
      throw new Error('无效的基因名称格式');
    }
    
    return true;
  }

  /**
   * 将 R 返回的数据对象转换为数组格式
   */
  convertDataObjectToArray(dataObj) {
    // 如果数据对象有特定的结构（如 R data.frame），尝试转换
    try {
      const keys = Object.keys(dataObj);
      if (keys.length === 0) return [];
      
      // 假设所有的值都是相同长度的数组
      const firstKey = keys[0];
      const length = Array.isArray(dataObj[firstKey]) ? dataObj[firstKey].length : 1;
      
      const result = [];
      for (let i = 0; i < length; i++) {
        const row = {};
        keys.forEach(key => {
          row[key] = Array.isArray(dataObj[key]) ? dataObj[key][i] : dataObj[key];
        });
        result.push(row);
      }
      return result;
    } catch (error) {
      console.error('Error converting data object to array:', error);
      return [];
    }
  }

  /**
   * 通过 Plumber API 执行分析
   */
  async analyzeViaPlumber(params) {
    const { function: funcName, gene, site, cutoff, survtype } = params;
    
    // 构建 API 端点
    let endpoint = '';
    let requestData = { gene };
    
    if (funcName === 'query') {
      endpoint = '/phospho/query';
    } else if (funcName.startsWith('boxplot_')) {
      const boxplotType = funcName.replace('boxplot_', '');
      endpoint = `/phospho/boxplot/${boxplotType}`;
      if (site) requestData.site = site;
    } else if (funcName === 'survival') {
      endpoint = '/phospho/survival';
      if (site) requestData.site = site;
      if (cutoff) requestData.cutoff = cutoff;
      if (survtype) requestData.survtype = survtype;
    } else if (funcName === 'comprehensive') {
      endpoint = '/phospho/comprehensive';
    }
    
    console.log('=== PLUMBER API CALL ===');
    console.log('Endpoint:', endpoint);
    console.log('Data:', requestData);
    
    try {
      const response = await axios.post(
        `${this.plumberAPIUrl}${endpoint}`,
        requestData,
        {
          timeout: 60000, // 60秒超时
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('API Response Status:', response.status);
      
      // 处理 Plumber 返回的数据格式
      // Plumber 可能返回数组格式的数据
      if (response.data) {
        const result = {
          status: Array.isArray(response.data.status) ? response.data.status[0] : response.data.status,
          message: Array.isArray(response.data.message) ? response.data.message[0] : response.data.message,
          timestamp: Array.isArray(response.data.timestamp) ? response.data.timestamp[0] : response.data.timestamp
        };
        
        // 处理 data 字段
        if (response.data.data !== undefined) {
          if (Array.isArray(response.data.data)) {
            result.data = response.data.data;
          } else if (typeof response.data.data === 'object') {
            // 将对象转换为数组格式
            const dataKeys = Object.keys(response.data.data);
            if (dataKeys.length === 0) {
              console.warn('Plumber API 返回空 data 对象');
              result.data = [];
            } else {
              // 尝试将对象转换为记录数组
              result.data = this.convertDataObjectToArray(response.data.data);
            }
          } else {
            result.data = response.data.data;
          }
        }
        
        // 处理 plot 字段 - 修复这里的逻辑
        if (response.data.plot !== undefined) {
          if (Array.isArray(response.data.plot) && response.data.plot.length > 0) {
            // Plumber 返回的是数组格式，取第一个元素
            result.plot = response.data.plot[0];
          } else if (typeof response.data.plot === 'string' && response.data.plot.length > 0) {
            // 直接是字符串格式
            result.plot = response.data.plot;
          } else if (typeof response.data.plot === 'object' && Object.keys(response.data.plot).length === 0) {
            console.warn('Plumber API 返回空 plot 对象');
            // 不设置 plot 字段
          } else {
            result.plot = response.data.plot;
          }
        }
        
        // 处理综合分析的 analyses 字段
        if (response.data.analyses) {
          result.analyses = response.data.analyses;
        }
        
        // 处理 summary 字段（综合分析）
        if (response.data.summary) {
          result.summary = response.data.summary;
        }
        
        console.log('Processed result:', {
          status: result.status,
          hasData: !!result.data,
          hasPlot: !!result.plot,
          hasAnalyses: !!result.analyses
        });
        
        return result;
      }
      
      return response.data;
    } catch (error) {
      console.error('Plumber API Error:', error.message);
      
      if (error.response) {
        // API 返回了错误响应
        throw new Error(error.response.data.message || 'API 请求失败');
      } else if (error.code === 'ECONNREFUSED') {
        // API 服务器未启动
        throw new Error('Plumber API 服务未启动，请先启动 R API 服务器');
      } else {
        throw error;
      }
    }
  }

  /**
   * 构建R命令（命令行模式）
   */
  buildCommand(params) {
    const { function: funcName, gene, site, cutoff, survtype } = params;

    // Windows 平台使用不同的命令格式
    const isWindows = process.platform === 'win32';
    let cmd;
    
    if (isWindows) {
      // Windows: 使用绝对路径并确保正确的引号
      const rscriptPath = 'E:\\R-4.4.1\\bin\\Rscript.exe';
      cmd = `"${rscriptPath}" --vanilla "${this.rScriptPath}" --function="${funcName}" --gene="${gene}"`;
    } else {
      cmd = `Rscript --vanilla "${this.rScriptPath}" --function="${funcName}" --gene="${gene}"`;
    }
    
    // 添加磷酸化位点参数（如果有）
    if (site) {
      cmd += ` --site="${site}"`;
    }
    
    // 添加可选参数
    if (funcName === 'survival') {
      if (cutoff) cmd += ` --cutoff="${cutoff}"`;
      if (survtype) cmd += ` --survtype="${survtype}"`;
    }
    
    return cmd;
  }

  /**
   * 执行磷酸化分析（命令行模式）
   */
  async analyzeViaCommand(params) {
    const { function: funcName, gene, site, cutoff, survtype } = params;
    
    console.log('=== COMMAND LINE EXECUTION ===');
    console.log(`R Script Path: ${this.rScriptPath}`);
    console.log(`Working Directory: ${this.workingDir}`);
    console.log(`Parameters:`, params);
    
    // 检查文件是否存在
    const scriptExists = fs.existsSync(this.rScriptPath);
    const workDirExists = fs.existsSync(this.workingDir);
    console.log(`Script exists: ${scriptExists}`);
    console.log(`Working dir exists: ${workDirExists}`);
    
    return new Promise((resolve, reject) => {
      // 使用 spawn 避免 shell 解释问题
      const isWindows = process.platform === 'win32';
      const rscriptPath = isWindows ? 'E:\\R-4.4.1\\bin\\Rscript.exe' : 'Rscript';
      
      // 构建参数数组
      const args = [
        '--vanilla',
        this.rScriptPath,
        `--function=${funcName}`,
        `--gene=${gene}`
      ];
      
      if (site) args.push(`--site=${site}`);
      if (funcName === 'survival') {
        if (cutoff) args.push(`--cutoff=${cutoff}`);
        if (survtype) args.push(`--survtype=${survtype}`);
      }
      
      console.log('Spawning:', rscriptPath, args);
      
      const rProcess = spawn(rscriptPath, args, {
        cwd: this.workingDir,
        windowsHide: true
      });
      
      let stdout = '';
      let stderr = '';
      
      rProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      rProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      rProcess.on('error', (error) => {
        console.error('Failed to start R process:', error);
        reject(new Error(`无法启动R进程: ${error.message}`));
      });
      
      rProcess.on('close', (code) => {
        console.log('=== R SCRIPT EXECUTION COMPLETE ===');
        console.log('Exit code:', code);
        
        if (stderr) {
          console.log('R script stderr:', stderr);
        }
        
        console.log('R script stdout length:', stdout.length);
        console.log('R script stdout (first 500 chars):', stdout.substring(0, 500));
        
        if (code !== 0) {
          reject(new Error(`R脚本执行失败，退出码: ${code}, 错误: ${stderr}`));
          return;
        }
        
        // 解析JSON结果
        try {
          const result = JSON.parse(stdout);
          console.log('Successfully parsed JSON result');
          
          // 检查执行状态
          if (result.status === 'error') {
            reject(new Error(result.message || '分析执行失败'));
          } else {
            resolve(result);
          }
        } catch (parseError) {
          console.error('Failed to parse R output as JSON');
          console.error('Parse error:', parseError.message);
          console.error('Full stdout:', stdout);
          reject(new Error('R脚本返回了无效的JSON格式'));
        }
      });
      
      // 设置超时
      setTimeout(() => {
        rProcess.kill();
        reject(new Error('R脚本执行超时'));
      }, 60000); // 60秒超时
    });
  }

  /**
   * 执行磷酸化分析（主入口）
   */
  async analyze(params) {
    try {
      // 验证参数
      this.validateParams(params);
      
      // 如果是综合分析，直接调用综合分析方法
      if (params.function === 'comprehensive') {
        return await this.comprehensiveAnalyze(params);
      }
      
      // 如果启用了 Plumber API，等待健康检查完成
      if (this.plumberAPIEnabled) {
        await this.healthCheckPromise;
      }
      
      // 优先使用 Plumber API
      if (this.plumberAPIEnabled && this.plumberAPIAvailable) {
        try {
          console.log('使用 Plumber API 执行分析...');
          return await this.analyzeViaPlumber(params);
        } catch (apiError) {
          console.warn('Plumber API 调用失败，切换到命令行模式:', apiError.message);
          // 标记 API 不可用，后续请求直接使用命令行
          this.plumberAPIAvailable = false;
        }
      }
      
      // 使用命令行模式
      console.log('使用命令行模式执行分析...');
      return await this.analyzeViaCommand(params);
      
    } catch (error) {
      console.error('PhosphoService error:', error);
      
      // 返回友好的错误信息
      if (error.code === 'ENOENT') {
        throw new Error('找不到R脚本或Rscript命令，请确保R已正确安装');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('分析超时，请稍后重试');
      } else {
        throw error;
      }
    }
  }

  /**
   * 执行单个分析（避免递归调用）
   */
  async executeSingleAnalysis(params) {
    try {
      // 验证参数
      this.validateParams(params);
      
      console.log('=== SINGLE ANALYSIS EXECUTION ===');
      console.log(`Analysis Type: ${params.function}`);
      console.log(`Gene: ${params.gene}`);
      
      // 使用主分析方法，但确保不是综合分析（避免递归）
      if (params.function === 'comprehensive') {
        throw new Error('不能在单个分析中调用综合分析');
      }
      
      return await this.analyze(params);
      
    } catch (error) {
      console.error('Single analysis error:', error.message);
      throw error;
    }
  }

  /**
   * 综合分析 - 执行所有分析类型
   */
  async comprehensiveAnalyze(params) {
    console.log('=== COMPREHENSIVE ANALYSIS START ===');
    console.log('Gene:', params.gene);
    
    // 如果 Plumber API 可用，直接调用综合分析端点
    if (this.plumberAPIEnabled && this.plumberAPIAvailable) {
      try {
        return await this.analyzeViaPlumber({
          ...params,
          function: 'comprehensive'
        });
      } catch (error) {
        console.warn('Plumber API comprehensive 调用失败，使用批量调用模式:', error.message);
      }
    }
    
    // 手动执行所有分析（原有逻辑）
    const analysisTypes = [
      { name: 'query', description: '磷酸化位点查询' },
      { name: 'boxplot_TvsN', description: '肿瘤vs正常组织' },
      { name: 'boxplot_Risk', description: '风险分层分析' },
      { name: 'boxplot_Gender', description: '性别差异分析' },
      { name: 'boxplot_Age', description: '年龄分组分析' },
      { name: 'boxplot_Location', description: '肿瘤位置分析' },
      { name: 'boxplot_WHO', description: 'WHO分级分析' },
      { name: 'boxplot_Mutation', description: '突变类型分析' },
      { name: 'survival', description: '生存分析' }
    ];

    const results = {
      status: 'success',
      message: `${params.gene}基因综合分析完成`,
      gene: params.gene,
      timestamp: new Date().toISOString(),
      analyses: {},
      summary: {
        total: analysisTypes.length,
        successful: 0,
        failed: 0,
        warnings: 0
      },
      data: null
    };

    // 首先执行query分析获取可用的磷酸化位点
    let availableSites = [];
    try {
      console.log(`先执行query分析获取 ${params.gene} 的磷酸化位点...`);
      const queryResult = await this.executeSingleAnalysis({
        function: 'query',
        gene: params.gene
      });
      
      if (queryResult.status === 'success' && queryResult.data && queryResult.data.length > 0) {
        availableSites = queryResult.data.map(site => site.PhosphoSites || site.Site).filter(s => s);
        console.log(`找到 ${availableSites.length} 个磷酸化位点:`, availableSites.slice(0, 3));
        results.data = queryResult.data;
        results.analyses['query'] = {
          ...queryResult,
          description: '磷酸化位点查询'
        };
        results.summary.successful++;
      } else {
        console.log('Query分析失败，将使用基因名作为默认位点');
        availableSites = [params.gene];
        results.summary.warnings++;
      }
    } catch (error) {
      console.log('Query分析出错:', error.message);
      availableSites = [params.gene];
    }

    // 选择第一个可用的磷酸化位点进行boxplot分析
    const defaultSite = availableSites.length > 0 ? availableSites[0] : params.gene;
    console.log(`使用磷酸化位点进行箱线图分析: ${defaultSite}`);

    // 并行执行其余分析
    const remainingAnalysisTypes = analysisTypes.filter(a => a.name !== 'query');
    const analysisPromises = remainingAnalysisTypes.map(async (analysis) => {
      try {
        console.log(`执行分析: ${analysis.name} for ${params.gene}`);
        const analysisParams = {
          function: analysis.name,
          gene: params.gene
        };
        
        // 对于boxplot分析，使用找到的第一个磷酸化位点
        if (analysis.name.startsWith('boxplot_')) {
          analysisParams.site = defaultSite;
        }
        
        const result = await this.executeSingleAnalysis(analysisParams);
        
        results.analyses[analysis.name] = {
          ...result,
          description: analysis.description
        };
        
        if (result.status === 'success') {
          results.summary.successful++;
        } else if (result.status === 'warning') {
          results.summary.warnings++;
        } else {
          results.summary.failed++;
        }
        
      } catch (error) {
        console.error(`分析失败 ${analysis.name}:`, error.message);
        results.analyses[analysis.name] = {
          status: 'error',
          message: error.message,
          description: analysis.description
        };
        results.summary.failed++;
      }
    });

    // 等待所有分析完成
    await Promise.all(analysisPromises);
    
    // 更新总体状态
    if (results.summary.successful === 0) {
      results.status = 'error';
      results.message = `${params.gene}基因综合分析失败`;
    } else if (results.summary.failed > 0 || results.summary.warnings > 0) {
      results.status = 'warning';
      results.message = `${params.gene}基因综合分析部分完成 (成功: ${results.summary.successful}, 失败: ${results.summary.failed}, 警告: ${results.summary.warnings})`;
    }
    
    console.log(`=== COMPREHENSIVE ANALYSIS COMPLETE ===`);
    console.log(`${params.gene}: 成功 ${results.summary.successful}, 失败 ${results.summary.failed}, 警告 ${results.summary.warnings}`);
    
    return results;
  }

  /**
   * 获取支持的分析类型列表
   */
  getSupportedFunctions() {
    return this.supportedFunctions.map(func => {
      const descriptions = {
        'query': '磷酸化位点查询',
        'boxplot_TvsN': '肿瘤vs正常组织分析',
        'boxplot_Risk': '风险分层分析',
        'boxplot_Gender': '性别差异分析',
        'boxplot_Age': '年龄相关分析',
        'boxplot_Location': '肿瘤位置分析',
        'boxplot_WHO': 'WHO分级分析',
        'boxplot_Mutation': '突变状态分析',
        'survival': '生存分析',
        'comprehensive': '综合分析（所有分析类型）'
      };
      
      return {
        name: func,
        description: descriptions[func] || func
      };
    });
  }

  /**
   * 解析用户请求，提取分析参数
   */
  parseUserRequest(message, geneFromAI) {
    const lowerMsg = message.toLowerCase();
    
    // 基因名称 - 优先使用AI提取的基因名
    const gene = geneFromAI || this.extractGene(message);
    
    // 分析类型匹配
    let funcName = null;
    
    if (lowerMsg.includes('查询') || lowerMsg.includes('位点')) {
      funcName = 'query';
    } else if (lowerMsg.includes('肿瘤') && lowerMsg.includes('正常')) {
      funcName = 'boxplot_TvsN';
    } else if (lowerMsg.includes('风险')) {
      funcName = 'boxplot_Risk';
    } else if (lowerMsg.includes('性别')) {
      funcName = 'boxplot_Gender';
    } else if (lowerMsg.includes('年龄')) {
      funcName = 'boxplot_Age';
    } else if (lowerMsg.includes('位置')) {
      funcName = 'boxplot_Location';
    } else if (lowerMsg.includes('who') || lowerMsg.includes('分级')) {
      funcName = 'boxplot_WHO';
    } else if (lowerMsg.includes('突变')) {
      funcName = 'boxplot_Mutation';
    } else if (lowerMsg.includes('生存')) {
      funcName = 'survival';
    } else if (lowerMsg.includes('综合') || lowerMsg.includes('全面') || lowerMsg.includes('所有')) {
      funcName = 'comprehensive';
    }
    
    return { gene, function: funcName };
  }

  /**
   * 从文本中提取基因名称
   */
  extractGene(text) {
    // 常见的GIST相关基因
    const commonGenes = ['KIT', 'PDGFRA', 'SDH', 'SDHA', 'SDHB', 'SDHC', 'SDHD', 
                        'NF1', 'BRAF', 'TP53', 'RB1', 'PTEN', 'CDKN2A'];
    
    for (const gene of commonGenes) {
      if (text.toUpperCase().includes(gene)) {
        return gene;
      }
    }
    
    // 尝试匹配其他格式的基因名
    const geneMatch = text.match(/\b[A-Z][A-Z0-9]{1,}[0-9]*\b/);
    return geneMatch ? geneMatch[0] : null;
  }
}

// 导出单例
export default new PhosphoService();