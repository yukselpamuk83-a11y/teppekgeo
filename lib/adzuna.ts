
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Adzuna desteklenen ülkeler
export const ADZUNA_COUNTRIES = [
  'au', 'at', 'be', 'br', 'ca', 'fr', 'de', 'in', 'it', 
  'mx', 'nl', 'nz', 'pl', 'ru', 'sg', 'za', 'es', 'ch', 'uk', 'us'
];

// Memory cache for job data (bucket system)
export class JobBucket {
  private static instance: JobBucket;
  private cache: Map<string, any[]> = new Map();
  private lastUpdate: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): JobBucket {
    if (!JobBucket.instance) {
      JobBucket.instance = new JobBucket();
    }
    return JobBucket.instance;
  }

  async getJobs(filters: {
    country?: string;
    category?: string;
    location?: string;
    salaryMin?: number;
    search?: string;
  } = {}): Promise<any[]> {
    const cacheKey = JSON.stringify(filters);
    const now = Date.now();
    
    // Check if cache is still valid
    if (this.cache.has(cacheKey)) {
      const lastUpdate = this.lastUpdate.get(cacheKey) || 0;
      if (now - lastUpdate < this.CACHE_DURATION) {
        return this.cache.get(cacheKey) || [];
      }
    }

    // Fetch from database
    const jobs = await this.fetchFromDatabase(filters);
    
    // Update cache
    this.cache.set(cacheKey, jobs);
    this.lastUpdate.set(cacheKey, now);
    
    return jobs;
  }

  private async fetchFromDatabase(filters: any): Promise<any[]> {
    const where: any = {
      isActive: true
    };

    if (filters.country) {
      where.country = filters.country;
    }

    if (filters.category) {
      where.category = { contains: filters.category, mode: 'insensitive' };
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.salaryMin) {
      where.salaryMin = { gte: filters.salaryMin };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return await prisma.adzunaJob.findMany({
      where,
      orderBy: [
        { adzunaCreated: 'desc' }
      ],
      take: 1000 // Limit for performance
    });
  }

  clearCache(): void {
    this.cache.clear();
    this.lastUpdate.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Adzuna API Service
export class AdzunaService {
  private readonly baseUrl = 'https://api.adzuna.com';
  private readonly appId = process.env.ADZUNA_APP_ID;
  private readonly appKey = process.env.ADZUNA_APP_KEY;

  constructor() {
    if (!this.appId || !this.appKey) {
      throw new Error('Adzuna API credentials are missing. Please set ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables.');
    }
  }

  async searchJobs(country: string, options: {
    page?: number;
    resultsPerPage?: number;
    what?: string;
    where?: string;
    salaryMin?: number;
    salaryMax?: number;
    maxDaysOld?: number;
    sortBy?: 'relevance' | 'date' | 'salary';
    category?: string;
  } = {}): Promise<any> {
    const {
      page = 1,
      resultsPerPage = 50,
      what = '',
      where = '',
      salaryMin,
      salaryMax,
      maxDaysOld = 20,
      sortBy = 'date',
      category
    } = options;

    const params = new URLSearchParams({
      app_id: this.appId!,
      app_key: this.appKey!,
      results_per_page: resultsPerPage.toString(),
      what,
      where,
      sort_by: sortBy,
      max_days_old: maxDaysOld.toString()
    });

    if (salaryMin) params.append('salary_min', salaryMin.toString());
    if (salaryMax) params.append('salary_max', salaryMax.toString());
    if (category) params.append('category', category);

    const url = `${this.baseUrl}/v1/api/jobs/${country}/search/${page}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Harita-Is-Ilanlari/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Adzuna API fetch error for ${country}:`, error);
      throw error;
    }
  }

  async fetchAndSaveJobs(country: string, days: number = 20): Promise<{
    success: boolean;
    total: number;
    saved: number;
    errors: string[];
  }> {
    const results = {
      success: true,
      total: 0,
      saved: 0,
      errors: [] as string[]
    };

    try {
      let page = 1;
      let hasMorePages = true;
      const maxPages = 20; // Safety limit

      while (hasMorePages && page <= maxPages) {
        try {
          const data = await this.searchJobs(country, {
            page,
            resultsPerPage: 50,
            maxDaysOld: days,
            sortBy: 'date'
          });

          if (!data.results || data.results.length === 0) {
            hasMorePages = false;
            break;
          }

          // Filter only jobs with salary information
          const jobsWithSalary = data.results.filter((job: any) => 
            job.salary_min || job.salary_max
          );

          results.total += jobsWithSalary.length;

          // Save to database
          for (const job of jobsWithSalary) {
            try {
              await this.saveJobToDatabase(job, country);
              results.saved++;
            } catch (error: any) {
              if (!error.message.includes('Unique constraint')) {
                results.errors.push(`Error saving job ${job.id}: ${error.message}`);
              }
              // Ignore duplicate entries
            }
          }

          // Check if there are more pages
          hasMorePages = data.results.length === 50 && page < (data.count / 50);
          page++;

          // Rate limiting - wait 100ms between requests
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error: any) {
          results.errors.push(`Page ${page} error: ${error.message}`);
          break;
        }
      }

    } catch (error: any) {
      results.success = false;
      results.errors.push(`General error: ${error.message}`);
    }

    return results;
  }

  private async saveJobToDatabase(job: any, country: string): Promise<void> {
    try {
      // İş türünü belirle
      const jobTypeMap: Record<string, string> = {
        'permanent': 'Full-time',
        'contract': 'Contract',
        'part_time': 'Part-time',
        'temporary': 'Temporary'
      };

      // Deneyim seviyesini belirle
      const experienceMap: Record<string, string> = {
        'graduate': 'Entry',
        'apprentice': 'Entry', 
        'junior': 'Entry',
        'senior': 'Senior',
        'experienced': 'Mid-level',
        'manager': 'Senior',
        'executive': 'Senior'
      };

      // Son geçerlilik tarihi - 30 gün sonrası
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await prisma.adzunaJob.create({
        data: {
          adzunaId: job.id.toString(),
          title: job.title || 'No title',
          description: job.description || '',
          company: job.company?.display_name || 'Unknown Company',
          location: job.location?.display_name || '',
          latitude: job.latitude || null,
          longitude: job.longitude || null,
          
          // Maaş bilgileri
          salaryMin: job.salary_min || null,
          salaryMax: job.salary_max || null,
          salaryCurrency: job.salary_currency || null,
          
          // İş detayları
          jobType: jobTypeMap[job.contract_type] || job.contract_type || null,
          sector: job.category?.label || null,
          experience: experienceMap[job.seniority_level] || job.seniority_level || null,
          
          // Kategori ve ülke
          category: job.category?.label || null,
          country: country,
          
          // İletişim bilgileri
          contactEmail: null, // Adzuna genelde email vermiyor
          contactPhone: null, // Adzuna genelde telefon vermiyor
          applyUrl: job.redirect_url || '',
          redirectUrl: job.redirect_url || '',
          
          // Zaman bilgileri
          adzunaCreated: new Date(job.created),
          expiresAt: expiresAt,
          
          // Durum
          isActive: true,
          isPremium: job.salary_is_predicted === false && job.adref ? true : false // Sponsored jobs
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Unique constraint violation - job already exists
        return;
      }
      throw error;
    }
  }

  async syncAllCountries(days: number = 20): Promise<{
    success: boolean;
    results: Record<string, any>;
    summary: {
      totalJobs: number;
      totalSaved: number;
      totalErrors: number;
    };
  }> {
    const syncResults: Record<string, any> = {};
    const summary = {
      totalJobs: 0,
      totalSaved: 0,
      totalErrors: 0
    };

    console.log(`Starting sync for ${ADZUNA_COUNTRIES.length} countries (${days} days)...`);

    for (const country of ADZUNA_COUNTRIES) {
      console.log(`Syncing ${country}...`);
      
      try {
        const result = await this.fetchAndSaveJobs(country, days);
        syncResults[country] = result;
        
        summary.totalJobs += result.total;
        summary.totalSaved += result.saved;
        summary.totalErrors += result.errors.length;
        
        console.log(`${country}: ${result.saved}/${result.total} jobs saved`);
        
        // Rate limiting between countries
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error: any) {
        console.error(`Failed to sync ${country}:`, error);
        syncResults[country] = {
          success: false,
          total: 0,
          saved: 0,
          errors: [error.message]
        };
        summary.totalErrors++;
      }
    }

    // Clear cache after sync
    JobBucket.getInstance().clearCache();

    console.log(`Sync completed. Total: ${summary.totalSaved}/${summary.totalJobs} jobs saved`);

    return {
      success: summary.totalErrors < ADZUNA_COUNTRIES.length,
      results: syncResults,
      summary
    };
  }

  async syncRecentJobs(hours: number = 24): Promise<any> {
    const days = Math.max(1, Math.ceil(hours / 24));
    return await this.syncAllCountries(days);
  }
}
