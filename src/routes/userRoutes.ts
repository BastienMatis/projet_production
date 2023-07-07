import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';

import { loginAsAdmin } from '../controllers/authController';
import { connectToStudent } from '../controllers/sshController';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Auth routes
router.post('/loginAsAdmin', (req, res) => {
  loginAsAdmin(req, res);
});

// Student connection
router.post('/connectToStudent', async (req, res) => {
  console.log("lskdjflk");
  await connectToStudent(req, res);
});

export default router;
