
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET: Fetch user's own listings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // job, cv, gold
    const status = searchParams.get('status'); // active, expired, all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let listings: any[] = [];
    let total = 0;

    const userId = session.user.id;
    const now = new Date();

    // Build status filter
    let statusFilter: any = {};
    if (status === 'active') {
      statusFilter = { isActive: true, expiresAt: { gt: now } };
    } else if (status === 'expired') {
      statusFilter = { OR: [{ isActive: false }, { expiresAt: { lte: now } }] };
    }

    // Job listings
    if (!type || type === 'job') {
      const jobListings = await prisma.jobListing.findMany({
        where: {
          userId,
          ...statusFilter
        },
        orderBy: { createdAt: 'desc' },
        skip: type === 'job' ? skip : 0,
        take: type === 'job' ? limit : undefined
      });

      listings.push(...jobListings.map(job => ({
        ...job,
        type: 'job',
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        expiresAt: job.expiresAt.toISOString()
      })));

      if (type === 'job') {
        total = await prisma.jobListing.count({
          where: { userId, ...statusFilter }
        });
      }
    }

    // CV listings
    if (!type || type === 'cv') {
      const cvListings = await prisma.cvListing.findMany({
        where: {
          userId,
          ...statusFilter
        },
        orderBy: { createdAt: 'desc' },
        skip: type === 'cv' ? skip : 0,
        take: type === 'cv' ? limit : undefined
      });

      listings.push(...cvListings.map(cv => ({
        ...cv,
        type: 'cv',
        createdAt: cv.createdAt.toISOString(),
        updatedAt: cv.updatedAt.toISOString(),
        expiresAt: cv.expiresAt.toISOString()
      })));

      if (type === 'cv') {
        total = await prisma.cvListing.count({
          where: { userId, ...statusFilter }
        });
      }
    }

    // Gold listings
    if (!type || type === 'gold') {
      const goldListings = await prisma.goldListing.findMany({
        where: {
          userId,
          ...statusFilter
        },
        orderBy: { createdAt: 'desc' },
        skip: type === 'gold' ? skip : 0,
        take: type === 'gold' ? limit : undefined
      });

      listings.push(...goldListings.map(gold => ({
        ...gold,
        type: 'gold',
        createdAt: gold.createdAt.toISOString(),
        updatedAt: gold.updatedAt.toISOString(),
        expiresAt: gold.expiresAt.toISOString()
      })));

      if (type === 'gold') {
        total = await prisma.goldListing.count({
          where: { userId, ...statusFilter }
        });
      }
    }

    // If no specific type, get total count
    if (!type) {
      const jobCount = await prisma.jobListing.count({
        where: { userId, ...statusFilter }
      });
      const cvCount = await prisma.cvListing.count({
        where: { userId, ...statusFilter }
      });
      const goldCount = await prisma.goldListing.count({
        where: { userId, ...statusFilter }
      });
      total = jobCount + cvCount + goldCount;
    }

    return NextResponse.json({
      success: true,
      listings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      counts: {
        jobs: listings.filter(l => l.type === 'job').length,
        cvs: listings.filter(l => l.type === 'cv').length,
        gold: listings.filter(l => l.type === 'gold').length
      }
    });

  } catch (error) {
    console.error('Get user listings error:', error);
    return NextResponse.json(
      { success: false, error: 'İlanlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
