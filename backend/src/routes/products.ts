import { Router } from 'express';
import { validateId, validateProduct, validateUpdateProduct } from '../middlewares/validators';
import {
  createProduct, getProducts, updateProduct, deleteProduct,
} from '../controllers/products';
import auth from '../middlewares/auth';

const router = Router();
router.get('/', getProducts);
router.post('/', auth, validateProduct, createProduct);
router.patch('/:productId', auth, validateId, validateUpdateProduct, updateProduct);
router.delete('/:productId', auth, validateId, deleteProduct);

export default router;
