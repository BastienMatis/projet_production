import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import  authRoutes from "./routes/authRoutes";
import { DB } from './utility/DB';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/auth', authRoutes);

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