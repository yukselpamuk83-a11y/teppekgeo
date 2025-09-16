
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Mock data generator for testing 100K+ performance
function generateMockMarker(id: string, type: 'job' | 'cv' | 'gold' = 'job'): any {
  const cities = [
    { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
    { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
    { name: 'İzmir', lat: 38.4237, lng: 27.1428 },
    { name: 'Bursa', lat: 40.1826, lng: 29.0665 },
    { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
    { name: 'Adana', lat: 37.0000, lng: 35.3213 },
    { name: 'Konya', lat: 37.8746, lng: 32.4932 },
    { name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
    { name: 'Mersin', lat: 36.8121, lng: 34.6415 },
    { name: 'Diyarbakır', lat: 37.9144, lng: 40.2306 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 }
  ];

  const companies = [
    'Türk Telekom', 'Garanti BBVA', 'İş Bankası', 'Arçelik', 'Beko', 'Vestel', 
    'TAV Havalimanları', 'Pegasus', 'Turkish Airlines', 'Migros', 'BİM', 'Şok Market',
    'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'Uber',
    'Airbnb', 'Spotify', 'Adobe', 'IBM', 'Oracle', 'SAP', 'Cisco', 'Intel'
  ];

  const positions = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer',
    'DevOps Engineer', 'Data Scientist', 'UI/UX Designer', 'Product Manager',
    'Project Manager', 'Business Analyst', 'QA Engineer', 'System Administrator',
    'Marketing Specialist', 'Sales Representative', 'HR Specialist', 'Accountant',
    'Content Writer', 'Graphic Designer', 'Social Media Manager', 'Customer Support'
  ];

  const professions = [
    'Yazılım Geliştirici', 'Web Tasarımcı', 'Mobil Uygulama Geliştirici', 'Veri Analisti',
    'Dijital Pazarlamacı', 'Grafik Tasarımcı', 'İnsan Kaynakları Uzmanı', 'Muhasebeci',
    'Proje Yöneticisi', 'İş Analisti', 'Sistem Yöneticisi', 'Test Uzmanı',
    'İçerik Editörü', 'Sosyal Medya Uzmanı', 'Satış Danışmanı', 'Müşteri Hizmetleri'
  ];

  const city = cities[Math.floor(Math.random() * cities.length)];
  
  // Add some randomness to coordinates for realistic spread
  const lat = city.lat + (Math.random() - 0.5) * 0.1;
  const lng = city.lng + (Math.random() - 0.5) * 0.1;

  const baseData = {
    id: id,
    type: type,
    position: [lat, lng],
    data: {
      location: city.name,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  };

  if (type === 'job' || type === 'gold') {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    
    return {
      ...baseData,
      title: `${position} - ${company}`,
      description: `${company} şirketinde ${position} pozisyonu için aday aranıyor.`,
      data: {
        ...baseData.data,
        company: company,
        position: position,
        salary: Math.random() > 0.5 ? `${Math.floor(Math.random() * 20000 + 15000)}₺` : null,
        workType: Math.random() > 0.5 ? 'Tam Zamanlı' : 'Part Time',
        experience: Math.floor(Math.random() * 10) + ' yıl',
        sector: Math.random() > 0.5 ? 'Teknoloji' : 'Finans',
        description: `${company} şirketinde ${position} pozisyonu için deneyimli aday aranmaktadır. Dinamik ekibimize katılmak isteyen adayları bekliyoruz.`
      }
    };
  } else {
    const profession = professions[Math.floor(Math.random() * professions.length)];
    
    return {
      ...baseData,
      title: `${profession} - Deneyimli Aday`,
      description: `${profession} olarak iş arıyor.`,
      data: {
        ...baseData.data,
        profession: profession,
        experience: Math.floor(Math.random() * 15) + ' yıl deneyim',
        skills: 'JavaScript, React, Node.js, Python, SQL',
        workType: Math.random() > 0.5 ? 'Tam Zamanlı' : 'Part Time',
        description: `${profession} olarak ${Math.floor(Math.random() * 15)} yıl deneyimim bulunmaktadır. Yeni fırsatlar arıyorum.`
      }
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '500');
    const offset = (page - 1) * limit;
    
    // Bounds-based filtering for viewport optimization
    const bounds = searchParams.get('bounds');
    const zoom = parseInt(searchParams.get('zoom') || '6');
    
    // Search and filter parameters
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const sector = searchParams.get('sector') || '';
    const experience = searchParams.get('experience') || '';
    const workType = searchParams.get('workType') || '';
    const dateRange = searchParams.get('dateRange') || '';

    // Simulate large dataset - 100K records
    const TOTAL_RECORDS = 100000;
    
    // Generate mock data efficiently
    const markers = [];
    
    // Performance optimization: Limit markers based on zoom level
    const effectiveLimit = zoom > 12 ? Math.min(limit, 2000) : 
                          zoom > 8 ? Math.min(limit, 1000) : 
                          Math.min(limit, 500);
    
    // If bounds are provided, simulate spatial filtering
    let boundsFilter = null;
    if (bounds) {
      const [minLat, minLng, maxLat, maxLng] = bounds.split(',').map(Number);
      boundsFilter = { minLat, minLng, maxLat, maxLng };
    }
    
    let generatedCount = 0;
    let attempts = 0;
    const maxAttempts = effectiveLimit * 3; // Prevent infinite loop
    
    while (generatedCount < effectiveLimit && attempts < maxAttempts) {
      attempts++;
      
      // Generate marker with random ID
      const markerId = `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Determine type distribution: 60% job, 30% cv, 10% gold
      let markerType: 'job' | 'cv' | 'gold' = 'job';
      const typeRand = Math.random();
      if (typeRand < 0.3) markerType = 'cv';
      else if (typeRand < 0.4) markerType = 'gold';
      
      const marker = generateMockMarker(markerId, markerType);
      
      // Apply bounds filtering
      if (boundsFilter) {
        const [lat, lng] = marker.position;
        if (lat < boundsFilter.minLat || lat > boundsFilter.maxLat || 
            lng < boundsFilter.minLng || lng > boundsFilter.maxLng) {
          continue;
        }
      }
      
      // Apply type filtering
      if (type && !type.split(',').includes(marker.type)) {
        continue;
      }
      
      // Apply search filtering
      if (search && !marker.title.toLowerCase().includes(search.toLowerCase()) &&
          !marker.data.company?.toLowerCase().includes(search.toLowerCase()) &&
          !marker.data.profession?.toLowerCase().includes(search.toLowerCase())) {
        continue;
      }
      
      // Apply sector filtering
      if (sector && marker.data.sector !== sector) {
        continue;
      }
      
      // Apply work type filtering
      if (workType && marker.data.workType !== workType) {
        continue;
      }
      
      markers.push(marker);
      generatedCount++;
    }
    
    // Simulate database performance metrics
    const performanceStats = {
      totalRecords: TOTAL_RECORDS,
      filteredRecords: generatedCount,
      queryTime: Math.random() * 100 + 50, // 50-150ms
      zoom: zoom,
      bounds: bounds,
      limit: effectiveLimit
    };

    // Response with performance headers
    const response = NextResponse.json({ 
      markers,
      pagination: {
        page,
        limit: effectiveLimit,
        total: generatedCount,
        hasMore: generatedCount === effectiveLimit
      },
      performance: performanceStats
    });
    
    // Cache headers for performance
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    
    return response;

  } catch (error) {
    console.error('Markers API error:', error);
    return NextResponse.json(
      { error: 'Veriler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    // Simulate marker creation
    const newMarker = generateMockMarker(
      `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type
    );

    // Override with provided data
    newMarker.title = data.title || newMarker.title;
    newMarker.description = data.description || newMarker.description;
    if (data.latitude && data.longitude) {
      newMarker.position = [parseFloat(data.latitude), parseFloat(data.longitude)];
    }
    
    // Merge additional data
    newMarker.data = {
      ...newMarker.data,
      ...data,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      marker: newMarker
    });

  } catch (error) {
    console.error('Marker creation error:', error);
    return NextResponse.json(
      { error: 'İlan oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
