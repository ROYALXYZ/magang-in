import express from 'express';
import multer from 'multer';
import path from 'path';
import { applyInternship, getMyApplications, updateApplication, deleteApplication } from '../controllers/application.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Memory storage — file di-upload ke cloud (Supabase) langsung, bukan disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file PDF dan gambar yang diperbolehkan.'));
    }
  }
});

// Hanya Pengguna yang bisa melamar
router.use(verifyToken, authorizeRole('pengguna'));

router.post('/apply', upload.single('attachmentFile'), applyInternship);
router.get('/my-applications', getMyApplications);
router.put('/:id', upload.single('attachmentFile'), updateApplication);
router.delete('/:id', deleteApplication);

export default router;
