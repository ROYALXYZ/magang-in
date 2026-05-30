import prisma from '../config/db.js';

// Get list of all internships
export const getAllInternships = async (req, res) => {
  try {
    const internships = await prisma.internship.findMany({
      where: {
        isClosed: false,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific internship details including roadmap
export const getInternshipDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        skills: {
          include: { skill: true },
        },
        roadmaps: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    res.json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- DIBAWAH INI ADALAH FUNGSI KHUSUS MITRA ---

// Buat Lowongan Baru
export const createInternship = async (req, res) => {
  try {
    const { title, companyName, location, type, duration, level, major, requirements, skills, benefits, description } = req.body;
    const mitraId = req.userId; // Dari token

    // Ambil nama perusahaan dari profil mitra jika tidak dikirim
    let company = companyName || req.body.company;
    if (!company) {
      const mitra = await prisma.user.findUnique({ where: { id: mitraId }, select: { name: true } });
      company = mitra?.name || 'Unknown Company';
    }

    const internship = await prisma.internship.create({
      data: {
        title, company, location, description,
        type, duration, level, major, requirements, skillsRequired: skills, benefits,
        mitraId
      }
    });

    res.status(201).json({ message: 'Lowongan berhasil dibuat', internship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Lowongan
export const updateInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const mitraId = req.userId;
    const { title, company, location, type, duration, level, major, requirements, skills, benefits, description, isClosed } = req.body;

    // Pastikan lowongan ini milik mitra yang login
    const existing = await prisma.internship.findFirst({ where: { id, mitraId } });
    if (!existing) return res.status(403).json({ message: 'Akses ditolak atau lowongan tidak ditemukan.' });

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (company !== undefined) updateData.company = company;
    if (location !== undefined) updateData.location = location;
    if (type !== undefined) updateData.type = type;
    if (duration !== undefined) updateData.duration = duration;
    if (level !== undefined) updateData.level = level;
    if (major !== undefined) updateData.major = major;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (skills !== undefined) updateData.skillsRequired = skills;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (description !== undefined) updateData.description = description;
    if (isClosed !== undefined) updateData.isClosed = isClosed;

    const internship = await prisma.internship.update({
      where: { id },
      data: updateData,
    });

    res.json({ message: 'Lowongan berhasil diperbarui', internship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Lowongan
export const deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const mitraId = req.userId;

    const existing = await prisma.internship.findFirst({ where: { id, mitraId } });
    if (!existing) return res.status(403).json({ message: 'Akses ditolak atau lowongan tidak ditemukan.' });

    await prisma.internship.delete({ where: { id } });
    res.json({ message: 'Lowongan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Master Data Handlers
export const getMasterLocations = async (req, res) => {
  try {
    const data = await prisma.masterLocation.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMasterMajors = async (req, res) => {
  try {
    const data = await prisma.masterMajor.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Lihat Data Lowongan Spesifik Milik Mitra Ini
export const getMyInternships = async (req, res) => {
  try {
    const mitraId = req.userId;
    const internships = await prisma.internship.findMany({
      where: { mitraId }
    });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lihat SEMUA Pelamar di semua lowongan milik Mitra
export const getAllMyApplicants = async (req, res) => {
  try {
    const mitraId = req.userId;

    const applications = await prisma.application.findMany({
      where: {
        internship: { mitraId }
      },
      include: {
        applicant: { select: { name: true, email: true, skills: { include: { skill: true } } } },
        internship: { select: { id: true, title: true, company: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lihat Pelamar Pada Spesifik Lowongan
export const getInternshipApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    const mitraId = req.userId;

    // Pastikan lowongan ini milik mitra yang sedang login
    const internship = await prisma.internship.findFirst({
      where: { id, mitraId },
      include: {
        applications: {
          include: { applicant: { select: { name: true, email: true, skills: { include: { skill: true } } } } }
        }
      }
    });

    if (!internship) return res.status(403).json({ message: 'Akses ditolak atau lowongan tidak ditemukan.' });

    res.json(internship.applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Terima / Tolak Pelamar
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; // 'accepted' atau 'rejected'

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });

    res.json({ message: `Pelamar telah di ${status === 'accepted' ? 'Terima' : 'Tolak'}`, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
