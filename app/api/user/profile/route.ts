
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET: Fetch user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        image: true,
        subscriptionType: true,
        subscriptionEnd: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            jobListings: { where: { isActive: true } },
            cvListings: { where: { isActive: true } },
            goldListings: { where: { isActive: true } }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        subscriptionEnd: user.subscriptionEnd?.toISOString() || null
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Profil yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT: Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword, ...updateData } = body;

    // If password update is requested, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Mevcut şifre gerekli' },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      });

      if (!user?.password) {
        return NextResponse.json(
          { success: false, error: 'Şifre değiştirme için önce bir şifre belirleyin' },
          { status: 400 }
        );
      }

      const isValidPassword = await bcryptjs.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'Mevcut şifre yanlış' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedNewPassword = await bcryptjs.hash(newPassword, 12);
      updateData.password = hashedNewPassword;
    }

    // Remove password-related fields from general update
    delete updateData.currentPassword;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        image: true,
        subscriptionType: true,
        subscriptionEnd: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        updatedAt: updatedUser.updatedAt.toISOString(),
        subscriptionEnd: updatedUser.subscriptionEnd?.toISOString() || null
      },
      message: 'Profil başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Profil güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE: Delete user account
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const confirmDelete = searchParams.get('confirm') === 'true';

    if (!confirmDelete) {
      return NextResponse.json(
        { success: false, error: 'Hesap silme işlemi onaylanmadı' },
        { status: 400 }
      );
    }

    // Delete user and all related data (CASCADE will handle related records)
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Hesap başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, error: 'Hesap silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
