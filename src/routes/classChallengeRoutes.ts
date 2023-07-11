import express from 'express';
import {
  addClassChallenge,
  getClassChallengeById,
  deleteClassChallenge,
} from '../controllers/classChallengeController';

const router = express.Router();

router.post('/', addClassChallenge);
router.get('/:classId/:challengeId', getClassChallengeById);
router.delete('/:classId/:challengeId', deleteClassChallenge);

export default router;
