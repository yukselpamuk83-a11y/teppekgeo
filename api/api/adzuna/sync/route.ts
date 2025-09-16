
import { NextRequest, NextResponse } from 'next/server';
import { AdzunaService } from '@/lib/adzuna';


// Initial sync - 20 days data
export async function POST(req: NextRequest) {
  try {
    const { days = 20 } = await req.json();
    
    const adzunaService = new AdzunaService();
    const result = await adzunaService.syncAllCountries(days);
    
    return NextResponse.json({
      message: `Adzuna sync completed for ${days} days`,
      ...result
    });

  } catch (error: any) {
    console.error('Adzuna sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Sync failed',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Daily sync - recent jobs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    
    const adzunaService = new AdzunaService();
    const result = await adzunaService.syncRecentJobs(hours);
    
    return NextResponse.json({
      message: `Daily sync completed for last ${hours} hours`,
      ...result
    });

  } catch (error: any) {
    console.error('Daily sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Daily sync failed',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
