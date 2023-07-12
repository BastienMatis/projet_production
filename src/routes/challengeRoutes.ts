import express from 'express';
import {
  getAllChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getChallengeById
} from '../controllers/challengeController';
//import { SSHClient } from '../controllers/sshController';

const router = express.Router();

router.get('/', getAllChallenges);
router.post('/', createChallenge);
router.put('/:id', updateChallenge);
router.delete('/:id', deleteChallenge);
router.get('/:id', getChallengeById);

export default router;
