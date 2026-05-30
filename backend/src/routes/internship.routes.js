import express from 'express';
import {
  getAllInternships, getInternshipDetails,
  createInternship, updateInternship, deleteInternship,
  getMyInternships, getInternshipApplicants, getAllMyApplicants,
  updateApplicationStatus, getMasterLocations, getMasterMajors
} from '../controllers/internship.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Role Publik / Pengguna Biasa
router.get('/', getAllInternships);
router.get('/locations', getMasterLocations);
router.get('/majors', getMasterMajors);

// Role Mitra (Spesifik Perusahaan) — harus sebelum /:id
router.post('/', verifyToken, authorizeRole('mitra'), createInternship);
router.get('/mitra/my-postings', verifyToken, authorizeRole('mitra'), getMyInternships);
router.get('/mitra/all-applicants', verifyToken, authorizeRole('mitra'), getAllMyApplicants);
router.put('/mitra/:id', verifyToken, authorizeRole('mitra'), updateInternship);
router.delete('/mitra/:id', verifyToken, authorizeRole('mitra'), deleteInternship);
router.get('/:id/applicants', verifyToken, authorizeRole('mitra'), getInternshipApplicants);
router.patch('/applications/:applicationId', verifyToken, authorizeRole('mitra'), updateApplicationStatus);

// Public detail (harus terakhir karena /:id catch-all)
router.get('/:id', getInternshipDetails);

export default router;
