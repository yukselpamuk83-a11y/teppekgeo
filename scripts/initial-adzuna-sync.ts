
import { AdzunaService } from '../lib/adzuna';
import * as dotenv from 'dotenv';

dotenv.config();

async function initialSync() {
  console.log('🚀 Starting initial Adzuna sync (20 days)...\n');
  console.log('This may take several minutes as we fetch from 19+ countries.');
  console.log('Only jobs with salary information will be stored.\n');
  
  try {
    const adzunaService = new AdzunaService();
    const startTime = Date.now();
    
    const result = await adzunaService.syncAllCountries(20);
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\n📊 SYNC COMPLETED!');
    console.log('===================');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📈 Total jobs processed: ${result.summary.totalJobs}`);
    console.log(`💾 Jobs saved to database: ${result.summary.totalSaved}`);
    console.log(`❌ Errors: ${result.summary.totalErrors}`);
    
    if (result.summary.totalSaved > 0) {
      console.log(`\n✅ Success! ${result.summary.totalSaved} Adzuna jobs are now available in your application.`);
    }
    
    // Show country breakdown
    console.log('\n🌍 Country Breakdown:');
    console.log('====================');
    for (const [country, data] of Object.entries(result.results)) {
      const countryData = data as any;
      console.log(`${country.toUpperCase()}: ${countryData.saved}/${countryData.total} jobs`);
    }
    
    if (result.summary.totalErrors > 0) {
      console.log('\n⚠️  Some errors occurred during sync. Check the logs above for details.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error during sync:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initialSync()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { initialSync };
