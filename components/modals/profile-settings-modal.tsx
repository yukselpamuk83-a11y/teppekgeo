
'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Save, Upload, Camera, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { data: session, update } = useSession() || {};
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'subscription'>('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    company: '',
    position: '',
    location: '',
    website: '',
    linkedin: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (session?.user && isOpen) {
      const user = session.user as any;
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        company: user.company || '',
        position: user.position || '',
        location: user.location || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [session, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
          company: formData.company,
          position: formData.position,
          location: formData.location,
          website: formData.website,
          linkedin: formData.linkedin
        })
      });

      if (response.ok) {
        await update(); // NextAuth session'ını güncelle
        toast.success('Profil başarıyla güncellendi!');
      } else {
        throw new Error('Profil güncellenemedi');
      }
    } catch (error) {
      toast.error('Bir hata oluştu', {
        description: 'Profil güncellenirken bir sorun yaşandı.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        toast.success('Şifre başarıyla değiştirildi!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Şifre değiştirilemedi');
      }
    } catch (error: any) {
      toast.error('Bir hata oluştu', {
        description: error.message || 'Şifre değiştirilirken bir sorun yaşandı.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserName = () => {
    if (session?.user) {
      const user = session.user as any;
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email?.split('@')[0] || 'Kullanıcı';
    }
    return 'Kullanıcı';
  };

  const getSubscriptionBadge = () => {
    const subscriptionType = (session?.user as any)?.subscriptionType || 'FREE';
    const colors = {
      FREE: 'bg-gray-100 text-gray-800',
      PREMIUM: 'bg-blue-100 text-blue-800',
      GOLD: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[subscriptionType as keyof typeof colors]}`}>
        {subscriptionType}
      </span>
    );
  };

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
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Profil Ayarları</h2>
                    <p className="text-white/80 text-sm">{getUserName()}</p>
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

            <div className="flex">
              {/* Sidebar */}
              <div className="w-1/4 bg-gray-50 border-r border-gray-200 p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4" />
                      <span>Profil Bilgileri</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'account'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4" />
                      <span>Hesap Güvenliği</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('subscription')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'subscription'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Camera className="w-4 h-4" />
                      <span>Abonelik</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Kişisel Bilgiler</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ad *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Soyad *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            E-posta
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
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
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+90 xxx xxx xxxx"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hakkımda
                        </label>
                        <textarea
                          name="bio"
                          rows={3}
                          value={formData.bio}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Kendinizi kısaca tanıtın..."
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Profesyonel Bilgiler</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Şirket
                          </label>
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pozisyon
                          </label>
                          <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Konum
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Şehir, Ülke"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website
                          </label>
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn Profili
                        </label>
                        <input
                          type="url"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Değişiklikleri Kaydet
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Şifre Değiştir</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mevcut Şifre *
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            required
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yeni Şifre *
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            required
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            minLength={6}
                          />
                          <p className="text-xs text-gray-500 mt-1">En az 6 karakter olmalıdır</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yeni Şifre Tekrar *
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            minLength={6}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Değiştiriliyor...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Şifreyi Değiştir
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Subscription Tab */}
                {activeTab === 'subscription' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Abonelik Durumu</h3>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-800">Mevcut Paket</h4>
                            <p className="text-gray-600">Aktif abonelik durumunuz</p>
                          </div>
                          {getSubscriptionBadge()}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Aylık İlan Limiti:</span>
                            <span className="font-medium">5 ilan</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Bu Ay Kullanılan:</span>
                            <span className="font-medium text-orange-600">3/5 ilan</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{width: '60%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Paket Yükseltme</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg p-6">
                          <div className="text-center mb-4">
                            <h4 className="font-semibold text-gray-800">Premium</h4>
                            <p className="text-2xl font-bold text-blue-600 mt-2">₺29<span className="text-sm text-gray-500">/ay</span></p>
                          </div>
                          <ul className="space-y-2 text-sm text-gray-600 mb-6">
                            <li>✓ 25 ilan/ay</li>
                            <li>✓ Premium rozet</li>
                            <li>✓ Öncelikli destek</li>
                            <li>✓ Gelişmiş analitikler</li>
                          </ul>
                          <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            Premium'a Geç
                          </button>
                        </div>

                        <div className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
                          <div className="text-center mb-4">
                            <h4 className="font-semibold text-gray-800">Gold</h4>
                            <p className="text-2xl font-bold text-yellow-600 mt-2">₺59<span className="text-sm text-gray-500">/ay</span></p>
                          </div>
                          <ul className="space-y-2 text-sm text-gray-600 mb-6">
                            <li>✓ Sınırsız ilan</li>
                            <li>✓ Gold rozet</li>
                            <li>✓ VIP destek</li>
                            <li>✓ Detaylı raporlar</li>
                            <li>✓ Özel öne çıkarma</li>
                          </ul>
                          <button className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                            Gold'a Geç
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
