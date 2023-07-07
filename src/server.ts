import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import { DB } from './utility/DB';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
  origin: ['http://localhost:8080']
}));
app.use(express.json());

app.use('/api/users', userRoutes);

// Déplacez cette ligne après l'initialisation des routes
DB.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
  });