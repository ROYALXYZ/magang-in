import express from 'express';
import multer from 'multer';
import {
  scanCV,
  matchInternship,
  predictMatch,
  normalizeSkills,
  getAISkills,
  getAIHealth
} from '../controllers/ai-gateway.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Multer storage in memory for forwarding to AI
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Public endpoints
router.get('/health', getAIHealth);
router.get('/skills', getAISkills);

// Protected endpoints (require login)
router.post('/scan-cv', verifyToken, upload.single('file'), scanCV);
router.post('/match-internship', verifyToken, matchInternship);
router.post('/predict', verifyToken, predictMatch);
router.post('/normalize-skills', verifyToken, normalizeSkills);

export default router;
