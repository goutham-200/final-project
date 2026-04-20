import express from 'express';
import { 
  generateRecommendations, 
  getStudentRecommendations, 
  rateRecommendation 
} from '../controllers/recommendationController.js';
import { verifyToken, requireTeacher } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, requireTeacher);

router.post('/generate', generateRecommendations);
router.get('/student/:studentId', getStudentRecommendations);
router.patch('/:id/rate', rateRecommendation);

export default router;
