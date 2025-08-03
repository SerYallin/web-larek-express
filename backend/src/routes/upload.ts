import { Router } from 'express';
import uploadFile from '../controllers/upload';
import fileMiddleware from '../middlewares/file';

const router = Router();

router.post('/', fileMiddleware.single('file'), uploadFile);

export default router;
