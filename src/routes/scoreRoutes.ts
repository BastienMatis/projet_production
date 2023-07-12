import express from 'express';
import { createScore, getScoresByStudent, deleteScore } from '../controllers/scoreController';
//import { SSHClient } from '../controllers/sshController';

const router = express.Router();

router.post('/', async (req, res) => {
  const { studentId, challengeId } = req.body;
  try {
    const score = await createScore(studentId, challengeId);
    res.json(score);
  } catch (error) {
    console.error('Error creating score:', error);
    res.status(500).json({ message: 'Error creating score.' });
  }
});

router.get('/student/:studentId', getScoresByStudent);
router.delete('/:id', deleteScore);

export default router;
