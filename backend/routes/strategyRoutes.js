import express from 'express';
import { 
  getStrategies, 
  getStrategyById, 
  createStrategy, 
  updateStrategy, 
  deleteStrategy, 
  approveStrategy 
} from '../controllers/strategyController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Any authenticated user can read approved strategies or submit new ones
router.route('/')
  .get(verifyToken, getStrategies)
  .post(verifyToken, createStrategy);

router.route('/:id')
  .get(verifyToken, getStrategyById)
  // Only admins can update, delete, or specifically approve
  .put(verifyToken, requireAdmin, updateStrategy)
  .delete(verifyToken, requireAdmin, deleteStrategy);

router.patch('/:id/approve', verifyToken, requireAdmin, approveStrategy);

export default router;
