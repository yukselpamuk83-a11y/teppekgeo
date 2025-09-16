
import { NextRequest, NextResponse } from 'next/server';
import { JobBucket } from '@/lib/adzuna';


// GET: Fetch Adzuna jobs from bucket/cache
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const salaryMin = searchParams.get('salaryMin');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const bucket = JobBucket.getInstance();
    
    const filters: any = {};
    if (country) filters.country = country;
    if (category) filters.category = category;
    if (location) filters.location = location;
    if (salaryMin) filters.salaryMin = parseInt(salaryMin);
    if (search) filters.search = search;

    const allJobs = await bucket.getJobs(filters);
    
    // Pagination
    const skip = (page - 1) * limit;
    const jobs = allJobs.slice(skip, skip + limit);
    
    // Format for map markers
    const markers = jobs.map(job => ({
      id: job.id,
      type: 'adzuna',
      lat: job.latitude,
      lng: job.longitude,
      position: [job.latitude, job.longitude],
      title: job.title,
      data: {
        ...job,
        salary: job.salaryMin && job.salaryMax 
          ? `${job.salaryMin} - ${job.salaryMax} ${job.salaryCurrency || ''}`
          : job.salaryMin 
          ? `${job.salaryMin}+ ${job.salaryCurrency || ''}`
          : job.salaryMax 
          ? `Up to ${job.salaryMax} ${job.salaryCurrency || ''}`
          : 'Salary not specified'
      }
    })).filter(job => job.lat && job.lng); // Only jobs with location

    return NextResponse.json({
      success: true,
      jobs: markers,
      total: allJobs.length,
      page,
      limit,
      totalPages: Math.ceil(allJobs.length / limit),
      filters,
      cache: bucket.getCacheStats()
    });

  } catch (error: any) {
    console.error('Adzuna jobs API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Adzuna jobs',
        jobs: [],
        total: 0
      },
      { status: 500 }
    );
  }
}
