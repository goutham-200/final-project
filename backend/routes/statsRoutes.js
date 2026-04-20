import express from 'express';
import { getStats } from '../controllers/statsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(verifyToken);
router.get('/', getStats);

export default router;
