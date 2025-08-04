import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import chatV2Router from './routes/chat_v2.js';
import geneRouter from './routes/gene.js';
import proxyRouter from './routes/proxy.js';
import phosphoRouter from './routes/phospho.js';
import singlecellRouter from './routes/singlecell.js';
import proteomicsRouter from './routes/proteomics.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/chat/v1', chatRouter); // 旧版本（保留但不使用）
app.use('/api/chat', chatV2Router); // Tool Calling 版本（默认）
app.use('/api/chat/v2', chatV2Router); // 兼容性路由
app.use('/api/gene', geneRouter);
app.use('/api/proxy', proxyRouter);
app.use('/api/phospho', phosphoRouter);
app.use('/api/singlecell', singlecellRouter);
app.use('/api/proteomics', proteomicsRouter);

const PORT = process.env.PORT || 8000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

console.log('Starting backend server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);
console.log('Host:', HOST);

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend running on ${HOST}:${PORT}`);
  console.log(`📡 API endpoints available:`);
  console.log(`   - /api/chat (Tool Calling)`);
  console.log(`   - /api/chat/v2 (Tool Calling)`);
  console.log(`   - /api/gene`);
  console.log(`   - /api/proxy`);
  console.log(`   - /api/phospho`);
  console.log(`   - /api/singlecell`);
  console.log(`   - /api/proteomics`);
});