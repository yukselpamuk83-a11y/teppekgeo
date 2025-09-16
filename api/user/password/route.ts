
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mevcut şifre ve yeni şifre gereklidir' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Yeni şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // User'ı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı veya şifre yok' },
        { status: 404 }
      );
    }

    // Mevcut şifreyi kontrol et
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Mevcut şifre hatalı' },
        { status: 400 }
      );
    }

    // Yeni şifreyi hash'le
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        password: hashedNewPassword
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });

  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'Şifre değiştirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
