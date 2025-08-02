import { Router } from  'express';
import { validateProduct}  from '../middlewares/validators';
import { createProduct, getProducts } from '../controllers/products';

const router = Router();
router.get('/', getProducts);
router.post('/', validateProduct, createProduct);

export default router;