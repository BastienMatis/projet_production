import express from 'express';
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController';

const router = express.Router();

router.get('/', getAllStudents);
router.post('/', createStudent);
router.put('/:userId', updateStudent);
router.delete('/:userId', deleteStudent);

export default router;
