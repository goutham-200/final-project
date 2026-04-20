import express from 'express';
import { 
  getStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  linkStudentAccount
} from '../controllers/studentController.js';
import { verifyToken, requireTeacher } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, requireTeacher);

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

router.patch('/:id/link', linkStudentAccount);

export default router;

