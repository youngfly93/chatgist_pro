import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
