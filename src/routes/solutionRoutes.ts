import express from 'express';
import {
  createSolution,
  getSolutionById,
  updateSolution,
  deleteSolution,
} from '../controllers/solutionController';
import { SSHClient } from '../controllers/sshController';

const router = express.Router();

router.post('/', createSolution);
router.get('/:id', getSolutionById);
router.put('/:id', updateSolution);
router.delete('/:id', deleteSolution);
router.get('/forQuestions/:questionIds', getSolutionByQuestionIds);

export default router;
