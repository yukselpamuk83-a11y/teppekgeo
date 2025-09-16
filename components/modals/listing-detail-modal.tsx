
'use client';

import { useState } from 'react';
import { X, MapPin, Clock, Building2, User, Star, ExternalLink, Mail, Phone, Globe, Linkedin, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapMarker, JobListing, CvListing, GoldListing } from '@/lib/types';
import { format, isValid } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

interface ListingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  marker: MapMarker;
}

function formatDate(dateValue: string | Date | undefined | null): string {
  if (!dateValue) return 'Tarih yok';
  
  const date = new Date(dateValue);
  if (!isValid(date)) return 'Tarih yok';
  
  try {
    return format(date, 'dd MMMM yyyy', { locale: tr });
  } catch (error) {
    console.error('Tarih formatlama hatası:', error);
    return 'Tarih yok';
  }
}

export function ListingDetailModal({ isOpen, onClose, marker }: ListingDetailModalProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    
    try {
      // Simüle başvuru işlemi
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Başvuru başarılı!', {
        description: 'Başvurunuz işverene iletildi.'
      });
      
      onClose();
    } catch (error) {
      toast.error('Başvuru gönderilemedi', {
        description: 'Lütfen tekrar deneyin.'
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleContact = () => {
    setShowContactModal(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: marker.title,
        text: marker.data.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopyalandı!');
    }
  };

  const getModalConfig = () => {
    switch (marker.type) {
      case 'job':
        return {
          title: 'İş İlanı Detayları',
          icon: Building2,
          color: 'teal'
        };
      case 'cv':
        return {
          title: 'CV/Profil Detayları',
          icon: User,
          color: 'orange'
        };
      case 'gold':
        return {
          title: 'Gold İlan Detayları',
          icon: Star,
          color: 'yellow'
        };
      default:
        return { title: '', icon: Building2, color: 'teal' };
    }
  };

  const config = getModalConfig();
  const IconComponent = config.icon;

  const renderJobDetails = (job: JobListing) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h1>
        <p className="text-lg text-teal-600 font-semibold mb-1">{job.company}</p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(job.createdAt)}
          </span>
        </div>
        {job.isPremium && (
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full mt-2">
            Premium İlan
          </span>
        )}
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Pozisyon</h3>
          <p className="text-gray-600">{job.position}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Sektör</h3>
          <p className="text-gray-600">{job.sector}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Deneyim</h3>
          <p className="text-gray-600">{job.experience || 'Belirtilmemiş'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Çalışma Türü</h3>
          <p className="text-gray-600">{job.workType || 'Belirtilmemiş'}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Maaş</h3>
          <p className="text-gray-600 font-semibold text-green-600">{job.salary || 'Belirtilmemiş'}</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">İş Açıklaması</h3>
        <p className="text-gray-600 leading-relaxed">{job.description}</p>
      </div>

      {/* Requirements */}
      {job.requirements && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Aranan Nitelikler</h3>
          <p className="text-gray-600 leading-relaxed">{job.requirements}</p>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Sağlanan İmkanlar</h3>
          <p className="text-gray-600 leading-relaxed">{job.benefits}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleApply}
          disabled={isApplying}
          className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all font-medium flex items-center justify-center gap-2"
        >
          {isApplying ? 'Başvuruluyor...' : 'Başvur'}
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Heart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderCvDetails = (cv: CvListing) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{cv.title}</h1>
        <p className="text-lg text-orange-600 font-semibold mb-1">{cv.profession}</p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {cv.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(cv.createdAt)}
          </span>
        </div>
        {cv.isPremium && (
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full mt-2">
            Premium Profil
          </span>
        )}
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Deneyim Seviyesi</h3>
          <p className="text-gray-600">{cv.experience || 'Belirtilmemiş'}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Eğitim</h3>
          <p className="text-gray-600">{cv.education || 'Belirtilmemiş'}</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Hakkımda</h3>
        <p className="text-gray-600 leading-relaxed">{cv.description}</p>
      </div>

      {/* Skills */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Beceriler</h3>
        <p className="text-gray-600 leading-relaxed">{cv.skills}</p>
      </div>

      {/* Languages */}
      {cv.languages && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Diller</h3>
          <p className="text-gray-600 leading-relaxed">{cv.languages}</p>
        </div>
      )}

      {/* Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cv.linkedinUrl && (
          <a
            href={cv.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Linkedin className="w-4 h-4 text-blue-600" />
            <span className="text-sm">LinkedIn Profili</span>
            <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
          </a>
        )}
        {cv.portfolioUrl && (
          <a
            href={cv.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-4 h-4 text-green-600" />
            <span className="text-sm">Portfolyo</span>
            <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleContact}
          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          İletişime Geç
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Heart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderGoldDetails = (gold: GoldListing) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{gold.title}</h1>
        <p className="text-lg text-yellow-600 font-semibold mb-1">{gold.type}</p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {gold.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(gold.createdAt)}
          </span>
        </div>
        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full mt-2">
          Öncelik: {gold.priority}
        </span>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Açıklama</h3>
        <p className="text-gray-600 leading-relaxed">{gold.description}</p>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gold.contactEmail && (
          <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{gold.contactEmail}</span>
          </div>
        )}
        {gold.phone && (
          <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{gold.phone}</span>
          </div>
        )}
      </div>

      {/* Website */}
      {gold.website && (
        <div>
          <a
            href={gold.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-sm">Website ziyaret et</span>
            <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleContact}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all font-medium flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          İletişime Geç
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Heart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={onClose}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 text-white p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{config.title}</h2>
                      <p className="text-white/80 text-sm">Detaylı bilgiler ve iletişim</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {marker.type === 'job' && renderJobDetails(marker.data as JobListing)}
                {marker.type === 'cv' && renderCvDetails(marker.data as CvListing)}
                {marker.type === 'gold' && renderGoldDetails(marker.data as GoldListing)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowContactModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">İletişime Geç</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesajınız
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mesajınızı yazın..."
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.success('Mesajınız gönderildi!');
                      setShowContactModal(false);
                    }}
                  >
                    Gönder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
