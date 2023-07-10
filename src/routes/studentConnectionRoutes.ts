import express from 'express';
import {
  connectToStudent,
  getStudentConnections,
  deleteStudentConnection,
} from '../controllers/studentConnectionController';

const router = express.Router();

router.post('/', connectToStudent);
router.get('/:userId', getStudentConnections);
router.delete('/:id', deleteStudentConnection);

export default router;
