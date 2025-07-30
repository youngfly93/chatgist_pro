import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

class PhosphoService {
  constructor() {
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
      'survival',
      'comprehensive'
    ];
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
   * 构建R命令
   */
  buildCommand(params) {
    const { function: funcName, gene, site, cutoff, survtype } = params;

    let cmd = `Rscript --vanilla "${this.rScriptPath}" --function="${funcName}" --gene="${gene}"`;
    
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
   * 执行磷酸化分析
   */
  async analyze(params) {
    try {
      // 验证参数
      this.validateParams(params);
      
      // 如果是综合分析，直接调用API而不是R脚本
      if (params.function === 'comprehensive') {
        return await this.comprehensiveAnalyze(params);
      }
      
      // 构建命令
      const command = this.buildCommand(params);
      
      console.log('=== PHOSPHO SERVICE EXECUTION ===');
      console.log(`R Script Path: ${this.rScriptPath}`);
      console.log(`Working Directory: ${this.workingDir}`);
      console.log(`Command: ${command}`);
      console.log(`Parameters:`, params);
      
      // 检查文件是否存在
      const fs = await import('fs');
      const scriptExists = fs.existsSync(this.rScriptPath);
      const workDirExists = fs.existsSync(this.workingDir);
      console.log(`Script exists: ${scriptExists}`);
      console.log(`Working dir exists: ${workDirExists}`);
      
      // 执行R脚本
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workingDir,
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large plots
        timeout: 60000 // 60秒超时
      });
      
      console.log('=== R SCRIPT EXECUTION COMPLETE ===');
      
      if (stderr) {
        console.log('R script stderr:', stderr);
      }
      
      console.log('R script stdout length:', stdout.length);
      console.log('R script stdout (first 500 chars):', stdout.substring(0, 500));
      
      // 解析JSON结果
      let result;
      try {
        result = JSON.parse(stdout);
        console.log('Successfully parsed JSON result');
      } catch (parseError) {
        console.error('Failed to parse R output as JSON');
        console.error('Parse error:', parseError.message);
        console.error('Full stdout:', stdout);
        throw new Error('R脚本返回了无效的JSON格式');
      }
      
      // 检查执行状态
      if (result.status === 'error') {
        throw new Error(result.message || '分析执行失败');
      }
      
      return result;
      
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
      
      // 构建命令
      const command = this.buildCommand(params);
      
      console.log('=== SINGLE ANALYSIS EXECUTION ===');
      console.log(`Analysis Type: ${params.function}`);
      console.log(`Gene: ${params.gene}`);
      console.log(`Command: ${command}`);
      
      // 执行R脚本
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workingDir,
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large plots
        timeout: 60000 // 60秒超时
      });
      
      if (stderr) {
        console.log('R script stderr (single):', stderr.substring(0, 500));
      }
      
      // 解析JSON结果
      let result;
      try {
        result = JSON.parse(stdout);
        console.log(`Single analysis completed: ${params.function} - ${result.status}`);
      } catch (parseError) {
        console.error('Failed to parse R output as JSON (single analysis)');
        throw new Error('R脚本返回了无效的JSON格式');
      }
      
      // 检查执行状态
      if (result.status === 'error') {
        throw new Error(result.message || '分析执行失败');
      }
      
      return result;
      
    } catch (error) {
      console.error('Single analysis error:', error.message);
      
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
   * 综合分析 - 执行所有分析类型
   */
  async comprehensiveAnalyze(params) {
    console.log('=== COMPREHENSIVE ANALYSIS START ===');
    console.log('Gene:', params.gene);
    
    // 获取所有支持的分析类型（除了综合分析本身）
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
      data: null // 综合分析的主要数据来自query结果
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

    // 并行执行其余分析（除了query，已经执行过了）
    const remainingAnalysisTypes = analysisTypes.filter(a => a.name !== 'query');
    const analysisPromises = remainingAnalysisTypes.map(async (analysis) => {
      try {
        console.log(`执行分析: ${analysis.name} for ${params.gene}`);
        // 直接调用单个分析，避免递归
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