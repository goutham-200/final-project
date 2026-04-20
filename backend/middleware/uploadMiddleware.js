import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itsre/students',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit per requirements
});
