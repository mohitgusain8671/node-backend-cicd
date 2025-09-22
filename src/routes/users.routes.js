import { deleteUserById, fetchAllUsers, fetchUserById, updateUserById } from '#controllers/users.controller.js';
import { authenticateToken, requireRole } from '#middleware/auth.middleware.js';
import { Router } from 'express';

const userRouter = Router();

userRouter.get('/', authenticateToken, requireRole(['admin']), fetchAllUsers);
userRouter.get('/:id', authenticateToken, fetchUserById);
userRouter.put('/:id', authenticateToken, updateUserById);
userRouter.delete('/:id', authenticateToken, requireRole(['admin']), deleteUserById);

export default userRouter;

