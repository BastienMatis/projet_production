import express from 'express';
import {
  connectToStudentDB,
  getStudentConnections,
  deleteStudentConnection,
} from '../controllers/studentConnectionController';
import { SSHClient } from '../controllers/sshController';

const router = express.Router();

router.post('/', connectToStudentDB);
router.get('/:userId', getStudentConnections);
router.delete('/:id', deleteStudentConnection);

export default router;
