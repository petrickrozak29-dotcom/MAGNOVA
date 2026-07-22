import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with default configurations...');

  // 1. Seed Feature Toggles
  const features = ['EVENT', 'WISATA', 'KULINER', 'SMART_MAGELANG'];
  for (const feature of features) {
    await prisma.featureToggle.upsert({
      where: { name: feature },
      update: {},
      create: {
        name: feature,
        isActive: true,
        description: `Fitur ${feature} default`,
      },
    });
  }

  // Helper to find or create category
  const ensureCategory = async (name: string, featureType: string) => {
    let category = await prisma.category.findFirst({
      where: { name, featureType },
    });
    if (!category) {
      category = await prisma.category.create({
        data: { name, featureType },
      });
      console.log(`Created category: ${name} (${featureType})`);
    }
    return category;
  };

  // 2. Seed Default Categories based on requirements
  const defaultCategories = {
    WISATA: ['Alam', 'Sejarah', 'Taman Rekreasi', 'Spot Populer'],
    KULINER: ['Makanan Khas', 'Pusat Kuliner', 'UMKM', 'Kopi dan Kafe'],
    EVENT: ['Konser Musik', 'Seni & Budaya', 'Pameran', 'Agenda Lokal'],
    SMART_MAGELANG: [
      'Infrastruktur Teknologi',
      'Internet dan Jaringan Komunikasi',
      'Digitalisasi Layanan Publik',
      'Pengembangan Smart City',
    ],
  };

  for (const [featureType, categories] of Object.entries(defaultCategories)) {
    for (const categoryName of categories) {
      await ensureCategory(categoryName, featureType);
    }
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
