import 'dotenv/config';
import prisma from '../config/db.js';

async function main() {
  const locations = [
    'YOGYAKARTA', 'JAKARTA', 'BANDUNG', 'SURABAYA', 'SEMARANG', 'MALANG', 'REMOTE'
  ];

  const majors = [
    'Teknik Informatika', 'Sistem Informasi', 'Teknik Elektro', 'Manajemen', 
    'Akuntansi', 'Ilmu Komunikasi', 'Desain Komunikasi Visual', 'Umum'
  ];

  console.log('Seeding locations...');
  for (const loc of locations) {
    await prisma.masterLocation.upsert({
      where: { name: loc },
      update: {},
      create: { name: loc }
    });
  }

  console.log('Seeding majors...');
  for (const major of majors) {
    await prisma.masterMajor.upsert({
      where: { name: major },
      update: {},
      create: { name: major }
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
