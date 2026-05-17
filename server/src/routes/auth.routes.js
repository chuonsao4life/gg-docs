import { Router } from 'express';
import {
  changePassword,
  forgotPassword,
  getMe,
  login,
  logout,
  refresh,
  signup,
  updateMe,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/change-password', changePassword);
router.post('/forgot-password', forgotPassword);
router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/me/password', changePassword);

export default router;
