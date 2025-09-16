
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya seçilmedi' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Dosya boyutu 10MB\'dan büyük olamaz' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Desteklenmeyen dosya türü' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate filename with user ID and timestamp
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${session.user.id}-${Date.now()}.${fileExtension}`;

    // Upload to S3
    const cloudStoragePath = await uploadFile(buffer, fileName, file.type);

    return NextResponse.json({
      success: true,
      cloudStoragePath,
      originalName: file.name,
      size: file.size,
      contentType: file.type,
      message: 'Dosya başarıyla yüklendi'
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { success: false, error: 'Dosya yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
