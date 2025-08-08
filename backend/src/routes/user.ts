import { Router } from 'express';
import {
  login, logout, register, refreshAccessToken, getCurrentUser,
} from '../controllers/auth';
import { userValidator } from '../middlewares/validators';
import auth from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.post('/register', userValidator, register);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);

export default router;
