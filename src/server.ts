import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import challengeRoutes from './routes/challengeRoutes';
import studentRoutes from './routes/studentRoutes';
import classRoutes from './routes/classRoutes';
import studentClassRoutes from './routes/studentClassRoutes';
import challengeQuestionRoutes from './routes/challengeQuestionRoutes';
import solutionRoutes from './routes/solutionRoutes';
import score from './routes/scoreRoutes';
import classChallengeRoutes from './routes/classChallengeRoutes';
import studentAnswerRoutes from './routes/studentAnswerRoutes';
import  authRoutes from "./routes/authRoutes";  
import studentConnectionRoutes from './routes/studentConnectionRoutes';
import { DB } from './utility/DB';
import cors from 'cors';
import { requestLogMiddleware } from "./utility/Logging/log.middleware";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
  origin: ['http://localhost:8080']
}));
app.use(express.json());

app.use(requestLogMiddleware('req'));

app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/studentClasses', studentClassRoutes);
app.use('/api/challengeQuestions', challengeQuestionRoutes);
app.use('/api/scores', score);
app.use('/api/solutions', solutionRoutes);
app.use('/api/classChallenges', classChallengeRoutes);
app.use('/api/studentAnswers', studentAnswerRoutes);
app.use('/api/studentConnection', studentConnectionRoutes);
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