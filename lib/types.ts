
export interface JobListing {
  id: string;
  title: string;
  description: string;
  company: string;
  position: string;
  location: string;
  latitude: number;
  longitude: number;
  salary?: string | null;
  jobType: string;
  workType?: string;
  sector: string;
  experience: string;
  requirements?: string;
  benefits?: string;
  contactEmail: string;
  contactPhone?: string | null;
  applyUrl?: string | null;
  isActive: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  userId: string;
}

export interface CvListing {
  id: string;
  title: string;
  description: string;
  profession: string;
  skills: string;
  experience: string;
  education?: string;
  languages?: string;
  location: string;
  latitude: number;
  longitude: number;
  contactEmail: string;
  contactPhone?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  isActive: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  userId: string;
}

export interface GoldListing {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  contactEmail: string;
  contactPhone?: string | null;
  phone?: string | null;
  website?: string | null;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  userId: string;
}

export interface Advertisement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  regions: string[];
  impressions: number;
  clicks: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  subscriptionType: string;
  subscriptionEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MarkerType = 'job' | 'cv' | 'gold' | 'adzuna';

export interface MapMarker {
  id: string;
  type: MarkerType;
  lat: number;
  lng: number;
  position: [number, number]; // [lat, lng]
  title: string;
  data: JobListing | CvListing | GoldListing | any;
}
