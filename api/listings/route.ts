
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    // User'ı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Koordinatları parse et
    const latitude = parseFloat(data.latitude) || 39.9334;
    const longitude = parseFloat(data.longitude) || 32.8597;

    // Marker oluştur (geçici olarak mock data)
    const marker = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      type: type,
      latitude: latitude,
      longitude: longitude,
      data: {
        ...data,
        location: data.location,
        createdAt: new Date().toISOString()
      }
    };

    return NextResponse.json({ 
      success: true, 
      marker: {
        id: marker.id,
        title: marker.title,
        description: marker.description,
        type: marker.type,
        latitude: marker.latitude,
        longitude: marker.longitude,
        data: marker.data
      }
    });

  } catch (error) {
    console.error('Listing creation error:', error);
    return NextResponse.json(
      { error: 'İlan oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Mock data - gerçek database'den çekilecek
    const markers: any[] = [];

    return NextResponse.json({ markers });

  } catch (error) {
    console.error('Listings fetch error:', error);
    return NextResponse.json(
      { error: 'İlanlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
