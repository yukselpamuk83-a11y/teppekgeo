
'use client';

import { useState } from 'react';
import { X, Building2, Users, Star, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'job' | 'cv' | 'gold';
}

export function ListingFormModal({ isOpen, onClose, type }: ListingFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'premium' | 'gold'>('free'); // Simulated user plan
  const [formData, setFormData] = useState({
    // Ortak alanlar
    title: '',
    description: '',
    
    // İş ilanı alanları
    company: '',
    position: '',
    sector: '',
    experience: '',
    workType: '',
    salary: '',
    requirements: '',
    benefits: '',
    applyUrl: '',
    isPremium: false,
    
    // CV alanları
    profession: '',
    skills: '',
    education: '',
    languages: '',
    portfolio: '',
    linkedinUrl: '',
    portfolioUrl: '',
    
    // Gold ilan alanları
    goldType: '',
    priority: 'high' as 'high' | 'medium' | 'low',
    website: '',
    contactEmail: '',
    phone: ''
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          ...formData
        })
      });

      if (response.ok) {
        toast.success('İlan başarıyla oluşturuldu!', {
          description: 'İlanınız haritada görünür hale gelecek.'
        });
        onClose();
        setFormData({} as any); // Reset form
        // Sayfayı yenile veya marker'ları güncelle
        window.location.reload();
      } else {
        throw new Error('İlan oluşturulamadı');
      }
    } catch (error) {
      toast.error('Bir hata oluştu', {
        description: 'İlan oluşturulurken bir sorun yaşandı.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type: inputType } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const getModalConfig = () => {
    switch (type) {
      case 'job':
        return {
          title: 'İş İlanı Oluştur',
          icon: Building2,
          color: 'teal',
          description: 'Şirketiniz için yeni personel bulun'
        };
      case 'cv':
        return {
          title: 'CV Tanıtımı',
          icon: Users,
          color: 'orange',
          description: 'Kendinizi işverenlere tanıtın'
        };
      case 'gold':
        return {
          title: 'Gold İlan',
          icon: Star,
          color: 'yellow',
          description: 'Premium öne çıkarma ile fark yaratın'
        };
      default:
        return { title: '', icon: Building2, color: 'teal', description: '' };
    }
  };

  const config = getModalConfig();
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
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
            className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
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
                    <p className="text-white/80 text-sm">{config.description}</p>
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

            {/* Form */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Ortak Alanlar */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Temel Bilgiler</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlık *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder={
                        type === 'job' ? 'Örn: Frontend Developer Aranıyor' :
                        type === 'cv' ? 'Örn: Deneyimli React Developer' :
                        'Örn: Premium Yazılım Hizmetleri'
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama *
                    </label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Detaylı açıklama yazın..."
                    />
                  </div>


                </div>

                {/* İş İlanı Alanları */}
                {type === 'job' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">İş Detayları</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Şirket Adı *
                        </label>
                        <input
                          type="text"
                          name="company"
                          required
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pozisyon *
                        </label>
                        <input
                          type="text"
                          name="position"
                          required
                          value={formData.position}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sektör *
                        </label>
                        <select
                          name="sector"
                          required
                          value={formData.sector}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="">Seçin</option>
                          <option value="technology">Teknoloji</option>
                          <option value="healthcare">Sağlık</option>
                          <option value="finance">Finans</option>
                          <option value="education">Eğitim</option>
                          <option value="marketing">Pazarlama</option>
                          <option value="construction">İnşaat</option>
                          <option value="other">Diğer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deneyim Seviyesi
                        </label>
                        <select
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="">Seçin</option>
                          <option value="entry">Başlangıç</option>
                          <option value="mid">Orta</option>
                          <option value="senior">Üst</option>
                          <option value="executive">Yönetici</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Çalışma Türü
                        </label>
                        <select
                          name="workType"
                          value={formData.workType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="">Seçin</option>
                          <option value="full-time">Tam Zamanlı</option>
                          <option value="part-time">Yarı Zamanlı</option>
                          <option value="contract">Sözleşmeli</option>
                          <option value="freelance">Freelance</option>
                          <option value="remote">Uzaktan</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maaş
                      </label>
                      <input
                        type="text"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Örn: 15.000-20.000 TL"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Başvuru URL'si
                      </label>
                      <input
                        type="url"
                        name="applyUrl"
                        value={formData.applyUrl}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}

                {/* CV Alanları */}
                {type === 'cv' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">CV Detayları</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meslek *
                        </label>
                        <input
                          type="text"
                          name="profession"
                          required
                          value={formData.profession}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Örn: Frontend Developer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deneyim Seviyesi
                        </label>
                        <select
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="">Seçin</option>
                          <option value="entry">Başlangıç (0-2 yıl)</option>
                          <option value="mid">Orta (2-5 yıl)</option>
                          <option value="senior">Üst (5+ yıl)</option>
                          <option value="executive">Yönetici</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beceriler *
                      </label>
                      <textarea
                        name="skills"
                        required
                        rows={3}
                        value={formData.skills}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Örn: React, Node.js, TypeScript, MongoDB"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Eğitim
                        </label>
                        <input
                          type="text"
                          name="education"
                          value={formData.education}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Örn: Bilgisayar Mühendisliği"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Diller
                        </label>
                        <input
                          type="text"
                          name="languages"
                          value={formData.languages}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Örn: Türkçe (Ana dil), İngilizce (İleri)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          name="linkedinUrl"
                          value={formData.linkedinUrl}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Portfolyo URL
                        </label>
                        <input
                          type="url"
                          name="portfolioUrl"
                          value={formData.portfolioUrl}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Gold İlan Alanları */}
                {type === 'gold' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Gold İlan Detayları</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          İlan Türü *
                        </label>
                        <select
                          name="goldType"
                          required
                          value={formData.goldType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="">Seçin</option>
                          <option value="service">Hizmet</option>
                          <option value="product">Ürün</option>
                          <option value="event">Etkinlik</option>
                          <option value="announcement">Duyuru</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Öncelik Seviyesi
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="high">Yüksek</option>
                          <option value="medium">Orta</option>
                          <option value="low">Düşük</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          İletişim E-posta
                        </label>
                        <input
                          type="email"
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="info@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="+90 xxx xxx xxxx"
                      />
                    </div>
                  </div>
                )}

                {/* Premium Seçeneği */}
                {type !== 'gold' && (
                  <div className="border-t border-gray-200 pt-6">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="isPremium"
                        checked={formData.isPremium}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <div>
                        <span className="font-medium text-gray-700">Premium İlan</span>
                        <p className="text-sm text-gray-500">
                          İlanınız öne çıkarılır ve daha fazla görüntülenme sağlar (+25₺)
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 px-6 py-3 bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 text-white rounded-lg hover:from-${config.color}-600 hover:to-${config.color}-700 transition-all font-medium flex items-center justify-center gap-2`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        İlan Oluştur
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
