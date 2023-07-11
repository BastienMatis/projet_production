import express from 'express';
import {
  insertStudentDBInfo,
  getStudentConnection,
  deleteStudentConnection,
} from '../controllers/studentConnectionController';

const router = express.Router();

router.post('/', insertStudentDBInfo);
router.delete('/:id', deleteStudentConnection);

export default router;
