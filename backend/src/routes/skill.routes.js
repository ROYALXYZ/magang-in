import express from 'express';
import { getAllSkills, declareSkill, getMySkills, syncSkills, deleteUserSkill } from '../controllers/skill.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllSkills);
router.post('/declare', verifyToken, declareSkill);
router.get('/my-skills', verifyToken, getMySkills);
router.post('/sync', verifyToken, syncSkills);
router.delete('/:skillId', verifyToken, deleteUserSkill);



export default router;
