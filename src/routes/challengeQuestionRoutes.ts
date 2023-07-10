import express from 'express';
import {
  getAllChallengeQuestions,
  createChallengeQuestion,
  updateChallengeQuestion,
  deleteChallengeQuestion,
} from '../controllers/challengeQuestionController';

const router = express.Router();

router.get('/:challengeId', getAllChallengeQuestions);
router.post('/', createChallengeQuestion);
router.put('/:id', updateChallengeQuestion);
router.delete('/:id', deleteChallengeQuestion);

export default router;
