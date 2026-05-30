import axios from 'axios';
import prisma from '../config/db.js';

const AI_API_BASE = process.env.AI_API_URL || 'https://api.magangin.online';

/**
 * POST /api/ai/scan-cv
 * Upload CV file dan extract skills via AI service
 */
export const scanCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF or Image CV' });
    }

    // Kirim file ke AI service menggunakan FormData
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${AI_API_BASE}/api/extract-cv`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 second timeout
    });

    res.json({
      message: 'CV successfully scanned',
      extractedSkills: response.data.skills || response.data.extracted_skills || [],
      confidence: response.data.confidence || 0.85,
      raw: response.data,
    });
  } catch (error) {
    console.error('AI scan-cv error:', error.response?.data || error.message);
    res.status(502).json({
      message: 'Failed to connect to AI service',
      error: error.response?.data || error.message
    });
  }
};

/**
 * POST /api/ai/match-internship
 * Match user skills dengan lowongan magang via AI service
 */
export const matchInternship = async (req, res) => {
  try {
    const { userSkills } = req.body;
    const userId = req.userId;

    // Jika userSkills tidak dikirim, ambil dari database
    let skills = userSkills;
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      const dbSkills = await prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      });
      skills = dbSkills.map(us => us.skill.name);
    }

    if (!skills || skills.length === 0) {
      return res.status(400).json({ message: 'No skills found. Please declare your skills first.' });
    }

    // Ambil semua lowongan yang masih buka beserta skill-nya
    const internships = await prisma.internship.findMany({
      where: { isClosed: false },
      include: {
        skills: { include: { skill: true } },
      },
    });

    // Kirim ke AI service untuk matching
    // AI API sudah punya data lowongan built-in, hanya perlu kirim user skills
    // AI API menggunakan lowercase skill names
    const response = await axios.post(`${AI_API_BASE}/api/match`, {
      skills: skills.map(s => s.toLowerCase()),
    }, {
      timeout: 30000,
    });

    // Normalize response ke format yang frontend expect
    const rawResults = response.data.results || response.data.matches || [];
    const normalizedMatches = rawResults.map(result => {
      // Cari internship di DB berdasarkan title + company untuk dapat ID
      const intern = internships.find(i =>
        i.title === result.title && i.company === result.company
      );
      return {
        internshipId: intern?.id || result.id || '',
        title: result.title || '',
        company: result.company || '',
        matchScore: result.final_score
          ? Math.round(result.final_score * 100)
          : (result.coverage_score ? Math.round(result.coverage_score * 100) : (result.matchScore || 0)),
        missingSkills: result.missing_skills || result.missingSkills || [],
        matched_skills: result.matched_skills || [],
        match_category: result.match_category || null,
        coverage_score: result.coverage_score || null,
        final_score: result.final_score || null,
        similarity_score: result.model_score || null,
        roadmap_url: result.roadmap_url || null,
        location: result.location || intern?.location || null,
        role: result.role || null,
      };
    });

    res.json({
      message: 'AI Matching completed successfully',
      matches: normalizedMatches,
    });
  } catch (error) {
    console.error('AI match error:', error.response?.data || error.message);
    res.status(502).json({
      message: 'Failed to connect to AI service',
      error: error.response?.data || error.message
    });
  }
};

/**
 * POST /api/ai/predict
 * Predict match score antara user skills dan specific internship
 */
export const predictMatch = async (req, res) => {
  try {
    const { userSkills, internshipId } = req.body;
    const userId = req.userId;

    // Ambil user skills dari DB jika tidak dikirim
    let skills = userSkills;
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      const dbSkills = await prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      });
      skills = dbSkills.map(us => us.skill.name);
    }

    // Ambil required skills dari internship
    let requiredSkills = [];
    if (internshipId) {
      const internship = await prisma.internship.findUnique({
        where: { id: internshipId },
        include: { skills: { include: { skill: true } } },
      });
      if (!internship) {
        return res.status(404).json({ message: 'Internship not found' });
      }
      requiredSkills = internship.skills.map(s => s.skill.name);
    } else {
      requiredSkills = req.body.requiredSkills || [];
    }

    const response = await axios.post(`${AI_API_BASE}/api/predict`, {
      user_skills: skills.map(s => s.toLowerCase()),
      job_skills: requiredSkills.map(s => s.toLowerCase()),
    }, {
      timeout: 30000,
    });

    res.json({
      message: 'Prediction completed',
      prediction: response.data,
    });
  } catch (error) {
    console.error('AI predict error:', error.response?.data || error.message);
    res.status(502).json({
      message: 'Failed to connect to AI service',
      error: error.response?.data || error.message
    });
  }
};

/**
 * POST /api/ai/normalize-skills
 * Normalize skill names via AI service
 */
export const normalizeSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: 'Provide an array of skill names' });
    }

    const response = await axios.post(`${AI_API_BASE}/api/normalize`, {
      skills: skills.map(s => s.toLowerCase()),
    }, {
      timeout: 15000,
    });

    // Normalize response ke format konsisten
    // AI API returns: { normalized: ["react", "node"], unknown: ["postgre sql"], total_recognized, total_unknown }
    const rawData = response.data;
    const recognizedSkills = rawData.normalized || [];
    const unknownSkills = rawData.unknown || [];

    // Map original skills ke normalized versions
    const normalized = skills.map(original => {
      const lowerOriginal = original.toLowerCase().trim();
      // Cek apakah skill ini dikenali (ada di normalized list)
      const normalizedVersion = recognizedSkills.find(n =>
        lowerOriginal.includes(n) || n.includes(lowerOriginal)
      );
      if (normalizedVersion) {
        return { original, normalized: normalizedVersion };
      }
      // Jika tidak dikenali, kembalikan as-is
      return { original, normalized: original.toLowerCase() };
    });

    res.json({
      message: 'Skills normalized successfully',
      normalized,
      recognized: recognizedSkills,
      unknown: unknownSkills,
    });
  } catch (error) {
    console.error('AI normalize error:', error.response?.data || error.message);
    res.status(502).json({
      message: 'Failed to connect to AI service',
      error: error.response?.data || error.message
    });
  }
};

/**
 * GET /api/ai/skills
 * Get daftar skills dari AI service (master skills dari model AI)
 */
export const getAISkills = async (req, res) => {
  try {
    const response = await axios.get(`${AI_API_BASE}/api/skills`, {
      timeout: 15000,
    });

    res.json({
      message: 'AI skills fetched successfully',
      skills: response.data.skills || response.data,
    });
  } catch (error) {
    console.error('AI get-skills error:', error.response?.data || error.message);
    res.status(502).json({
      message: 'Failed to connect to AI service',
      error: error.response?.data || error.message
    });
  }
};

/**
 * GET /api/ai/health
 * Check health status dari AI service
 */
export const getAIHealth = async (req, res) => {
  try {
    const response = await axios.get(`${AI_API_BASE}/api/health`, {
      timeout: 10000,
    });

    res.json({
      message: 'AI service is healthy',
      status: response.data,
    });
  } catch (error) {
    console.error('AI health error:', error.response?.data || error.message);
    res.status(502).json({
      message: 'AI service is unreachable',
      error: error.response?.data || error.message
    });
  }
};
