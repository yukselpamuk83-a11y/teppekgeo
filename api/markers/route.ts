
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // job, cv, gold
    const bounds = searchParams.get('bounds'); // "lat1,lng1,lat2,lng2"
    
    let markers: any[] = [];

    // Parse bounds if provided for viewport filtering
    let boundsFilter: any = {};
    if (bounds) {
      try {
        const [lat1, lng1, lat2, lng2] = bounds.split(',').map(Number);
        const minLat = Math.min(lat1, lat2);
        const maxLat = Math.max(lat1, lat2);
        const minLng = Math.min(lng1, lng2);
        const maxLng = Math.max(lng1, lng2);
        
        boundsFilter = {
          latitude: { gte: minLat, lte: maxLat },
          longitude: { gte: minLng, lte: maxLng }
        };
      } catch (e) {
        console.log('Invalid bounds format:', bounds);
      }
    }

    // Fetch job listings
    if (!type || type === 'job') {
      const jobListings = await prisma.jobListing.findMany({
        where: {
          isActive: true,
          expiresAt: { gt: new Date() },
          ...boundsFilter
        },
        include: { 
          user: { 
            select: { firstName: true, lastName: true, companyName: true } 
          } 
        },
        orderBy: [
          { isPremium: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 1000 // Limit for performance
      });

      markers.push(...jobListings.map(job => ({
        id: job.id,
        type: 'job',
        lat: job.latitude,
        lng: job.longitude,
        position: [job.latitude, job.longitude],
        title: job.title,
        data: {
          ...job,
          createdAt: job.createdAt.toISOString(),
          updatedAt: job.updatedAt.toISOString(),
          expiresAt: job.expiresAt.toISOString(),
          userName: job.user.firstName && job.user.lastName 
            ? `${job.user.firstName} ${job.user.lastName}`
            : job.user.companyName || 'Anonim',
          company: job.company,
          position: job.title,
          location: job.location
        }
      })));
    }

    // Fetch CV listings
    if (!type || type === 'cv') {
      const cvListings = await prisma.cvListing.findMany({
        where: {
          isActive: true,
          expiresAt: { gt: new Date() },
          ...boundsFilter
        },
        include: { 
          user: { 
            select: { firstName: true, lastName: true } 
          } 
        },
        orderBy: [
          { isPremium: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 1000
      });

      markers.push(...cvListings.map(cv => ({
        id: cv.id,
        type: 'cv',
        lat: cv.latitude,
        lng: cv.longitude,
        position: [cv.latitude, cv.longitude],
        title: cv.title,
        data: {
          ...cv,
          createdAt: cv.createdAt.toISOString(),
          updatedAt: cv.updatedAt.toISOString(),
          expiresAt: cv.expiresAt.toISOString(),
          userName: cv.user.firstName && cv.user.lastName 
            ? `${cv.user.firstName} ${cv.user.lastName}`
            : 'Anonim',
          location: cv.location
        }
      })));
    }

    // Fetch gold listings
    if (!type || type === 'gold') {
      const goldListings = await prisma.goldListing.findMany({
        where: {
          isActive: true,
          expiresAt: { gt: new Date() },
          ...boundsFilter
        },
        include: { 
          user: { 
            select: { firstName: true, lastName: true, companyName: true } 
          } 
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 1000
      });

      markers.push(...goldListings.map(gold => ({
        id: gold.id,
        type: 'gold',
        lat: gold.latitude,
        lng: gold.longitude,
        position: [gold.latitude, gold.longitude],
        title: gold.title,
        data: {
          ...gold,
          createdAt: gold.createdAt.toISOString(),
          updatedAt: gold.updatedAt.toISOString(),
          expiresAt: gold.expiresAt.toISOString(),
          userName: gold.user.firstName && gold.user.lastName 
            ? `${gold.user.firstName} ${gold.user.lastName}`
            : gold.user.companyName || 'Anonim',
          location: gold.location
        }
      })));
    }

    // Fetch Adzuna jobs (Global job listings)
    if (!type || type === 'adzuna') {
      const adzunaJobs = await prisma.adzunaJob.findMany({
        where: {
          isActive: true,
          latitude: { not: null },
          longitude: { not: null },
          ...boundsFilter
        },
        orderBy: [
          { isPremium: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 1000 // Limit for performance
      });

      markers.push(...adzunaJobs.map(job => ({
        id: job.id,
        type: 'adzuna',
        lat: job.latitude!,
        lng: job.longitude!,
        position: [job.latitude!, job.longitude!],
        title: job.title,
        data: {
          ...job,
          createdAt: job.createdAt.toISOString(),
          updatedAt: job.updatedAt.toISOString(),
          expiresAt: job.expiresAt?.toISOString() || null,
          adzunaCreated: job.adzunaCreated.toISOString(),
          fetchedAt: job.fetchedAt.toISOString(),
          userName: 'Adzuna', // Global platform
          company: job.company,
          position: job.title,
          location: job.location,
          salary: job.salaryMin && job.salaryMax 
            ? `${job.salaryMin} - ${job.salaryMax} ${job.salaryCurrency || ''}`
            : job.salaryMin 
              ? `${job.salaryMin}+ ${job.salaryCurrency || ''}`
              : job.salaryMax 
                ? `Up to ${job.salaryMax} ${job.salaryCurrency || ''}`
                : 'Salary not specified',
          // Add specific Adzuna fields
          adzunaId: job.adzunaId,
          country: job.country,
          category: job.category,
          jobType: job.jobType,
          sector: job.sector,
          experience: job.experience,
          applyUrl: job.applyUrl,
          redirectUrl: job.redirectUrl
        }
      })));
    }

    return NextResponse.json({
      success: true,
      markers,
      total: markers.length,
      counts: {
        jobs: markers.filter(m => m.type === 'job').length,
        cvs: markers.filter(m => m.type === 'cv').length,
        gold: markers.filter(m => m.type === 'gold').length,
        adzuna: markers.filter(m => m.type === 'adzuna').length
      }
    });

  } catch (error) {
    console.error('Markers API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Veriler yüklenirken hata oluştu',
        markers: [],
        total: 0,
        counts: { jobs: 0, cvs: 0, gold: 0, adzuna: 0 }
      },
      { status: 500 }
    );
  }
}
