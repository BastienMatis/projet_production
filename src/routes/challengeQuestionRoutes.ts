import express from 'express';
import {
  getAllChallengeQuestions,
  createChallengeQuestion,
  updateChallengeQuestion,
  deleteChallengeQuestion,
  runChallengeTest
} from '../controllers/challengeQuestionController';

const router = express.Router();

router.get('/:challengeId', getAllChallengeQuestions);
router.post('/', createChallengeQuestion);
router.put('/:id', updateChallengeQuestion);
router.delete('/:id', deleteChallengeQuestion);
router.post('/test/:challengeId', runChallengeTest);

export default router;
