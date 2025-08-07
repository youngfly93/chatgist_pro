// 完整的单细胞分析测试 - 启动Plumber API并测试功能
import { spawn } from 'child_process';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let plumberProcess = null;

async function startPlumberAPI() {
  console.log('=== 启动 Single-cell Plumber API ===');
  
  return new Promise((resolve, reject) => {
    const rScriptPath = 'E:\\R-4.4.1\\bin\\Rscript.exe';
    const startScript = join(__dirname, 'start_singlecell_simple.R');
    
    console.log('启动命令:', rScriptPath, startScript);
    
    plumberProcess = spawn(rScriptPath, [startScript], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    plumberProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('Plumber输出:', text.trim());
      
      // 检查是否启动成功
      if (text.includes('Running plumber API') || text.includes('Starting server to listen')) {
        console.log('✅ Plumber API 启动成功');
        setTimeout(resolve, 2000); // 等待2秒确保完全启动
      }
    });
    
    plumberProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.log('Plumber错误:', text.trim());
    });
    
    plumberProcess.on('close', (code) => {
      console.log('Plumber API 进程结束，代码:', code);
      if (code !== 0 && code !== null) {
        reject(new Error(`Plumber API 启动失败，代码: ${code}`));
      }
    });
    
    plumberProcess.on('error', (error) => {
      console.error('Plumber API 启动错误:', error);
      reject(error);
    });
    
    // 10秒超时
    setTimeout(() => {
      if (plumberProcess && !plumberProcess.killed) {
        console.log('等待Plumber API启动超时，继续测试...');
        resolve();
      }
    }, 10000);
  });
}

async function testPlumberAPI() {
  console.log('=== 测试 Plumber API 功能 ===');
  
  const baseURL = 'http://localhost:8003';
  
  try {
    // 1. 健康检查
    console.log('1. 健康检查...');
    const healthResponse = await axios.get(`${baseURL}/singlecell/health`, { timeout: 5000 });
    
    if (healthResponse.status === 200) {
      console.log('✅ 健康检查通过');
      console.log('可用数据集:', healthResponse.data.available_datasets);
    }
    
    // 2. 基因查询
    console.log('\\n2. 测试基因查询 (KIT)...');
    const queryResponse = await axios.post(`${baseURL}/singlecell/query`, {
      gene: 'KIT'
    }, { timeout: 60000 });
    
    if (queryResponse.status === 200) {
      console.log('✅ 基因查询成功');
      console.log('数据集:', queryResponse.data.dataset);
      console.log('状态:', queryResponse.data.status);
      console.log('细胞类型数量:', queryResponse.data.cell_types ? queryResponse.data.cell_types.length : 0);
    }
    
    // 3. 小提琴图
    console.log('\\n3. 测试小提琴图 (KIT)...');
    const violinResponse = await axios.post(`${baseURL}/singlecell/violin`, {
      gene: 'KIT'
    }, { timeout: 120000 });
    
    if (violinResponse.status === 200) {
      console.log('✅ 小提琴图生成成功');
      console.log('状态:', violinResponse.data.status);
      console.log('图片数据长度:', violinResponse.data.image_base64 ? violinResponse.data.image_base64.length : 0);
      console.log('数据集:', violinResponse.data.dataset);
    }
    
    console.log('\\n✅ 所有 Plumber API 测试通过！');
    return true;
    
  } catch (error) {
    console.log('❌ Plumber API 测试失败:', error.message);
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
    return false;
  }
}

async function testToolService() {
  console.log('\\n=== 测试工具服务集成 ===');
  
  // 重新导入服务（确保使用新的环境变量）
  delete require.cache[require.resolve('./backend/src/services/singleCellService.js')];
  delete require.cache[require.resolve('./backend/src/services/toolService.js')];
  
  const singleCellService = (await import('./backend/src/services/singleCellService.js')).default;
  const toolService = (await import('./backend/src/services/toolService.js')).default;
  
  try {
    // 等待健康检查完成
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('测试工具服务调用 (KIT 小提琴图)...');
    const toolResult = await toolService.executeTool('singlecell_analysis', {
      function_type: 'violin_plot',
      gene: 'KIT',
      dataset: 'auto'
    });
    
    console.log('工具服务结果:');
    console.log('hasData:', toolResult.hasData);
    console.log('hasPlot:', toolResult.hasPlot);
    console.log('status:', toolResult.status);
    console.log('dataset:', toolResult.dataset);
    console.log('gene:', toolResult.gene);
    console.log('图片数据长度:', toolResult.image_base64 ? toolResult.image_base64.length : 0);
    
    if (toolResult.hasPlot && toolResult.image_base64) {
      console.log('✅ 工具服务集成测试成功！结果解析正确');
      return true;
    } else {
      console.log('❌ 工具服务集成测试失败：结果解析问题');
      return false;
    }
    
  } catch (error) {
    console.log('❌ 工具服务测试失败:', error.message);
    return false;
  }
}

async function cleanup() {
  console.log('\\n=== 清理资源 ===');
  if (plumberProcess && !plumberProcess.killed) {
    console.log('关闭 Plumber API 进程...');
    plumberProcess.kill('SIGTERM');
    
    // 等待进程关闭
    await new Promise((resolve) => {
      plumberProcess.on('close', resolve);
      setTimeout(resolve, 3000); // 3秒超时
    });
  }
  console.log('清理完成');
}

async function main() {
  try {
    console.log('=== 单细胞分析完整测试 ===\\n');
    
    // 启动 Plumber API
    await startPlumberAPI();
    
    // 测试 Plumber API
    const plumberSuccess = await testPlumberAPI();
    
    if (plumberSuccess) {
      // 测试工具服务集成
      const toolSuccess = await testToolService();
      
      if (toolSuccess) {
        console.log('\\n🎉 所有测试通过！单细胞分析功能修复成功！');
      } else {
        console.log('\\n⚠️ Plumber API 正常，但工具服务集成存在问题');
      }
    } else {
      console.log('\\n❌ Plumber API 测试失败');
    }
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  } finally {
    await cleanup();
    process.exit(0);
  }
}

// 处理进程退出
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

main();