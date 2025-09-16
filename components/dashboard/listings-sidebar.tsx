
'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapMarker } from '@/lib/types';
import { X, Search, Filter, MapPin, Clock, Building2, User, Star } from 'lucide-react';
import VirtualScrollList from '@/components/ui/virtual-scroll-list';
import { motion, AnimatePresence } from 'framer-motion';

interface ListingsSidebarProps {
  markers: MapMarker[];
  selectedMarkerId?: string;
  onMarkerSelect: (markerId: string) => void;
  onClose: () => void;
}

export function ListingsSidebar({ 
  markers, 
  selectedMarkerId, 
  onMarkerSelect, 
  onClose 
}: ListingsSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'job' | 'cv' | 'gold'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'location' | 'title'>('date');
  
  // Performance: Filter and search with memoization
  const filteredAndSortedMarkers = useMemo(() => {
    let filtered = markers;

    // Type filtering
    if (filterType !== 'all') {
      filtered = filtered.filter(marker => marker.type === filterType);
    }

    // Search filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(marker => 
        marker.title.toLowerCase().includes(term) ||
        marker.data.company?.toLowerCase().includes(term) ||
        marker.data.profession?.toLowerCase().includes(term) ||
        marker.data.location?.toLowerCase().includes(term)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime();
        case 'location':
          return (a.data.location || '').localeCompare(b.data.location || '');
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [markers, filterType, searchTerm, sortBy]);

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'job': return '💼';
      case 'cv': return '👤';
      case 'gold': return '⭐';
      default: return '📍';
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'job': return 'text-teal-600 bg-teal-50';
      case 'cv': return 'text-orange-600 bg-orange-50';
      case 'gold': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 gün önce';
      if (diffDays < 7) return `${diffDays} gün önce`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
      return `${Math.floor(diffDays / 30)} ay önce`;
    } catch {
      return 'Bilinmiyor';
    }
  };

  // Render individual listing item - optimized for virtual scrolling
  const renderListItem = (marker: MapMarker, index: number) => {
    const isSelected = marker.id === selectedMarkerId;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
          isSelected ? 'bg-teal-50 border-teal-200' : ''
        }`}
        onClick={() => onMarkerSelect(marker.id)}
      >
        <div className="flex items-start gap-3">
          {/* Marker Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getMarkerColor(marker.type)}`}>
            {getMarkerIcon(marker.type)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
              {marker.title}
            </h4>
            
            {/* Company/Profession */}
            {(marker.data.company || marker.data.profession) && (
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                {marker.type === 'cv' ? <User className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                <span>{marker.data.company || marker.data.profession}</span>
              </div>
            )}
            
            {/* Location */}
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
              <MapPin className="w-3 h-3" />
              <span>{marker.data.location}</span>
            </div>
            
            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatDate(marker.data.createdAt)}</span>
            </div>
            
            {/* Salary for jobs */}
            {marker.data.salary && (
              <div className="mt-2">
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {marker.data.salary}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">İlanlar</h2>
          <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded-full">
            {filteredAndSortedMarkers.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="İlan ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterType === 'all' 
                ? 'bg-teal-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterType('job')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterType === 'job' 
                ? 'bg-teal-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            💼 İş İlanı
          </button>
          <button
            onClick={() => setFilterType('cv')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterType === 'cv' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            👤 CV
          </button>
          <button
            onClick={() => setFilterType('gold')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterType === 'gold' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ⭐ Gold
          </button>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'location' | 'title')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        >
          <option value="date">Tarihe Göre</option>
          <option value="location">Konuma Göre</option>
          <option value="title">İsme Göre</option>
        </select>
      </div>

      {/* Listings with Virtual Scrolling for Performance */}
      <div className="flex-1 overflow-hidden">
        {filteredAndSortedMarkers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Filter className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-center">
              {searchTerm || filterType !== 'all' ? 'Filtrelere uygun ilan bulunamadı' : 'Henüz ilan bulunmuyor'}
            </p>
          </div>
        ) : (
          <VirtualScrollList
            items={filteredAndSortedMarkers}
            itemHeight={120} // Approximate height per item
            containerHeight={600} // Available height
            renderItem={renderListItem}
            overscan={10}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}
