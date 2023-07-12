import express from 'express';
import {
  addStudentAnswer,
  getStudentAnswerById,
  deleteStudentAnswer,
} from '../controllers/studentAnswerController';

const router = express.Router();

router.post('/', addStudentAnswer);
router.get('/:userId/:challengeQuestionId', getStudentAnswerById);
router.delete('/:userId/:challengeQuestionId', deleteStudentAnswer);

export default router;
