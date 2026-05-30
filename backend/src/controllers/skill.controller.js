import prisma from '../config/db.js';

// Get list of all available master skills
export const getAllSkills = async (req, res) => {
  try {
    const skills = await prisma.skill.findMany();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Declare user skills
export const declareSkill = async (req, res) => {
  try {
    const { skillId, proficiency } = req.body;
    const userId = req.userId; // From verifyToken middleware

    // Check if skill exists
    const skill = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    // Upsert user skill (update if exists, create if not)
    const userSkill = await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
      update: {
        proficiency,
      },
      create: {
        userId,
        skillId,
        proficiency,
      },
    });

    res.status(201).json({ message: 'Skill declared successfully', data: userSkill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user's skills
export const getMySkills = async (req, res) => {
  try {
    const userId = req.userId;
    const mySkills = await prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: true,
      },
    });
    res.json(mySkills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sync multiple skills (Strict mode: only existing master skills)
export const syncSkills = async (req, res) => {
  try {
    const { skillIds } = req.body; // Expecting array of Skill IDs
    const userId = req.userId;

    if (!Array.isArray(skillIds)) {
      return res.status(400).json({ message: 'skillIds must be an array' });
    }

    // 1. Verify skills exist in master table
    const masterSkills = await prisma.skill.findMany({
      where: { id: { in: skillIds } }
    });

    if (masterSkills.length !== skillIds.length) {
      console.warn('Some skill IDs provided do not exist in master table');
    }

    // 2. Clear old skills & Insert new ones for this user
    await prisma.userSkill.deleteMany({ where: { userId } });

    const userSkillOperations = masterSkills.map(skill => 
      prisma.userSkill.create({
        data: {
          userId,
          skillId: skill.id,
          proficiency: 'Intermediate'
        }
      })
    );
    await Promise.all(userSkillOperations);

    res.json({ message: 'Skills synced successfully', count: masterSkills.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a single skill from user
export const deleteUserSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.userId;

    await prisma.userSkill.deleteMany({
      where: {
        userId,
        skillId
      }
    });

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




