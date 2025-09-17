'use client';

import { useState, useEffect } from 'react';

interface MapConfig {
  tileLayers: {
    street: any;
    satellite: any;
  };
  bounds: Record<string, any>;
  zoom: {
    min: number;
    max: number;
    default: number;
    city: number;
    country: number;
    world: number;
  };
  performance: {
    markerClusterThreshold: number;
    batchSize: number;
    maxMarkers: number;
    chunkProcessingDelay: number;
  };
  clustering: any;
  cities: Record<string, [number, number]>;
  countries: Record<string, any>;
}

const CACHE_KEY = 'teppekgeo_map_config';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 saat

export function useMapConfig() {
  const [config, setConfig] = useState<MapConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMapConfig = async () => {
      try {
        // Önce browser cache'den kontrol et
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const now = new Date().getTime();

          // Cache hala geçerli mi?
          if (now - timestamp < CACHE_DURATION) {
            setConfig(data);
            setIsLoading(false);
            return;
          }
        }

        // API'den yeni veri çek
        const response = await fetch('/api/map/config', {
          cache: 'force-cache' // Browser cache kullan
        });

        if (!response.ok) {
          throw new Error('Harita konfigürasyonu yüklenemedi');
        }

        const result = await response.json();

        if (result.success) {
          setConfig(result.data);

          // Browser cache'e kaydet
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: result.data,
            timestamp: new Date().getTime()
          }));
        } else {
          throw new Error(result.error || 'Bilinmeyen hata');
        }

      } catch (err) {
        console.error('Map config yükleme hatası:', err);
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');

        // Fallback config
        setConfig({
          tileLayers: {
            street: {
              url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              attribution: '&copy; OpenStreetMap contributors',
              maxZoom: 19
            },
            satellite: {
              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              attribution: '&copy; Esri',
              maxZoom: 18
            }
          },
          bounds: {
            world: [[-85, -180], [85, 180]]
          },
          zoom: {
            min: 2,
            max: 18,
            default: 6,
            city: 12,
            country: 6,
            world: 2
          },
          performance: {
            markerClusterThreshold: 100,
            batchSize: 500,
            maxMarkers: 10000,
            chunkProcessingDelay: 10
          },
          clustering: {
            chunkedLoading: true,
            maxClusterRadius: 50
          },
          cities: {
            istanbul: [41.0082, 28.9784],
            ankara: [39.9334, 32.8597]
          },
          countries: {
            turkey: {
              bounds: [[35.5, 25.5], [42.5, 45.0]],
              center: [39.9334, 32.8597],
              zoom: 6
            }
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMapConfig();
  }, []);

  // Cache'i manuel temizleme fonksiyonu
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  // Belirli bir şehir koordinatını getir
  const getCityCoords = (cityName: string): [number, number] | null => {
    return config?.cities[cityName] || null;
  };

  // Belirli bir ülke bilgisini getir
  const getCountryInfo = (countryName: string) => {
    return config?.countries[countryName] || null;
  };

  return {
    config,
    isLoading,
    error,
    clearCache,
    getCityCoords,
    getCountryInfo
  };
}