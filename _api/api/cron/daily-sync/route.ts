
import { NextRequest, NextResponse } from 'next/server';
import { AdzunaService } from '@/lib/adzuna';

export const dynamic = 'force-dynamic';

// Daily sync cron job - should be called by external cron service
export async function GET(req: NextRequest) {
  try {
    // Simple auth check - you can replace with proper auth
    const authHeader = req.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET || 'your-cron-secret';
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting daily Adzuna sync...');
    
    const adzunaService = new AdzunaService();
    const result = await adzunaService.syncRecentJobs(24); // Last 24 hours
    
    console.log('Daily sync completed:', result.summary);
    
    return NextResponse.json({
      success: true,
      message: 'Daily sync completed successfully',
      timestamp: new Date().toISOString(),
      ...result
    });

  } catch (error: any) {
    console.error('Daily sync cron error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Daily sync failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Manual trigger for testing
export async function POST(req: NextRequest) {
  try {
    const { hours = 24 } = await req.json();
    
    console.log(`Manual sync triggered for last ${hours} hours`);
    
    const adzunaService = new AdzunaService();
    const result = await adzunaService.syncRecentJobs(hours);
    
    return NextResponse.json({
      success: true,
      message: `Manual sync completed for ${hours} hours`,
      timestamp: new Date().toISOString(),
      ...result
    });

  } catch (error: any) {
    console.error('Manual sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Manual sync failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
