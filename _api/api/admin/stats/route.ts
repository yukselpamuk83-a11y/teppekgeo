
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

async function checkAdminAccess(session: any) {
  if (!session?.user?.email) return false;
  
  const adminEmails = ['admin@example.com', 'john@doe.com'];
  return adminEmails.includes(session.user.email);
}

// GET: Fetch admin dashboard statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const isAdmin = await checkAdminAccess(session);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Yönetici yetkisi gerekli' },
        { status: 403 }
      );
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User statistics
    const totalUsers = await prisma.user.count();
    const newUsersThisWeek = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });
    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });

    // Subscription statistics
    const freeUsers = await prisma.user.count({
      where: { subscriptionType: 'FREE' }
    });
    const premiumUsers = await prisma.user.count({
      where: { subscriptionType: 'PREMIUM' }
    });
    const goldUsers = await prisma.user.count({
      where: { subscriptionType: 'GOLD' }
    });

    // Listing statistics
    const activeJobListings = await prisma.jobListing.count({
      where: { isActive: true, expiresAt: { gt: now } }
    });
    const activeCvListings = await prisma.cvListing.count({
      where: { isActive: true, expiresAt: { gt: now } }
    });
    const activeGoldListings = await prisma.goldListing.count({
      where: { isActive: true, expiresAt: { gt: now } }
    });

    const newJobListingsThisWeek = await prisma.jobListing.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });
    const newCvListingsThisWeek = await prisma.cvListing.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });
    const newGoldListingsThisWeek = await prisma.goldListing.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });

    // Recent activity
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptionType: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const recentListings = await prisma.jobListing.findMany({
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        createdAt: true,
        user: {
          select: { email: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
          free: freeUsers,
          premium: premiumUsers,
          gold: goldUsers
        },
        listings: {
          activeJobs: activeJobListings,
          activeCvs: activeCvListings,
          activeGold: activeGoldListings,
          newJobsThisWeek: newJobListingsThisWeek,
          newCvsThisWeek: newCvListingsThisWeek,
          newGoldThisWeek: newGoldListingsThisWeek
        },
        recentActivity: {
          users: recentUsers.map(user => ({
            ...user,
            createdAt: user.createdAt.toISOString()
          })),
          listings: recentListings.map(listing => ({
            ...listing,
            createdAt: listing.createdAt.toISOString()
          }))
        }
      }
    });

  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { success: false, error: 'İstatistikler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
