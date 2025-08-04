// 测试环境变量
console.log('=== 环境变量测试 ===');
console.log('PLUMBER_API_ENABLED:', process.env.PLUMBER_API_ENABLED);
console.log('PLUMBER_API_URL:', process.env.PLUMBER_API_URL);
console.log('类型:', typeof process.env.PLUMBER_API_ENABLED);
console.log('是否等于 "true":', process.env.PLUMBER_API_ENABLED === 'true');

// 加载 .env 文件
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

console.log('\n=== 加载 .env 后 ===');
console.log('PLUMBER_API_ENABLED:', process.env.PLUMBER_API_ENABLED);
console.log('PLUMBER_API_URL:', process.env.PLUMBER_API_URL);
console.log('是否等于 "true":', process.env.PLUMBER_API_ENABLED === 'true');