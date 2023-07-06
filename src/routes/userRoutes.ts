import express from 'express';
   import {
     getAllUsers,
     getUserById,
     createUser,
     updateUser,
     deleteUser,
   } from '../controllers/userController';

import { loginAsAdmin } from '../controllers/authController';

   const router = express.Router();

   router.get('/', getAllUsers);
   router.get('/:id', getUserById);
   router.post('/', createUser);
   router.put('/:id', updateUser);
   router.delete('/:id', deleteUser);

   // auth routes
   router.post('/loginAsAdmin', (req) => {
      const { username, password } = req.body;
      loginAsAdmin(username, password);
    });

   export default router;