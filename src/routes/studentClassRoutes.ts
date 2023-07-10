import express from 'express';
import {
  addStudentToClass,
  removeStudentFromClass,
} from '../controllers/studentClassController';

const router = express.Router();

router.post('/', addStudentToClass);
router.delete('/:userId/:classId', removeStudentFromClass);

export default router;
