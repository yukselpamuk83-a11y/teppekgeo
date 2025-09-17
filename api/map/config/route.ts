import { NextRequest, NextResponse } from 'next/server';

// Statik harita konfigürasyon verileri - Cloudflare KV'de saklanacak
const MAP_CONFIG = {
  // Tile layer konfigürasyonları
  tileLayers: {
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      keepBuffer: 2
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; <a href="http://www.esri.com/">Esri</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      keepBuffer: 2
    }
  },

  // Dünya sınırları ve zoom limitleri
  bounds: {
    world: [[-85, -180], [85, 180]],
    turkey: [[35.5, 25.5], [42.5, 45.0]],
    europe: [[34.0, -10.0], [71.0, 40.0]],
    asia: [[-10.0, 60.0], [55.0, 180.0]]
  },

  // Zoom seviyeleri
  zoom: {
    min: 2,
    max: 18,
    default: 6,
    city: 12,
    country: 6,
    world: 2
  },

  // Performans ayarları
  performance: {
    markerClusterThreshold: 100,
    batchSize: 500,
    maxMarkers: 10000,
    chunkProcessingDelay: 10
  },

  // Marker cluster ayarları
  clustering: {
    chunkedLoading: true,
    maxClusterRadius: 50,
    sizes: {
      small: { count: 10, size: 40 },
      medium: { count: 100, size: 50 },
      large: { count: 1000, size: 60 }
    }
  },

  // Önemli şehir koordinatları
  cities: {
    istanbul: [41.0082, 28.9784],
    ankara: [39.9334, 32.8597],
    izmir: [38.4237, 27.1428],
    london: [51.5074, -0.1278],
    paris: [48.8566, 2.3522],
    berlin: [52.5200, 13.4050],
    madrid: [40.4168, -3.7038],
    rome: [41.9028, 12.4964],
    amsterdam: [52.3676, 4.9041],
    vienna: [48.2082, 16.3738],
    prague: [50.0755, 14.4378],
    warsaw: [52.2297, 21.0122],
    stockholm: [59.3293, 18.0686],
    oslo: [59.9139, 10.7522],
    copenhagen: [55.6761, 12.5683],
    helsinki: [60.1699, 24.9384],
    dublin: [53.3498, -6.2603],
    lisbon: [38.7223, -9.1393],
    athens: [37.9838, 23.7275],
    budapest: [47.4979, 19.0402],
    newYork: [40.7128, -74.0060],
    losAngeles: [34.0522, -118.2437],
    chicago: [41.8781, -87.6298],
    toronto: [43.6532, -79.3832],
    vancouver: [49.2827, -123.1207],
    sydney: [-33.8688, 151.2093],
    melbourne: [-37.8136, 144.9631],
    tokyo: [35.6762, 139.6503],
    singapore: [1.3521, 103.8198],
    dubai: [25.2048, 55.2708],
    moscow: [55.7558, 37.6176],
    saintPetersburg: [59.9311, 30.3609]
  },

  // Ülke sınırları (basitleştirilmiş)
  countries: {
    turkey: {
      bounds: [[35.5, 25.5], [42.5, 45.0]],
      center: [39.9334, 32.8597],
      zoom: 6
    },
    germany: {
      bounds: [[47.2, 5.8], [55.1, 15.0]],
      center: [52.5200, 13.4050],
      zoom: 6
    },
    france: {
      bounds: [[41.3, -5.1], [51.1, 9.6]],
      center: [48.8566, 2.3522],
      zoom: 6
    },
    uk: {
      bounds: [[49.9, -8.2], [60.8, 1.8]],
      center: [51.5074, -0.1278],
      zoom: 6
    },
    usa: {
      bounds: [[24.4, -125.0], [49.4, -66.9]],
      center: [40.7128, -74.0060],
      zoom: 4
    }
  }
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // tileLayers, bounds, zoom, cities, countries

    let response;

    if (type && MAP_CONFIG[type as keyof typeof MAP_CONFIG]) {
      response = MAP_CONFIG[type as keyof typeof MAP_CONFIG];
    } else {
      response = MAP_CONFIG;
    }

    return NextResponse.json({
      success: true,
      data: response,
      cached: true,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        // Cloudflare Edge'de 24 saat cache
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'CDN-Cache-Control': 'max-age=86400',
        'Cloudflare-CDN-Cache-Control': 'max-age=86400'
      }
    });

  } catch (error) {
    console.error('Map config API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Harita konfigürasyonu yüklenirken hata oluştu',
        data: MAP_CONFIG // Fallback
      },
      { status: 500 }
    );
  }
}