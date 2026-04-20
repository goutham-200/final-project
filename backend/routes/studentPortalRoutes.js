import express from 'express';
import { getMyProfile, getMyRecommendations } from '../controllers/studentPortalController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/me', getMyProfile);
router.get('/recommendations', getMyRecommendations);

export default router;
