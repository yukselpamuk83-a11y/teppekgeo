
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (except users)
  console.log('🧹 Cleaning existing data...');
  await prisma.goldListing.deleteMany();
  await prisma.cvListing.deleteMany();
  await prisma.jobListing.deleteMany();
  
  // Create test users
  console.log('👥 Creating test users...');

  // Admin test account (hidden from user)
  const adminUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: await bcryptjs.hash('johndoe123', 12),
      firstName: 'John',
      lastName: 'Doe',
      subscriptionType: 'GOLD',
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    }
  });

  // Sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ahmet@email.com' },
      update: {},
      create: {
        email: 'ahmet@email.com',
        password: await bcryptjs.hash('password123', 12),
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        phone: '+90 555 123 45 67',
        companyName: 'Tech Company A',
        subscriptionType: 'PREMIUM',
        subscriptionEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      }
    }),
    prisma.user.upsert({
      where: { email: 'fatma@email.com' },
      update: {},
      create: {
        email: 'fatma@email.com',
        password: await bcryptjs.hash('password123', 12),
        firstName: 'Fatma',
        lastName: 'Kaya',
        phone: '+90 555 234 56 78',
        subscriptionType: 'FREE'
      }
    }),
    prisma.user.upsert({
      where: { email: 'mehmet@email.com' },
      update: {},
      create: {
        email: 'mehmet@email.com',
        password: await bcryptjs.hash('password123', 12),
        firstName: 'Mehmet',
        lastName: 'Demir',
        phone: '+90 555 345 67 89',
        companyName: 'Digital Agency',
        subscriptionType: 'GOLD',
        subscriptionEnd: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 180 days
      }
    }),
    prisma.user.upsert({
      where: { email: 'ayse@email.com' },
      update: {},
      create: {
        email: 'ayse@email.com',
        password: await bcryptjs.hash('password123', 12),
        firstName: 'Ayşe',
        lastName: 'Çelik',
        phone: '+90 555 456 78 90',
        subscriptionType: 'FREE'
      }
    })
  ]);

  console.log('💼 Creating job listings...');

  // Job listings
  const jobListings = await Promise.all([
    // Turkey Jobs
    prisma.jobListing.create({
      data: {
        title: 'Frontend Developer',
        description: 'React, TypeScript, Next.js deneyimi aranan Frontend Developer pozisyonu. Modern web teknolojileri ile çalışma imkanı.',
        company: 'Tech Istanbul',
        location: 'İstanbul, Türkiye',
        latitude: 41.0082,
        longitude: 28.9784,
        salary: '15.000 - 25.000 TL',
        jobType: 'Full-time',
        sector: 'Technology',
        experience: 'Mid-level',
        contactEmail: users[0].email,
        contactPhone: '+90 555 123 45 67',
        applyUrl: 'https://techcompany.com/careers',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: users[0].id,
        isPremium: true
      }
    }),
    prisma.jobListing.create({
      data: {
        title: 'Backend Developer',
        description: 'Node.js, PostgreSQL, Docker deneyimi aranan Backend Developer pozisyonu.',
        company: 'Software Corp',
        location: 'Ankara, Türkiye',
        latitude: 39.9334,
        longitude: 32.8597,
        salary: '18.000 - 30.000 TL',
        jobType: 'Full-time',
        sector: 'Technology',
        experience: 'Senior',
        contactEmail: users[2].email,
        contactPhone: '+90 555 345 67 89',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: users[2].id
      }
    }),
    prisma.jobListing.create({
      data: {
        title: 'Full Stack Developer',
        description: 'React, Node.js, AWS deneyimi olan Full Stack Developer aranıyor.',
        company: 'Digital Agency',
        location: 'İzmir, Türkiye',
        latitude: 38.4192,
        longitude: 27.1287,
        salary: '20.000 - 35.000 TL',
        jobType: 'Full-time',
        sector: 'Technology',
        experience: 'Senior',
        contactEmail: users[2].email,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: users[2].id
      }
    }),
    // International Jobs
    prisma.jobListing.create({
      data: {
        title: 'Software Engineer',
        description: 'Python, Django, Docker experience required for Software Engineer position.',
        company: 'Tech Startup NYC',
        location: 'New York, USA',
        latitude: 40.7128,
        longitude: -74.0060,
        salary: '$80,000 - $120,000',
        jobType: 'Full-time',
        sector: 'Technology',
        experience: 'Mid-level',
        contactEmail: adminUser.email,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: adminUser.id
      }
    }),
    prisma.jobListing.create({
      data: {
        title: 'DevOps Engineer',
        description: 'AWS, Kubernetes, Docker experience needed for DevOps role.',
        company: 'Cloud Solutions Ltd',
        location: 'London, UK',
        latitude: 51.5074,
        longitude: -0.1278,
        salary: '£50,000 - £70,000',
        jobType: 'Full-time',
        sector: 'Technology',
        experience: 'Senior',
        contactEmail: adminUser.email,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: adminUser.id
      }
    })
  ]);

  console.log('📄 Creating CV listings...');

  // CV listings
  const cvListings = await Promise.all([
    prisma.cvListing.create({
      data: {
        title: 'Deneyimli React Developer',
        description: '5 yıllık React deneyimi olan developer, remote çalışma olanağı arıyor.',
        profession: 'React Developer',
        skills: 'React, Redux, TypeScript, Next.js, Node.js',
        experience: '5 yıl',
        location: 'Antalya, Türkiye',
        latitude: 36.8969,
        longitude: 30.7133,
        contactEmail: users[1].email,
        contactPhone: '+90 555 234 56 78',
        linkedinUrl: 'https://linkedin.com/in/fatma-kaya',
        portfolioUrl: 'https://fatmakaya.dev',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: users[1].id
      }
    }),
    prisma.cvListing.create({
      data: {
        title: 'Mobile App Developer',
        description: 'Mobil uygulama geliştirme konusunda deneyimli developer.',
        profession: 'Mobile Developer',
        skills: 'React Native, Flutter, iOS, Android, Swift, Kotlin',
        experience: '3 yıl',
        location: 'Gaziantep, Türkiye',
        latitude: 37.0662,
        longitude: 37.3833,
        contactEmail: users[3].email,
        contactPhone: '+90 555 456 78 90',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: users[3].id
      }
    }),
    prisma.cvListing.create({
      data: {
        title: 'UI/UX Designer',
        description: 'Kullanıcı deneyimi tasarımında uzman, yaratıcı projeler arıyor.',
        profession: 'UI/UX Designer',
        skills: 'Figma, Adobe XD, Sketch, Prototyping, User Research',
        experience: '4 yıl',
        location: 'Paris, France',
        latitude: 48.8566,
        longitude: 2.3522,
        contactEmail: adminUser.email,
        portfolioUrl: 'https://uxdesigner.portfolio.com',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: adminUser.id
      }
    })
  ]);

  console.log('🏆 Creating gold listings...');

  // Gold listings
  const goldListings = await Promise.all([
    prisma.goldListing.create({
      data: {
        title: 'Senior Software Architect - San Francisco',
        description: 'Büyük ölçekli sistemler için deneyimli software architect pozisyonu. Competitive salary and equity options.',
        type: 'JOB',
        location: 'San Francisco, USA',
        latitude: 37.7749,
        longitude: -122.4194,
        contactEmail: adminUser.email,
        contactPhone: '+1 555 123 4567',
        website: 'https://techgiant.com',
        priority: 9,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        userId: adminUser.id
      }
    }),
    prisma.goldListing.create({
      data: {
        title: 'Lead Developer - Tokyo',
        description: 'Takım liderliği yapacak deneyimli geliştirici aranıyor. International team environment.',
        type: 'JOB',
        location: 'Tokyo, Japan',
        latitude: 35.6762,
        longitude: 139.6503,
        contactEmail: users[2].email,
        website: 'https://innovationlabs.jp',
        priority: 8,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        userId: users[2].id
      }
    }),
    prisma.goldListing.create({
      data: {
        title: 'CTO - Moscow',
        description: 'Fintech alanında deneyimli CTO pozisyonu, startup ortamı.',
        type: 'JOB',
        location: 'Moscow, Russia',
        latitude: 55.7558,
        longitude: 37.6173,
        contactEmail: adminUser.email,
        website: 'https://fintechstartup.ru',
        priority: 10,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        userId: adminUser.id
      }
    })
  ]);

  console.log(`✅ Database seeded successfully!`);
  console.log(`👥 Created ${users.length + 1} users (including admin)`);
  console.log(`💼 Created ${jobListings.length} job listings`);
  console.log(`📄 Created ${cvListings.length} CV listings`);
  console.log(`🏆 Created ${goldListings.length} gold listings`);
  
  // Print test account info (for development only)
  console.log('\n🔐 Test Accounts:');
  console.log('Admin: john@doe.com / johndoe123');
  console.log('User: ahmet@email.com / password123');
  console.log('User: fatma@email.com / password123');
  console.log('User: mehmet@email.com / password123');
  console.log('User: ayse@email.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
