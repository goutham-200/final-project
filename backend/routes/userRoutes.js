import express from 'express';
import { getUsers, createUser, deleteUser, updateUser } from '../controllers/userController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.route('/')
  .get(getUsers)
  .post(createUser);
  
router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

export default router;
