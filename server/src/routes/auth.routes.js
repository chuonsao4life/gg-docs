import { Router } from 'express';
import { changePassword, forgotPassword, getMe, login, register, updateMe } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/me/password', changePassword);

export default router;
