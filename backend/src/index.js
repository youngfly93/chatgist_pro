import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import geneRouter from './routes/gene.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRouter);
app.use('/api/gene', geneRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));