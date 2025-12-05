import express from 'express';
import promotionController from '../controllers/promotion-controller.js';
import adminMiddleware from '../middlewares/admin-middleware.js';

const router = express.Router();

router.get('/', promotionController.findAll);
router.post('/', adminMiddleware, promotionController.create);
router.put('/:id', adminMiddleware, promotionController.update);
router.delete('/:id', adminMiddleware, promotionController.delete);

export default router;
