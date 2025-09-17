import { NextRequest, NextResponse } from 'next/server';

// Statik harita tile verilerini Cloudflare'de sakla
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const z = searchParams.get('z');
  const x = searchParams.get('x');
  const y = searchParams.get('y');
  const type = searchParams.get('type') || 'street';

  // Cloudflare'de statik tile'ları saklamak için
  const tileUrl = type === 'satellite'
    ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
    : `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

  try {
    // Tile'ı upstream'den çek ve Cloudflare'de cache'le
    const response = await fetch(tileUrl);

    if (!response.ok) {
      throw new Error('Tile yüklenemedi');
    }

    const imageData = await response.arrayBuffer();

    return new Response(imageData, {
      headers: {
        'Content-Type': 'image/png',
        // 30 gün cache - harita tile'ları değişmez
        'Cache-Control': 'public, max-age=2592000, immutable',
        'Cloudflare-CDN-Cache-Control': 'max-age=2592000',
        'CDN-Cache-Control': 'max-age=2592000'
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Tile yüklenemedi' },
      { status: 404 }
    );
  }
}