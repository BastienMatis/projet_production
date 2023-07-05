import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
  res.send('test');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});