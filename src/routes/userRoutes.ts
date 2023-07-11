import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';

import { loginAsAdmin } from '../controllers/authController';
import { SSHClient } from '../controllers/sshController';

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
  const { host, username } = req.body;
  const sshCli = new SSHClient();
  sshCli.connect({ host: host, port: 22, username: username, privateKeyPath : '../secrets/signing'}, res);
});

export default router;
