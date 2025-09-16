
'use client';

import { useEffect, useRef, useState } from 'react';
import { MapMarker } from '@/lib/types';
import { MapPin, Globe, Loader2 } from 'lucide-react';

interface LeafletMapProps {
  markers: MapMarker[];
  selectedMarkerId?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapMove?: (center: [number, number], zoom: number) => void;
  onShowDetails?: (marker: MapMarker) => void;
  onApplyJob?: (marker: MapMarker) => void;
  onContactPerson?: (marker: MapMarker) => void;
}

export default function LeafletMap({ 
  markers, 
  selectedMarkerId, 
  onMarkerClick, 
  onMapMove,
  onShowDetails,
  onApplyJob,
  onContactPerson
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const markerClusterGroupRef = useRef<any>(null);
  const [mapLayers, setMapLayers] = useState<'street' | 'satellite'>('street');
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [leafletLibs, setLeafletLibs] = useState<any>(null);

  // Global popup fonksiyonlarını tanımla
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Global fonksiyonları window object'ine ekle
    (window as any).applyToJob = (markerId: string) => {
      const marker = markers.find(m => m.id === markerId);
      if (marker && onApplyJob) {
        onApplyJob(marker);
      }
    };

    (window as any).viewJobDetails = (markerId: string) => {
      const marker = markers.find(m => m.id === markerId);
      if (marker && onShowDetails) {
        onShowDetails(marker);
      }
    };

    (window as any).contactPerson = (markerId: string) => {
      const marker = markers.find(m => m.id === markerId);
      if (marker && onContactPerson) {
        onContactPerson(marker);
      }
    };

    (window as any).viewCvDetails = (markerId: string) => {
      const marker = markers.find(m => m.id === markerId);
      if (marker && onShowDetails) {
        onShowDetails(marker);
      }
    };

    // Cleanup fonksiyonu
    return () => {
      delete (window as any).applyToJob;
      delete (window as any).viewJobDetails;
      delete (window as any).contactPerson;
      delete (window as any).viewCvDetails;
    };
  }, [markers, onApplyJob, onShowDetails, onContactPerson]);

  // Map initialization - sadece bir kez çalışır
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    if (mapInstanceRef.current) return; // Zaten initialize edilmişse çık

    let isMounted = true;

    const initializeMap = async () => {
      try {
        const L = await import('leaflet');
        
        // MarkerCluster kütüphanesini yükle
        await import('leaflet.markercluster');
        const MarkerClusterGroup = (L as any).MarkerClusterGroup;
        
        // CSS'i yükle
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // MarkerCluster CSS'i yükle
        if (!document.querySelector('link[href*="MarkerCluster.css"]')) {
          const clusterLink = document.createElement('link');
          clusterLink.rel = 'stylesheet';
          clusterLink.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
          document.head.appendChild(clusterLink);
        }

        // MarkerCluster Default CSS'i yükle
        if (!document.querySelector('link[href*="MarkerCluster.Default.css"]')) {
          const clusterDefaultLink = document.createElement('link');
          clusterDefaultLink.rel = 'stylesheet';
          clusterDefaultLink.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
          document.head.appendChild(clusterDefaultLink);
        }

        // Icon fix
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Container hazırla
        if (mapRef.current && !(mapRef.current as any)._leaflet_id) {
          const container = mapRef.current;
          container.innerHTML = '';
          container.style.height = '100%';
          container.style.width = '100%';
          
          const map = L.map(container).setView([39.9334, 32.8597], 6);
          
          // Dünya sınırları
          const worldBounds = L.latLngBounds([-85, -180], [85, 180]);
          map.setMaxBounds(worldBounds);
          map.options.minZoom = 2;
          map.options.maxZoom = 18;

          // Performance optimizations
          (map.options as any).preferCanvas = true; // Canvas rendering for better performance
          (map.options as any).tap = false; // Disable tap handler on mobile for performance

          // Tile layer - OpenStreetMap sokak görünümü
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            noWrap: true,
            maxZoom: 19,
            keepBuffer: 2 // Performance optimization
          }).addTo(map);

          // Map move event for viewport-based loading
          map.on('moveend zoomend', () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            if (onMapMove) {
              onMapMove([center.lat, center.lng], zoom);
            }
          });

          if (isMounted) {
            mapInstanceRef.current = map;
            setLeafletLibs({ L, MarkerClusterGroup });
            setIsMapReady(true);
          }
        }

      } catch (error) {
        console.error('Harita yüklenirken hata:', error);
      }
    };

    const timeoutId = setTimeout(initializeMap, 10);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [onMapMove]);

  // Tile layer değiştirme
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !leafletLibs) return;

    const updateTileLayer = async () => {
      try {
        const { L } = leafletLibs;
        
        // Mevcut tile layer'ları kaldır
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer.options && layer.options.attribution) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        // Yeni tile layer ekle
        const tileUrl = mapLayers === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        const attribution = mapLayers === 'satellite'
          ? '&copy; <a href="http://www.esri.com/">Esri</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

        L.tileLayer(tileUrl, {
          attribution: attribution,
          noWrap: true,
          maxZoom: mapLayers === 'satellite' ? 18 : 19,
          keepBuffer: 2 // Performance optimization
        }).addTo(mapInstanceRef.current);

      } catch (error) {
        console.error('Tile layer güncellenirken hata:', error);
      }
    };

    updateTileLayer();
  }, [mapLayers, isMapReady, leafletLibs]);

  // Marker'ları güncelle - Clustering ile performans optimizasyonu
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !leafletLibs || !markers) return;

    const updateMarkers = async () => {
      try {
        const { L, MarkerClusterGroup } = leafletLibs;

        // Mevcut marker cluster group'u temizle
        if (markerClusterGroupRef.current) {
          mapInstanceRef.current.removeLayer(markerClusterGroupRef.current);
          markerClusterGroupRef.current = null;
        }

        // Performans: Çok fazla marker varsa clustering kullan
        const usesClustering = markers.length > 100;

        if (usesClustering) {
          // Marker Cluster Group oluştur - 100K+ ilan için optimize edilmiş
          markerClusterGroupRef.current = new MarkerClusterGroup({
            chunkedLoading: true, // Büyük veri setleri için
            chunkProgress: (processed: number, total: number) => {
              // İsteğe bağlı: Progress bar gösterilebilir
              // console.log(`Processing markers: ${processed}/${total}`);
            },
            maxClusterRadius: 50, // Cluster yarıçapı
            iconCreateFunction: function(cluster: any) {
              const count = cluster.getChildCount();
              let className = 'marker-cluster-small';
              let size = 40;
              
              if (count < 10) {
                className = 'marker-cluster-small';
                size = 40;
              } else if (count < 100) {
                className = 'marker-cluster-medium';
                size = 50;
              } else {
                className = 'marker-cluster-large';
                size = 60;
              }

              return L.divIcon({
                html: `<div style="
                  width: ${size}px;
                  height: ${size}px;
                  background: linear-gradient(135deg, #14b8a6, #0f766e);
                  border: 3px solid white;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: ${size > 50 ? '16px' : '14px'};
                  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                  cursor: pointer;
                ">${count}</div>`,
                className: className,
                iconSize: [size, size]
              });
            }
          });
        }

        // Marker'ları batch halinde işle - Memory optimization
        const batchSize = 500;
        const totalBatches = Math.ceil(markers.length / batchSize);

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          const start = batchIndex * batchSize;
          const end = Math.min(start + batchSize, markers.length);
          const batch = markers.slice(start, end);

          batch.forEach((marker) => {
            if (!marker.position || marker.position.length !== 2) return;

            const colors = {
              job: '#14b8a6',
              cv: '#f97316', 
              gold: '#eab308',
              adzuna: '#3b82f6'
            };

            const color = colors[marker.type as keyof typeof colors] || '#6b7280';
            const isSelected = marker.id === selectedMarkerId;
            const size = isSelected ? 30 : 20;

            // Optimized marker için daha basit HTML - Performance
            const customIcon = L.divIcon({
              className: 'custom-div-icon',
              html: `
                <div style="
                  width: ${size}px;
                  height: ${size}px;
                  border-radius: 50%;
                  background-color: ${color};
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  cursor: pointer;
                "></div>
              `,
              iconSize: [size, size],
              iconAnchor: [size/2, size/2],
            });

            const leafletMarker = L.marker(marker.position, { icon: customIcon });

            // Popup içeriği - lazy loading
            leafletMarker.on('click', (e: any) => {
              e.originalEvent?.stopPropagation();
              
              // Popup content'i tıklama anında oluştur - Memory optimization
              const popupContent = createPopupContent(marker);
              leafletMarker.bindPopup(popupContent, {
                maxWidth: 300,
                minWidth: 250,
                className: 'custom-popup',
                closeButton: true,
                autoClose: false
              }).openPopup();

              if (onMarkerClick) {
                onMarkerClick(marker);
              }
            });

            // Clustering kullan veya direkt haritaya ekle
            if (usesClustering && markerClusterGroupRef.current) {
              markerClusterGroupRef.current.addLayer(leafletMarker);
            } else {
              leafletMarker.addTo(mapInstanceRef.current);
            }
          });

          // Batch arasında küçük bir bekle - UI responsiveness için
          if (batchIndex < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }

        // Cluster group'u haritaya ekle
        if (usesClustering && markerClusterGroupRef.current) {
          mapInstanceRef.current.addLayer(markerClusterGroupRef.current);
        }

      } catch (error) {
        console.error('Marker\'lar güncellenirken hata:', error);
      }
    };

    updateMarkers();
  }, [markers, selectedMarkerId, onMarkerClick, isMapReady, leafletLibs]);

  // Kullanıcının konumuna git
  const handleGoToUserLocation = () => {
    if (!mapInstanceRef.current || !navigator.geolocation) {
      alert('Konum servisi desteklenmiyor veya izin verilmedi.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapInstanceRef.current.setView([latitude, longitude], 15);
        setIsLocating(false);
      },
      (error) => {
        console.error('Konum alınırken hata:', error);
        let message = 'Konum alınamadı.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = 'Konum erişimi reddedildi. Lütfen tarayıcı ayarlarından izin verin.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Konum bilgisi mevcut değil.';
            break;
          case error.TIMEOUT:
            message = 'Konum alma işlemi zaman aşımına uğradı.';
            break;
        }
        
        alert(message);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Dünya görünümüne git
  const handleGoToWorldView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([20, 0], 2);
  };

  const createPopupContent = (marker: MapMarker) => {
    const { type, data, title } = marker;
    
    let content = `
      <div style="padding: 16px; max-width: 300px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <h3 style="margin: 0 0 12px 0; font-size: 17px; font-weight: bold; color: #1f2937; line-height: 1.3;">
          ${title}
        </h3>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; display: flex; align-items: center;">
          📍 ${data.location}
        </p>
    `;

    if (type === 'job') {
      content += `
        <div style="margin-bottom: 12px; background-color: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #14b8a6;">
          <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Şirket:</strong> ${data.company || 'Belirtilmemiş'}</p>
          <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Pozisyon:</strong> ${data.position || 'Belirtilmemiş'}</p>
          ${data.salary ? `<p style="margin: 0; font-size: 14px; color: #059669; font-weight: 600;"><strong>Maaş:</strong> ${data.salary}</p>` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span style="background-color: #e6fffa; color: #0f766e; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
            💼 İş İlanı
          </span>
        </div>
      `;
    } else if (type === 'cv') {
      content += `
        <div style="margin-bottom: 12px; background-color: #fef7ed; padding: 12px; border-radius: 8px; border-left: 4px solid #f97316;">
          <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Meslek:</strong> ${data.profession || 'Belirtilmemiş'}</p>
          <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Deneyim:</strong> ${data.experience || 'Belirtilmemiş'}</p>
          ${data.skills ? `<p style="margin: 0; font-size: 14px;"><strong>Beceriler:</strong> ${data.skills}</p>` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span style="background-color: #fed7aa; color: #c2410c; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
            👤 CV/Tanıtım
          </span>
        </div>
      `;
    } else if (type === 'gold') {
      content += `
        <div style="margin-bottom: 12px; background-color: #fefbeb; padding: 12px; border-radius: 8px; border-left: 4px solid #eab308;">
          <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Şirket:</strong> ${data.company || 'Belirtilmemiş'}</p>
          ${data.salary ? `<p style="margin: 0 0 6px 0; font-size: 14px; color: #059669; font-weight: 600;"><strong>Maaş:</strong> ${data.salary}</p>` : ''}
          ${data.priority ? `<p style="margin: 0; font-size: 14px; color: #d97706; font-weight: 600;"><strong>Öncelik:</strong> ${data.priority}</p>` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span style="background-color: #fef3c7; color: #d97706; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
            ⭐ Gold İlan
          </span>
        </div>
      `;
    } else if (type === 'adzuna') {
      content += `
        <div style="margin-bottom: 12px; background-color: #eff6ff; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Şirket:</strong> ${data.company || 'Belirtilmemiş'}</p>
          <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Konum:</strong> ${data.country ? data.country.toUpperCase() : ''} - ${data.location}</p>
          ${data.salary ? `<p style="margin: 0 0 6px 0; font-size: 14px; color: #059669; font-weight: 600;"><strong>Maaş:</strong> ${data.salary}</p>` : ''}
          ${data.category ? `<p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Kategori:</strong> ${data.category}</p>` : ''}
          ${data.jobType ? `<p style="margin: 0 0 6px 0; font-size: 14px;"><strong>İş Türü:</strong> ${data.jobType}</p>` : ''}
          ${data.experience ? `<p style="margin: 0; font-size: 14px;"><strong>Deneyim:</strong> ${data.experience}</p>` : ''}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span style="background-color: #dbeafe; color: #1d4ed8; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
            🌍 Global İş İlanı (Adzuna)
          </span>
        </div>
      `;
    }

    if (data.description) {
      content += `
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280; line-height: 1.5; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
          ${data.description.length > 120 ? data.description.substring(0, 120) + '...' : data.description}
        </p>
      `;
    }

    // Butonları ekle
    if (type === 'job' || type === 'gold' || type === 'adzuna') {
      content += `
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <button 
            onclick="applyToJob('${marker.id}')" 
            style="
              flex: 1;
              background-color: #14b8a6;
              color: white;
              border: none;
              padding: 10px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: background-color 0.2s;
            "
            onmouseover="this.style.backgroundColor='#0f766e'"
            onmouseout="this.style.backgroundColor='#14b8a6'"
          >
            ${type === 'adzuna' ? '🌍 Adzuna\'da Başvur' : '💼 İlana Başvur'}
          </button>
          <button 
            onclick="viewJobDetails('${marker.id}')"
            style="
              background-color: #f3f4f6;
              color: #374151;
              border: 1px solid #d1d5db;
              padding: 10px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            "
            onmouseover="this.style.backgroundColor='#e5e7eb'"
            onmouseout="this.style.backgroundColor='#f3f4f6'"
          >
            📄 Detaylar
          </button>
        </div>
      `;
    } else if (type === 'cv') {
      content += `
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <button 
            onclick="contactPerson('${marker.id}')" 
            style="
              flex: 1;
              background-color: #f97316;
              color: white;
              border: none;
              padding: 10px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: background-color 0.2s;
            "
            onmouseover="this.style.backgroundColor='#ea580c'"
            onmouseout="this.style.backgroundColor='#f97316'"
          >
            📞 İletişim Kur
          </button>
          <button 
            onclick="viewCvDetails('${marker.id}')"
            style="
              background-color: #f3f4f6;
              color: #374151;
              border: 1px solid #d1d5db;
              padding: 10px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            "
            onmouseover="this.style.backgroundColor='#e5e7eb'"
            onmouseout="this.style.backgroundColor='#f3f4f6'"
          >
            📋 Profil
          </button>
        </div>
      `;
    }

    content += '</div>';
    return content;
  };

  // Cleanup function - Memory leak prevention
  useEffect(() => {
    return () => {
      if (markerClusterGroupRef.current) {
        markerClusterGroupRef.current = null;
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Harita Container */}
      <div 
        ref={mapRef}
        className="w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Desktop Harita Kontrolleri - Sağ alt köşe */}
      <div className="hidden md:block absolute bottom-4 right-4 z-[50] bg-white rounded-lg shadow-lg p-2 space-y-1 min-w-[160px]">
        {/* Katman değiştirme butonları */}
        <button
          onClick={() => setMapLayers('street')}
          className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded transition-colors ${
            mapLayers === 'street' 
              ? 'bg-teal-500 text-white' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>🗺️</span>
          Sokak Görünümü
        </button>
        <button
          onClick={() => setMapLayers('satellite')}
          className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded transition-colors ${
            mapLayers === 'satellite' 
              ? 'bg-teal-500 text-white' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>🛰️</span>
          Uydu Görünümü
        </button>

        {/* Ayırıcı çizgi */}
        <div className="border-t border-gray-200 my-1"></div>

        {/* Konumum butonu */}
        <button
          onClick={handleGoToUserLocation}
          disabled={isLocating}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded transition-colors text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          {isLocating ? 'Konum Alınıyor...' : 'Konumum'}
        </button>

        {/* Dünya görünümü butonu */}
        <button
          onClick={handleGoToWorldView}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded transition-colors text-gray-700 hover:bg-gray-100"
        >
          <Globe className="w-4 h-4" />
          Dünya Görünümü
        </button>


      </div>

      {/* Mobile Harita Kontrolleri - Alt ortada şerit */}
      <div className="md:hidden absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[50]">
        <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-2 py-1.5 gap-1">
          {/* Sokak Görünümü */}
          <button
            onClick={() => setMapLayers('street')}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              mapLayers === 'street' 
                ? 'bg-teal-500 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Sokak Görünümü"
          >
            <span className="text-lg">🗺️</span>
          </button>

          {/* Uydu Görünümü */}
          <button
            onClick={() => setMapLayers('satellite')}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              mapLayers === 'satellite' 
                ? 'bg-teal-500 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Uydu Görünümü"
          >
            <span className="text-lg">🛰️</span>
          </button>

          {/* Ayırıcı */}
          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Konumum */}
          <button
            onClick={handleGoToUserLocation}
            disabled={isLocating}
            className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
            title={isLocating ? 'Konum Alınıyor...' : 'Konumum'}
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
          </button>

          {/* Dünya Görünümü */}
          <button
            onClick={handleGoToWorldView}
            className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 transition-all duration-200"
            title="Dünya Görünümü"
          >
            <Globe className="w-5 h-5" />
          </button>


        </div>
      </div>

      {/* Custom CSS - Enhanced for performance */}
      <style jsx global>{`
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border: none;
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
          max-width: none;
        }

        .custom-popup .leaflet-popup-close-button {
          color: #6b7280 !important;
          font-size: 16px !important;
          padding: 4px 8px !important;
          border-radius: 4px;
        }

        .custom-popup .leaflet-popup-close-button:hover {
          background-color: #f3f4f6 !important;
          color: #374151 !important;
        }

        .custom-popup .leaflet-popup-tip {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .leaflet-container {
          background: #a6cee3;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
        }
        
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          color: #374151 !important;
        }

        /* Marker Cluster Custom Styles for 100K+ performance */
        .marker-cluster-small {
          background-color: rgba(20, 184, 166, 0.6);
        }
        .marker-cluster-small div {
          background-color: rgba(20, 184, 166, 0.6);
        }
        .marker-cluster-medium {
          background-color: rgba(20, 184, 166, 0.8);
        }
        .marker-cluster-medium div {
          background-color: rgba(20, 184, 166, 0.8);
        }
        .marker-cluster-large {
          background-color: rgba(20, 184, 166, 1);
        }
        .marker-cluster-large div {
          background-color: rgba(20, 184, 166, 1);
        }

        /* Performance optimizations for large datasets */
        .leaflet-marker-icon, .leaflet-marker-shadow {
          -webkit-transform-origin: 50% 50%;
          transform-origin: 50% 50%;
        }
        
        .leaflet-fade-anim .leaflet-tile {
          -webkit-transition: opacity 0.1s linear;
          transition: opacity 0.1s linear;
        }
      `}</style>
    </div>
  );
}
