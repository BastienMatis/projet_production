import express from 'express';
import {
  insertStudentDBInfo,
  getStudentConnection,
  deleteStudentConnection,
  getStudentConnectionByUserId
} from '../controllers/studentConnectionController';

const router = express.Router();

router.post('/', insertStudentDBInfo);
router.get('/:userId', getStudentConnectionByUserId);
router.delete('/:id', deleteStudentConnection);

export default router;
