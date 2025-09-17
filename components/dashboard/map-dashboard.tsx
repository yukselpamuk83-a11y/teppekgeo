
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { MapMarker } from '@/lib/types';
import WorldMap from '@/components/map/world-map';
import { DashboardSidebar } from './dashboard-sidebar';
import { ListingsSidebar } from './listings-sidebar';
import { TopNavigation } from './top-navigation';
import { ListingDetailModal } from '@/components/modals/listing-detail-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function MapDashboard() {
  const [allMarkers, setAllMarkers] = useState<MapMarker[]>([]); // Tüm markerlar
  const [markers, setMarkers] = useState<MapMarker[]>([]); // Filtrelenmiş markerlar
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>();
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isListingsOpen, setIsListingsOpen] = useState(false); // İlanları default olarak kapalı yap
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.9334, 32.8597]);
  const [mapZoom, setMapZoom] = useState(6);
  const [loading, setLoading] = useState(true);
  const [currentBounds, setCurrentBounds] = useState<string>('');
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; marker?: MapMarker }>({ 
    isOpen: false 
  });
  const [performanceStats, setPerformanceStats] = useState<any>(null);

  const [dashboardInitialTab, setDashboardInitialTab] = useState<'overview' | 'filters' | 'add'>('overview');
  
  // Filtreler için state
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    jobTypes: { job: true, cv: true, gold: true, adzuna: true },
    sector: '',
    experience: '',
    workType: '',
    dateRange: ''
  });



  // API'den veri çekme fonksiyonu - debounced with performance optimization
  const fetchMarkersFromAPI = useCallback(
    debounce(async (filters: typeof activeFilters, bounds?: string, zoom?: number) => {
      try {
        setLoading(true);
        const startTime = Date.now();
        
        // API parametrelerini oluştur - Performance optimized
        const params = new URLSearchParams();
        
        // Viewport-based loading with zoom-based limits
        if (bounds) {
          params.set('bounds', bounds);
        }
        if (zoom !== undefined) {
          params.set('zoom', zoom.toString());
          // Dynamic limit based on zoom level for performance
          const limit = zoom > 12 ? 2000 : zoom > 8 ? 1000 : 500;
          params.set('limit', limit.toString());
        }
        
        // Filtreleme parametreleri
        if (filters.search) {
          params.set('search', filters.search);
        }
        
        const activeTypes = Object.entries(filters.jobTypes)
          .filter(([_, isActive]) => isActive)
          .map(([type, _]) => type);
        
        if (activeTypes.length > 0 && activeTypes.length < 4) {
          params.set('type', activeTypes.join(','));
        }
        
        if (filters.sector) {
          params.set('sector', filters.sector);
        }
        if (filters.experience) {
          params.set('experience', filters.experience);
        }
        if (filters.workType) {
          params.set('workType', filters.workType);
        }
        if (filters.dateRange) {
          params.set('dateRange', filters.dateRange);
        }
        
        const response = await fetch(`/api/markers?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          const markersData = data.markers || [];
          
          setAllMarkers(markersData);
          setMarkers(markersData);
          
          // Performance statistics
          if (data.performance) {
            setPerformanceStats(data.performance);
            const loadTime = Date.now() - startTime;
            console.log(`Performance Stats:`, {
              ...data.performance,
              clientLoadTime: loadTime,
              markersLoaded: markersData.length
            });
          }
          
          if (filters.search || filters.sector || filters.experience || filters.workType || filters.dateRange) {
            toast.success(`${markersData.length} ilan bulundu`, {
              description: data.performance ? `${data.performance.queryTime.toFixed(0)}ms` : ''
            });
          }
        }
      } catch (error) {
        console.error('API fetch error:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Filtreleme fonksiyonu - server-side with client-side performance
  const applyFilters = (filters: typeof activeFilters) => {
    setActiveFilters(filters);
    fetchMarkersFromAPI(filters, currentBounds, mapZoom);
  };

  // Filtreleri sıfırla
  const clearFilters = () => {
    const resetFilters = {
      search: '',
      jobTypes: { job: true, cv: true, gold: true, adzuna: true },
      sector: '',
      experience: '',
      workType: '',
      dateRange: ''
    };
    setActiveFilters(resetFilters);
    fetchMarkersFromAPI(resetFilters, currentBounds, mapZoom);
    toast.success('Filtreler temizlendi');
  };

  // İlk veri yükleme
  useEffect(() => {
    fetchMarkersFromAPI(activeFilters);
  }, [fetchMarkersFromAPI]);

  // Harita hareket ettiğinde viewport-based loading - Performance optimized
  const handleMapMove = useCallback((center: [number, number], zoom: number) => {
    setMapCenter(center);
    setMapZoom(zoom);
    
    // Bounds hesapla - Performance optimized for different zoom levels
    const latDelta = zoom > 12 ? 0.01 : zoom > 10 ? 0.05 : zoom > 6 ? 0.2 : 1;
    const lngDelta = zoom > 12 ? 0.01 : zoom > 10 ? 0.05 : zoom > 6 ? 0.2 : 1;
    
    const bounds = [
      center[0] - latDelta,
      center[1] - lngDelta,
      center[0] + latDelta,
      center[1] + lngDelta
    ].join(',');
    
    setCurrentBounds(bounds);
    
    // Zoom seviyesi değiştiğinde yeniden yükle (clustering optimization)
    if (Math.abs(mapZoom - zoom) > 1) {
      fetchMarkersFromAPI(activeFilters, bounds, zoom);
    }
  }, [activeFilters, fetchMarkersFromAPI, mapZoom]);

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarkerId(marker.id);
  };

  const handleShowDetails = (marker: MapMarker) => {
    setDetailModal({ isOpen: true, marker });
  };

  const handleApplyJob = (marker: MapMarker) => {
    // Simulated job application
    toast.success('Başvuru gönderiliyor...', {
      description: `${marker.title} pozisyonuna başvuru yapılıyor.`
    });
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Başvuru başarılı!', {
        description: 'Başvurunuz işverene iletildi.'
      });
    }, 2000);
  };

  const handleContactPerson = (marker: MapMarker) => {
    toast.success('İletişim kuruluyor...', {
      description: `${marker.title} ile iletişim kurulacak.`
    });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">
      {/* Üst Navigasyon */}
      <TopNavigation 
        onDashboardToggle={() => {
          if (!isDashboardOpen) {
            setDashboardInitialTab('overview'); // Normal açılışta overview tab
          }
          setIsDashboardOpen(!isDashboardOpen);
          setIsListingsOpen(false);
        }}
        onListingsToggle={() => {
          setIsListingsOpen(!isListingsOpen);
          setIsDashboardOpen(false);
        }}
        isDashboardOpen={isDashboardOpen}
        isListingsOpen={isListingsOpen}
        performanceStats={performanceStats}
      />

      {/* Ana Harita Alanı */}
      <div className="h-full w-full">
        <WorldMap
          markers={markers}
          selectedMarkerId={selectedMarkerId}
          onMarkerClick={handleMarkerClick}
          onMapMove={handleMapMove}
          onShowDetails={handleShowDetails}
          onApplyJob={handleApplyJob}
          onContactPerson={handleContactPerson}
          className="w-full h-full"
        />
      </div>

      {/* Dashboard Sidebar */}
      <AnimatePresence>
        {isDashboardOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-16 left-0 h-[calc(100vh-4rem)] w-96 bg-white shadow-2xl z-[150] border-r border-gray-200"
          >
            <DashboardSidebar 
              onClose={() => setIsDashboardOpen(false)}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              initialTab={dashboardInitialTab}
              onApplyFilters={applyFilters}
              onClearFilters={clearFilters}
              activeFilters={activeFilters}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listings Sidebar with Virtual Scrolling for Performance */}
      <AnimatePresence>
        {isListingsOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-16 right-0 h-[calc(100vh-4rem)] w-96 bg-white shadow-2xl z-[150] border-l border-gray-200"
          >
            <ListingsSidebar 
              markers={markers}
              selectedMarkerId={selectedMarkerId}
              onMarkerSelect={setSelectedMarkerId}
              onClose={() => setIsListingsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Yükleniyor durumu - Performance indicator */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-[95]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto"></div>
            <p className="text-teal-600 font-medium">
              {performanceStats ? `${performanceStats.filteredRecords} ilan yükleniyor...` : 'Harita yükleniyor...'}
            </p>
            {performanceStats && (
              <p className="text-xs text-gray-500">
                Zoom: {performanceStats.zoom} | Query: {performanceStats.queryTime?.toFixed(0)}ms
              </p>
            )}
          </div>
        </div>
      )}

      {/* Performance Stats (Development) */}
      {process.env.NODE_ENV === 'development' && performanceStats && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-[200]">
          <div>Toplam: {performanceStats.totalRecords?.toLocaleString()}</div>
          <div>Görünen: {performanceStats.filteredRecords?.toLocaleString()}</div>
          <div>Query: {performanceStats.queryTime?.toFixed(0)}ms</div>
          <div>Zoom: {performanceStats.zoom}</div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.marker && (
        <ListingDetailModal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ isOpen: false })}
          marker={detailModal.marker}
        />
      )}
    </div>
  );
}
