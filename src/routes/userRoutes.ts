import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';

import { loginAsAdmin } from '../controllers/authController';
import { connectToStudentDatabase } from '../utility/sshDBconfig';
import { insertSSHInfo } from '../controllers/sshController';
import { insertStudentDBInfo } from '../controllers/studentConnectionController';

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
router.post('/connectToStudent', (req, res) => {
  insertSSHInfo(req, res);
  insertStudentDBInfo(req, res);
  const studentId = 1; // ID de l'étudiant que vous souhaitez connecter à sa base de données
  connectToStudentDatabase(studentId)
  .then(() => {
    console.log('Connexion à la base de données de l\'étudiant établie avec succès');
    // Effectuez d'autres opérations nécessaires avec la base de données de l'étudiant
  })
  .catch((error) => {
    console.error('Erreur lors de la connexion à la base de données de l\'étudiant', error);
  });

});

export default router;
