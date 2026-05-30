import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

// --- User Management ---
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, name: true, role: true, provider: true, createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    res.json({ message: 'User berhasil diperbarui.', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      // 1. Hapus semua application yang dibuat user ini (sebagai applicant)
      await tx.application.deleteMany({ where: { userId: id } });

      // 2. Hapus semua UserSkill milik user
      await tx.userSkill.deleteMany({ where: { userId: id } });

      // 3. Hapus internship milik user (sebagai mitra) beserta relasinya
      const internships = await tx.internship.findMany({ where: { mitraId: id }, select: { id: true } });
      const internshipIds = internships.map(i => i.id);

      if (internshipIds.length > 0) {
        // Hapus applications ke internship milik mitra ini
        await tx.application.deleteMany({ where: { internshipId: { in: internshipIds } } });
        await tx.internshipSkill.deleteMany({ where: { internshipId: { in: internshipIds } } });
        await tx.roadmap.deleteMany({ where: { internshipId: { in: internshipIds } } });
        await tx.internship.deleteMany({ where: { mitraId: id } });
      }

      // 4. Hapus artikel milik user
      await tx.article.deleteMany({ where: { authorId: id } });

      // 5. Hapus user
      await tx.user.delete({ where: { id } });
    });

    res.json({ message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// --- Mitra Verification ---
// Get semua user yang request jadi mitra (status pending)
export const getPendingMitra = async (req, res) => {
  try {
    const mitras = await prisma.user.findMany({
      where: { mitraStatus: 'pending' },
      select: {
        id: true, email: true, name: true, role: true, provider: true, createdAt: true,
        mitraStatus: true, companyName: true, companyDesc: true,
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(mitras);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve mitra request
export const approveMitra = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });
    if (user.mitraStatus !== 'pending') return res.status(400).json({ message: 'User tidak memiliki request mitra pending.' });

    await prisma.user.update({
      where: { id },
      data: { role: 'mitra', mitraStatus: 'approved' }
    });

    res.json({ message: 'Mitra berhasil disetujui.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject mitra request
export const rejectMitra = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

    await prisma.user.update({
      where: { id },
      data: { role: 'pengguna', mitraStatus: 'rejected' }
    });

    res.json({ message: 'Request mitra ditolak.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin stats
export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalMitra, totalInternships, totalApplications, pendingApplications, pendingMitraRequests] = await Promise.all([
      prisma.user.count({ where: { role: 'pengguna' } }),
      prisma.user.count({ where: { role: 'mitra' } }),
      prisma.internship.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'pending' } }),
      prisma.user.count({ where: { mitraStatus: 'pending' } }),
    ]);

    res.json({
      totalUsers,
      totalMitra,
      totalInternships,
      totalApplications,
      pendingApplications,
      pendingMitraRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Recent activity log (last 10 events: new users, applications, mitra requests, internships)
export const getRecentActivity = async (req, res) => {
  try {
    const [recentUsers, recentApps, recentInternships, recentMitraRequests] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.application.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          applicant: { select: { name: true } },
          internship: { select: { title: true, company: true } },
        },
      }),
      prisma.internship.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, company: true, createdAt: true },
      }),
      prisma.user.findMany({
        where: { mitraStatus: 'pending' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, name: true, companyName: true, updatedAt: true },
      }),
    ]);

    const activities = [
      ...recentUsers.map(u => ({
        type: 'user_register',
        text: `User baru terdaftar: ${u.name || u.email}`,
        time: u.createdAt,
      })),
      ...recentApps.map(a => ({
        type: 'application',
        text: `${a.applicant.name || 'User'} melamar di ${a.internship.title} (${a.internship.company})`,
        time: a.createdAt,
      })),
      ...recentInternships.map(i => ({
        type: 'internship',
        text: `Lowongan baru: ${i.title} oleh ${i.company}`,
        time: i.createdAt,
      })),
      ...recentMitraRequests.map(m => ({
        type: 'mitra_request',
        text: `Request mitra baru dari ${m.companyName || m.name}`,
        time: m.updatedAt,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tren registrasi user 7 hari terakhir
export const getUserRegistrationTrend = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });

    // Group by day
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const count = users.filter(u => {
        const ud = new Date(u.createdAt);
        return ud >= d && ud < next;
      }).length;

      trend.push({ day: days[d.getDay()], count, date: d.toISOString() });
    }

    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all internships (admin view — includes closed)
export const getAllInternshipsAdmin = async (req, res) => {
  try {
    const internships = await prisma.internship.findMany({
      include: {
        mitra: { select: { name: true, email: true } },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin close/open internship
export const toggleInternshipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isClosed } = req.body;

    const internship = await prisma.internship.update({
      where: { id },
      data: { isClosed: isClosed !== undefined ? isClosed : true }
    });
    res.json({ message: `Lowongan ${isClosed ? 'ditutup' : 'dibuka'} oleh admin`, internship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Article Management ---
export const createArticle = async (req, res) => {
  try {
    const { title, content, thumbnailUrl } = req.body;
    const authorId = req.userId;

    const article = await prisma.article.create({
      data: { title, content, thumbnailUrl, authorId }
    });
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.article.delete({ where: { id } });
    res.json({ message: 'Artikel berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Monthly growth (last 6 months) — new users & new internships
export const getMonthlyGrowth = async (req, res) => {
  try {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const [newUsers, newInternships] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: start, lt: end } } }),
        prisma.internship.count({ where: { createdAt: { gte: start, lt: end } } }),
      ]);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      months.push({
        month: monthNames[start.getMonth()],
        newUsers,
        newInternships,
      });
    }

    res.json(months);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Top industries based on internship majors
export const getTopIndustries = async (req, res) => {
  try {
    const internships = await prisma.internship.findMany({ select: { major: true } });
    const counts = {};
    let total = 0;
    for (const i of internships) {
      const m = i.major || 'Lainnya';
      counts[m] = (counts[m] || 0) + 1;
      total++;
    }

    const result = Object.entries(counts)
      .map(([name, count]) => ({ name, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Application stats: new applicants & total matches (accepted)
export const getApplicationInsights = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [newApplicants, totalMatches, acceptedRate] = await Promise.all([
      prisma.application.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.application.count({ where: { status: 'accepted' } }),
      prisma.application.count({ where: { status: 'accepted' } }),
    ]);

    const totalApps = await prisma.application.count();
    const matchRate = totalApps > 0 ? Math.round((acceptedRate / totalApps) * 100) : 0;

    res.json({
      newApplicants,
      totalMatches,
      matchRate,
      totalApplications: totalApps,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
