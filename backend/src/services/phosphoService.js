import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

class PhosphoService {
  constructor() {
    // R脚本路径 - 根据实际部署调整
    // 注意：这里假设backend运行在 GIST_web - 副本/backend 目录
    // 使用演示脚本
    this.rScriptPath = path.resolve('../phospho_api_demo.R');
    this.workingDir = path.resolve('../');
    
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
      'survival'
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
    const { function: funcName, gene, cutoff, survtype } = params;

    let cmd = `Rscript --vanilla "${this.rScriptPath}" --function="${funcName}" --gene="${gene}"`;
    
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
        'survival': '生存分析'
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