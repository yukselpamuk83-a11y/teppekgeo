
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

async function checkAdminAccess(session: any) {
  if (!session?.user?.email) return false;
  
  // Check if user is admin (you can customize this logic)
  const adminEmails = ['admin@example.com', 'john@doe.com']; // Add more admin emails
  return adminEmails.includes(session.user.email);
}

// GET: Fetch all users (Admin only)
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const subscription = searchParams.get('subscription');
    const skip = (page - 1) * limit;

    let whereFilter: any = {};
    
    if (search) {
      whereFilter.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (subscription && subscription !== 'all') {
      whereFilter.subscriptionType = subscription;
    }

    const users = await prisma.user.findMany({
      where: whereFilter,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        subscriptionType: true,
        subscriptionEnd: true,
        createdAt: true,
        _count: {
          select: {
            jobListings: { where: { isActive: true } },
            cvListings: { where: { isActive: true } },
            goldListings: { where: { isActive: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.user.count({ where: whereFilter });

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        subscriptionEnd: user.subscriptionEnd?.toISOString() || null
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { success: false, error: 'Kullanıcılar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT: Update user subscription (Admin only)
export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { userId, subscriptionType, subscriptionEnd } = body;

    if (!userId || !subscriptionType) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID ve abonelik türü gerekli' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionType,
        subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd) : null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptionType: true,
        subscriptionEnd: true
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        subscriptionEnd: updatedUser.subscriptionEnd?.toISOString() || null
      },
      message: 'Kullanıcı aboneliği güncellendi'
    });

  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Kullanıcı güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}
