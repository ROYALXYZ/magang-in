import express from 'express';
import {
    getAllUsers, updateUser, deleteUser,
    getPendingMitra, approveMitra, rejectMitra,
    getAdminStats, getRecentActivity, getUserRegistrationTrend,
    getMonthlyGrowth, getTopIndustries, getApplicationInsights,
    getAllInternshipsAdmin, toggleInternshipStatus,
    createArticle, deleteArticle
} from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Mengamankan seluruh rute di bawah agar HANYA ADMIN yang bisa masuk
router.use(verifyToken, authorizeRole('admin'));

// Dashboard Stats
router.get('/stats', getAdminStats);
router.get('/activity', getRecentActivity);
router.get('/trend/users', getUserRegistrationTrend);
router.get('/report/monthly-growth', getMonthlyGrowth);
router.get('/report/top-industries', getTopIndustries);
router.get('/report/application-insights', getApplicationInsights);

// Manajemen Pengguna
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Verifikasi Mitra
router.get('/mitra', getPendingMitra);
router.post('/mitra/:id/approve', approveMitra);
router.post('/mitra/:id/reject', rejectMitra);

// Kelola Lowongan (admin view)
router.get('/internships', getAllInternshipsAdmin);
router.patch('/internships/:id/status', toggleInternshipStatus);

// Manajemen Artikel
router.post('/articles', createArticle);
router.delete('/articles/:id', deleteArticle);

export default router;
