
'use client';

import { MapMarker } from '@/lib/types';
import { MapPin, User, Building2, Star, ExternalLink, Globe } from 'lucide-react';

interface MarkerPopupProps {
  marker: MapMarker;
}

export function MarkerPopup({ marker }: MarkerPopupProps) {
  const { type, data } = marker;

  const renderJobListing = (data: any) => (
    <div className="space-y-3">
      <div className="border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-4 h-4 text-teal-600" />
          <span className="font-semibold text-teal-700">İş İlanı</span>
        </div>
        <h3 className="font-bold text-gray-800">{marker.title}</h3>
        <p className="text-sm font-medium text-teal-600">{data.company}</p>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">{data.location}</span>
        </div>
        
        <p className="text-gray-600 line-clamp-3">{data.description}</p>
        
        <div className="space-y-2">
          <div>
            <span className="text-xs text-gray-500">Pozisyon:</span>
            <p className="text-sm font-medium">{data.position}</p>
          </div>
          {data.salary && (
            <div>
              <span className="text-xs text-gray-500">Maaş:</span>
              <p className="text-sm font-medium text-green-600">{data.salary}</p>
            </div>
          )}
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
            İş İlanı
          </span>
        </div>
      </div>
    </div>
  );

  const renderCvListing = (data: any) => (
    <div className="space-y-3">
      <div className="border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-orange-600" />
          <span className="font-semibold text-orange-700">CV/Tanıtım</span>
        </div>
        <h3 className="font-bold text-gray-800">{marker.title}</h3>
        <p className="text-sm font-medium text-orange-600">{data.profession}</p>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">{data.location}</span>
        </div>
        
        <p className="text-gray-600 line-clamp-3">{data.description}</p>
        
        <div className="space-y-2">
          {data.skills && (
            <div>
              <span className="text-xs text-gray-500">Beceriler:</span>
              <p className="text-sm">{data.skills}</p>
            </div>
          )}
          
          <div>
            <span className="text-xs text-gray-500">Deneyim:</span>
            <p className="text-sm font-medium">{data.experience}</p>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            CV/Tanıtım
          </span>
        </div>
      </div>
    </div>
  );

  const renderGoldListing = (data: any) => (
    <div className="space-y-3">
      <div className="border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-4 h-4 text-yellow-600" />
          <span className="font-semibold text-yellow-700">Gold İlan</span>
        </div>
        <h3 className="font-bold text-gray-800">{marker.title}</h3>
        <p className="text-sm font-medium text-yellow-600">{data.position || data.company}</p>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">{data.location}</span>
        </div>
        
        <p className="text-gray-600 line-clamp-3">{data.description}</p>
        
        <div className="space-y-2">
          {data.company && (
            <div>
              <span className="text-xs text-gray-500">Şirket:</span>
              <p className="text-sm font-medium">{data.company}</p>
            </div>
          )}
          
          {data.salary && (
            <div>
              <span className="text-xs text-gray-500">Maaş:</span>
              <p className="text-sm font-medium text-green-600">{data.salary}</p>
            </div>
          )}
          
          {data.priority && (
            <div>
              <span className="text-xs text-gray-500">Öncelik:</span>
              <p className="text-sm font-medium text-yellow-600">{data.priority}</p>
            </div>
          )}
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            ⭐ Gold İlan
          </span>
        </div>
      </div>
    </div>
  );

  const renderAdzunaJob = (data: any) => (
    <div className="space-y-3">
      <div className="border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-700">Adzuna İş İlanı</span>
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full ml-auto">
            {data.country?.toUpperCase()}
          </span>
        </div>
        <h3 className="font-bold text-gray-800">{marker.title}</h3>
        <p className="text-sm font-medium text-blue-600">{data.company}</p>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">{data.location}</span>
        </div>
        
        <p className="text-gray-600 line-clamp-3">
          {data.description?.replace(/<[^>]*>/g, '') || 'İlan detayları...'}
        </p>
        
        <div className="space-y-2">
          {data.category && (
            <div>
              <span className="text-xs text-gray-500">Kategori:</span>
              <p className="text-sm font-medium">{data.category}</p>
            </div>
          )}
          
          <div>
            <span className="text-xs text-gray-500">Maaş:</span>
            <p className="text-sm font-medium text-green-600">{data.salary}</p>
          </div>
          
          <div>
            <span className="text-xs text-gray-500">Kaynak:</span>
            <p className="text-sm font-medium text-blue-600">{data.source}</p>
          </div>
        </div>
        
        {data.redirectUrl && (
          <div className="pt-2 border-t border-gray-100">
            <a 
              href={data.redirectUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              İlanı Görüntüle
            </a>
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-100">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            🌍 Adzuna İlanı
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-w-[280px] max-w-[300px]">
      {type === 'job' && renderJobListing(data)}
      {type === 'cv' && renderCvListing(data)}
      {type === 'gold' && renderGoldListing(data)}
      {type === 'adzuna' && renderAdzunaJob(data)}
    </div>
  );
}
