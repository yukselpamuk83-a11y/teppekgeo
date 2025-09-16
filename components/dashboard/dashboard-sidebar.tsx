
'use client';

import { useState, useEffect } from 'react';
import { X, Plus, BarChart3, Filter, Search, MapPin, Users, Star, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ListingFormModal } from '@/components/modals/listing-form-modal';

interface DashboardSidebarProps {
  onClose: () => void;
  mapCenter: [number, number];
  mapZoom: number;
  initialTab?: 'overview' | 'filters' | 'add';
  onApplyFilters?: (filters: any) => void;
  onClearFilters?: () => void;
  activeFilters?: any;
}

export function DashboardSidebar({ 
  onClose, 
  mapCenter, 
  mapZoom, 
  initialTab = 'overview',
  onApplyFilters,
  onClearFilters,
  activeFilters
}: DashboardSidebarProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'filters' | 'add'>(initialTab);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'job' | 'cv' | 'gold'>('job');

  const openModal = (type: 'job' | 'cv' | 'gold') => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tab Navegasyonu */}
        <div className="flex mt-4 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Genel
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'filters'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Filtreler
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'add'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Ekle
          </button>
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && <OverviewTab mapCenter={mapCenter} mapZoom={mapZoom} openModal={openModal} />}
        {activeTab === 'filters' && (
          <FiltersTab 
            onApplyFilters={onApplyFilters}
            onClearFilters={onClearFilters}
            activeFilters={activeFilters}
          />
        )}
        {activeTab === 'add' && <AddTab openModal={openModal} />}
      </div>

      {/* Modal */}
      <ListingFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
      />
    </div>
  );
}

function OverviewTab({ mapCenter, mapZoom, openModal }: { mapCenter: [number, number]; mapZoom: number; openModal: (type: 'job' | 'cv' | 'gold') => void }) {
  return (
    <div className="space-y-6">
      {/* Hızlı İşlemler - En üste taşındı */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800">Hızlı İşlemler</h3>
        
        <div className="space-y-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal('job')}
            className="w-full flex items-center gap-3 p-4 modern-card border-l-4 border-teal-400 hover-shadow ripple group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">Yeni İş İlanı</p>
              <p className="text-xs text-gray-500">İş ilanı oluştur</p>
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal('cv')}
            className="w-full flex items-center gap-3 p-4 modern-card border-l-4 border-orange-400 hover-shadow ripple group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">CV Tanıtım</p>
              <p className="text-xs text-gray-500">Kendinizi tanıtın</p>
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal('gold')}
            className="w-full flex items-center gap-3 p-4 modern-card border-l-4 border-yellow-400 hover-shadow ripple group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bounce-animation">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">Gold İlan</p>
              <p className="text-xs text-gray-500">Premium öne çıkarma</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" />
          İstatistikler
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-teal-50 p-4 rounded-lg border border-teal-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span className="text-sm text-teal-700">İş İlanları</span>
            </div>
            <p className="text-2xl font-bold text-teal-600">47</p>
            <p className="text-xs text-teal-600">Aktif ilanlar</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-orange-50 p-4 rounded-lg border border-orange-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-orange-700">CV/Tanıtım</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">23</p>
            <p className="text-xs text-orange-600">Aktif profiller</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-yellow-50 p-4 rounded-lg border border-yellow-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-yellow-700">Gold İlanlar</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">8</p>
            <p className="text-xs text-yellow-600">Premium ilanlar</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 p-4 rounded-lg border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Toplam</span>
            </div>
            <p className="text-2xl font-bold text-gray-600">78</p>
            <p className="text-xs text-gray-600">Tüm ilanlar</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FiltersTab({ 
  onApplyFilters, 
  onClearFilters, 
  activeFilters 
}: { 
  onApplyFilters?: (filters: any) => void;
  onClearFilters?: () => void;
  activeFilters?: any;
}) {
  const [filters, setFilters] = useState(activeFilters || {
    search: '',
    jobTypes: { job: true, cv: true, gold: true, adzuna: true },
    sector: '',
    experience: '',
    workType: '',
    dateRange: ''
  });

  // activeFilters değiştiğinde local state'i güncelle
  useEffect(() => {
    if (activeFilters) {
      setFilters(activeFilters);
    }
  }, [activeFilters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleJobTypeChange = (type: string, checked: boolean) => {
    setFilters((prev: any) => ({
      ...prev,
      jobTypes: { ...prev.jobTypes, [type]: checked }
    }));
  };

  const applyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
  };

  const clearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <Filter className="w-5 h-5 text-teal-600" />
        Filtreleme Seçenekleri
      </h3>

      {/* Arama */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Arama</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="İş, şirket, konum ara..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      {/* İlan Türü - Modern Butonlar */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">İlan Türü</label>
        <div className="button-group">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleJobTypeChange('job', !filters.jobTypes.job)}
            className={`selection-button button-3d ripple ${
              filters.jobTypes.job 
                ? 'button-teal active' 
                : 'bg-white border-teal-200 text-teal-600 hover:bg-teal-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                filters.jobTypes.job ? 'bg-white' : 'bg-teal-500'
              }`}></div>
              <span className="font-medium">İş İlanları</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleJobTypeChange('cv', !filters.jobTypes.cv)}
            className={`selection-button button-3d ripple ${
              filters.jobTypes.cv 
                ? 'button-orange active' 
                : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                filters.jobTypes.cv ? 'bg-white' : 'bg-orange-500'
              }`}></div>
              <span className="font-medium">CV/Tanıtım</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleJobTypeChange('gold', !filters.jobTypes.gold)}
            className={`selection-button button-3d ripple ${
              filters.jobTypes.gold 
                ? 'button-gold active' 
                : 'bg-white border-yellow-200 text-yellow-600 hover:bg-yellow-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                filters.jobTypes.gold ? 'bg-white' : 'bg-yellow-500'
              }`}></div>
              <span className="font-medium">Gold İlanlar</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleJobTypeChange('adzuna', !filters.jobTypes.adzuna)}
            className={`selection-button button-3d ripple ${
              filters.jobTypes.adzuna 
                ? 'button-blue active' 
                : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                filters.jobTypes.adzuna ? 'bg-white' : 'bg-blue-500'
              }`}></div>
              <span className="font-medium">🌍 Global İş</span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Sektör */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Sektör</label>
        <select 
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          value={filters.sector}
          onChange={(e) => handleFilterChange('sector', e.target.value)}
        >
          <option value="">Tüm Sektörler</option>
          <option value="technology">Teknoloji</option>
          <option value="healthcare">Sağlık</option>
          <option value="finance">Finans</option>
          <option value="education">Eğitim</option>
          <option value="marketing">Pazarlama</option>
          <option value="construction">İnşaat</option>
        </select>
      </div>

      {/* Deneyim Seviyesi */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Deneyim Seviyesi</label>
        <select 
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          value={filters.experience}
          onChange={(e) => handleFilterChange('experience', e.target.value)}
        >
          <option value="">Tüm Seviyeler</option>
          <option value="entry">Başlangıç</option>
          <option value="mid">Orta</option>
          <option value="senior">Üst</option>
          <option value="executive">Yönetici</option>
        </select>
      </div>

      {/* Çalışma Türü */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Çalışma Türü</label>
        <select 
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          value={filters.workType}
          onChange={(e) => handleFilterChange('workType', e.target.value)}
        >
          <option value="">Tüm Türler</option>
          <option value="full-time">Tam Zamanlı</option>
          <option value="part-time">Yarı Zamanlı</option>
          <option value="contract">Sözleşmeli</option>
          <option value="freelance">Freelance</option>
          <option value="remote">Uzaktan</option>
        </select>
      </div>

      {/* Tarih Aralığı */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Yayınlanma Tarihi</label>
        <select 
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          value={filters.dateRange}
          onChange={(e) => handleFilterChange('dateRange', e.target.value)}
        >
          <option value="">Tüm Zamanlar</option>
          <option value="24h">Son 24 Saat</option>
          <option value="7d">Son 7 Gün</option>
          <option value="30d">Son 30 Gün</option>
          <option value="90d">Son 3 Ay</option>
        </select>
      </div>

      {/* Filtreleri Uygula - Modern Butonlar */}
      <div className="flex gap-3 pt-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={applyFilters}
          className="flex-1 flex items-center gap-3 p-4 modern-card border-l-4 border-teal-400 hover-shadow ripple group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">Filtreleri Uygula</p>
            <p className="text-xs text-gray-500">Sonuçları filtrele</p>
          </div>
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={clearFilters}
          className="flex items-center gap-3 p-4 modern-card border-l-4 border-gray-400 hover-shadow ripple group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-lg">✕</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-600 transition-colors">Temizle</p>
            <p className="text-xs text-gray-500">Sıfırla</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

function AddTab({ openModal }: { openModal: (type: 'job' | 'cv' | 'gold') => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <Plus className="w-5 h-5 text-teal-600" />
        Yeni İlan Ekle
      </h3>

      <div className="space-y-3">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openModal('job')}
          className="w-full flex items-center gap-3 p-4 modern-card border-l-4 border-teal-400 hover-shadow ripple group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">İş İlanı Oluştur</p>
            <p className="text-xs text-gray-500">Şirketiniz için yeni personel</p>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openModal('cv')}
          className="w-full flex items-center gap-3 p-4 modern-card border-l-4 border-orange-400 hover-shadow ripple group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">CV Tanıtımı</p>
            <p className="text-xs text-gray-500">Kendinizi işverenlere tanıtın</p>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openModal('gold')}
          className="w-full flex items-center gap-3 p-4 modern-card border-l-4 border-yellow-400 hover-shadow ripple group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bounce-animation">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">Gold İlan</p>
            <p className="text-xs text-gray-500">Premium öne çıkarma</p>
          </div>
        </motion.button>
      </div>

      {/* Bilgi Kutucuğu - Modern */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="modern-card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 space-y-3 hover-shadow"
      >
        <h4 className="font-bold text-blue-800 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          <span className="glass-text">İpucu</span>
        </h4>
        <p className="text-sm text-blue-700 leading-relaxed">
          İlanlarınızı harita üzerinde daha görünür yapmak için detaylı konum bilgileri ekleyin ve 
          dikkat çekici başlıklar kullanın.
        </p>
      </motion.div>

      {/* Abonelik Durumu - Modern */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="modern-card neumorphic rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Mevcut Paket</span>
          <span className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 text-xs font-bold px-3 py-1 rounded-full border">
            FREE
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>İlan Kullanımı</span>
            <span className="font-medium">3/5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full" style={{width: '60%'}}></div>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open('/pricing', '_blank')}
          className="w-full cyber-gradient text-white py-3 px-4 rounded-xl text-sm font-bold button-3d ripple glass-text"
        >
          ✨ Premium'a Yükselt
        </motion.button>
      </motion.div>
    </div>
  );
}
