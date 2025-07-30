// 测试服务器启动
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// 测试路由
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

const PORT = 8000;
const HOST = '0.0.0.0';

console.log('正在启动测试服务器...');
console.log('环境变量:');
console.log('- USE_KIMI:', process.env.USE_KIMI);
console.log('- KIMI_API_KEY exists:', !!process.env.KIMI_API_KEY);

app.listen(PORT, HOST, () => {
  console.log(`\n✓ 测试服务器成功启动在 ${HOST}:${PORT}`);
  console.log('按 Ctrl+C 停止服务器');
}).on('error', (err) => {
  console.error('\n✗ 服务器启动失败:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.log(`端口 ${PORT} 已被占用，可能原因：`);
    console.log('1. 另一个服务正在使用该端口');
    console.log('2. 之前的服务未正确关闭');
    console.log('\n解决方案：');
    console.log('1. 查找占用端口的进程: netstat -ano | findstr :8000');
    console.log('2. 结束进程: taskkill /PID <进程ID> /F');
  }
});