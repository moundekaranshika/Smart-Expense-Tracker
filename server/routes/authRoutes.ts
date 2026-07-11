import { Router } from 'express';
import {
  register,
  login,
  getSecurityQuestion,
  resetPassword,
  changePassword
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password-question', getSecurityQuestion);
router.post('/reset-password', resetPassword);

// Protected Auth action
router.put('/change-password', protect as any, changePassword as any);

export default router;
