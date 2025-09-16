
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { JobBucket } from '@/lib/adzuna';

const prisma = new PrismaClient();


// GET: Fetch all listings with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // job, cv, gold
    const sector = searchParams.get('sector');
    const location = searchParams.get('location');
    const experience = searchParams.get('experience');
    const salary = searchParams.get('salary');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    let listings: any[] = [];
    let total = 0;

    // Job listings
    if (!type || type === 'job') {
      const whereJob: any = {
        isActive: true,
        expiresAt: { gt: new Date() }
      };

      if (sector) whereJob.sector = { contains: sector, mode: 'insensitive' };
      if (location) whereJob.location = { contains: location, mode: 'insensitive' };
      if (experience) whereJob.experience = { contains: experience, mode: 'insensitive' };
      if (search) {
        whereJob.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } }
        ];
      }

      const jobListings = await prisma.jobListing.findMany({
        where: whereJob,
        include: { user: { select: { firstName: true, lastName: true, companyName: true } } },
        orderBy: [
          { isPremium: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: type === 'job' ? skip : 0,
        take: type === 'job' ? limit : undefined
      });

      listings.push(...jobListings.map(job => ({
        id: job.id,
        type: 'job',
        lat: job.latitude,
        lng: job.longitude,
        position: [job.latitude, job.longitude],
        title: job.title,
        data: {
          ...job,
          userName: job.user.firstName && job.user.lastName 
            ? `${job.user.firstName} ${job.user.lastName}`
            : job.user.companyName || 'Anonim'
        }
      })));

      if (type === 'job') {
        total = await prisma.jobListing.count({ where: whereJob });
      }
    }

    // CV listings
    if (!type || type === 'cv') {
      const whereCv: any = {
        isActive: true,
        expiresAt: { gt: new Date() }
      };

      if (location) whereCv.location = { contains: location, mode: 'insensitive' };
      if (search) {
        whereCv.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { profession: { contains: search, mode: 'insensitive' } },
          { skills: { contains: search, mode: 'insensitive' } }
        ];
      }

      const cvListings = await prisma.cvListing.findMany({
        where: whereCv,
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: [
          { isPremium: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: type === 'cv' ? skip : 0,
        take: type === 'cv' ? limit : undefined
      });

      listings.push(...cvListings.map(cv => ({
        id: cv.id,
        type: 'cv',
        lat: cv.latitude,
        lng: cv.longitude,
        position: [cv.latitude, cv.longitude],
        title: cv.title,
        data: {
          ...cv,
          userName: cv.user.firstName && cv.user.lastName 
            ? `${cv.user.firstName} ${cv.user.lastName}`
            : 'Anonim'
        }
      })));

      if (type === 'cv') {
        total = await prisma.cvListing.count({ where: whereCv });
      }
    }

    // Gold listings
    if (!type || type === 'gold') {
      const whereGold: any = {
        isActive: true,
        expiresAt: { gt: new Date() }
      };

      if (location) whereGold.location = { contains: location, mode: 'insensitive' };
      if (search) {
        whereGold.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const goldListings = await prisma.goldListing.findMany({
        where: whereGold,
        include: { user: { select: { firstName: true, lastName: true, companyName: true } } },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: type === 'gold' ? skip : 0,
        take: type === 'gold' ? limit : undefined
      });

      listings.push(...goldListings.map(gold => ({
        id: gold.id,
        type: 'gold',
        lat: gold.latitude,
        lng: gold.longitude,
        position: [gold.latitude, gold.longitude],
        title: gold.title,
        data: {
          ...gold,
          userName: gold.user.firstName && gold.user.lastName 
            ? `${gold.user.firstName} ${gold.user.lastName}`
            : gold.user.companyName || 'Anonim'
        }
      })));

      if (type === 'gold') {
        total = await prisma.goldListing.count({ where: whereGold });
      }
    }

    // Adzuna jobs (if not filtering by specific type or if type is 'adzuna' or 'job')
    if (!type || type === 'job' || type === 'adzuna') {
      try {
        const bucket = JobBucket.getInstance();
        
        const adzunaFilters: any = {};
        if (location) adzunaFilters.location = location;
        if (search) adzunaFilters.search = search;
        
        const adzunaJobs = await bucket.getJobs(adzunaFilters);
        
        // Apply additional filtering
        let filteredAdzunaJobs = adzunaJobs;
        if (sector) {
          filteredAdzunaJobs = filteredAdzunaJobs.filter(job => 
            job.category?.toLowerCase().includes(sector.toLowerCase())
          );
        }
        if (salary) {
          const salaryNum = parseInt(salary);
          filteredAdzunaJobs = filteredAdzunaJobs.filter(job => 
            job.salaryMin >= salaryNum || job.salaryMax >= salaryNum
          );
        }

        // Convert to marker format
        const adzunaMarkers = filteredAdzunaJobs
          .filter(job => job.latitude && job.longitude) // Only jobs with location
          .slice(0, type === 'adzuna' ? limit : 100) // Limit Adzuna jobs for performance
          .map(job => ({
            id: `adzuna-${job.id}`,
            type: 'adzuna',
            lat: job.latitude,
            lng: job.longitude,
            position: [job.latitude, job.longitude],
            title: job.title,
            data: {
              ...job,
              salary: job.salaryMin && job.salaryMax 
                ? `${job.salaryMin} - ${job.salaryMax} ${job.salaryCurrency || ''}`
                : job.salaryMin 
                ? `${job.salaryMin}+ ${job.salaryCurrency || ''}`
                : job.salaryMax 
                ? `Up to ${job.salaryMax} ${job.salaryCurrency || ''}`
                : 'Salary not specified',
              userName: job.company,
              source: 'Adzuna',
              redirectUrl: job.redirectUrl
            }
          }));

        listings.push(...adzunaMarkers);
        
      } catch (error) {
        console.error('Error fetching Adzuna jobs:', error);
        // Continue without Adzuna jobs if there's an error
      }
    }

    // If no specific type, get total count
    if (!type) {
      const jobCount = await prisma.jobListing.count({ 
        where: { isActive: true, expiresAt: { gt: new Date() } } 
      });
      const cvCount = await prisma.cvListing.count({ 
        where: { isActive: true, expiresAt: { gt: new Date() } } 
      });
      const goldCount = await prisma.goldListing.count({ 
        where: { isActive: true, expiresAt: { gt: new Date() } } 
      });
      const adzunaCount = await prisma.adzunaJob.count({ 
        where: { isActive: true } 
      });
      total = jobCount + cvCount + goldCount + adzunaCount;
    }

    return NextResponse.json({
      success: true,
      listings,
      total: total || listings.length,
      page,
      limit,
      totalPages: Math.ceil((total || listings.length) / limit),
      counts: {
        jobs: listings.filter(l => l.type === 'job').length,
        cvs: listings.filter(l => l.type === 'cv').length,
        gold: listings.filter(l => l.type === 'gold').length,
        adzuna: listings.filter(l => l.type === 'adzuna').length
      }
    });

  } catch (error) {
    console.error('Listings API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Veriler yüklenirken hata oluştu',
        listings: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

// POST: Create new listing
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, ...listingData } = body;

    // Set expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    let newListing;

    if (type === 'job') {
      newListing = await prisma.jobListing.create({
        data: {
          ...listingData,
          userId: session.user.id,
          expiresAt,
          isActive: true,
          isPremium: false
        }
      });
    } else if (type === 'cv') {
      newListing = await prisma.cvListing.create({
        data: {
          ...listingData,
          userId: session.user.id,
          expiresAt,
          isActive: true,
          isPremium: false
        }
      });
    } else if (type === 'gold') {
      // Gold listings require premium membership
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      });

      if (user?.subscriptionType === 'FREE') {
        return NextResponse.json(
          { success: false, error: 'Altın ilan oluşturmak için premium üyelik gereklidir' },
          { status: 403 }
        );
      }

      newListing = await prisma.goldListing.create({
        data: {
          ...listingData,
          userId: session.user.id,
          expiresAt,
          isActive: true,
          priority: listingData.priority || 5
        }
      });
    }

    return NextResponse.json({
      success: true,
      listing: newListing,
      message: 'İlan başarıyla oluşturuldu'
    });

  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { success: false, error: 'İlan oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
