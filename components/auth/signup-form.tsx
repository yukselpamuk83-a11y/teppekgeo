
'use client';

import { useState, useEffect } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [providers, setProviders] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: ''
  });

  useEffect(() => {
    const loadProviders = async () => {
      const availableProviders = await getProviders();
      setProviders(availableProviders);
    };
    loadProviders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      setIsLoading(false);
      return;
    }

    try {
      // Kayıt isteği
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          companyName: formData.companyName
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Kayıt başarılı!', {
          description: 'Şimdi giriş yapabilirsiniz'
        });

        // Otomatik giriş yap
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        });

        if (!result?.error) {
          router.replace('/');
        }
      } else {
        toast.error('Kayıt başarısız', {
          description: data.error || 'Bir hata oluştu'
        });
      }
    } catch (error) {
      toast.error('Bir hata oluştu', {
        description: 'Lütfen tekrar deneyin'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: string) => {
    setSocialLoading(provider);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      toast.error('Kayıt başarısız', {
        description: 'Sosyal medya hesabıyla kayıt yapılamadı'
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const socialProviders = providers ? Object.values(providers).filter((provider: any) => 
    provider.id !== 'credentials'
  ) : [];

  const hasSocialProviders = socialProviders.length > 0;

  return (
    <div className="space-y-6">
      {/* Sosyal Medya Kayıt Butonları - Sadece sağlayıcılar varsa göster */}
      {hasSocialProviders && (
        <div className="space-y-3">
          <p className="text-center text-sm text-gray-600 font-medium">
            Sosyal hesabınızla hızlıca kayıt olun
          </p>
          
          <div className={`grid gap-3 ${socialProviders.length === 1 ? 'grid-cols-1' : socialProviders.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {socialProviders.map((provider: any) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => handleSocialSignUp(provider.id)}
                disabled={socialLoading !== null}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {socialLoading === provider.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                ) : (
                  <>
                    {provider.id === 'google' && (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    {provider.id === 'facebook' && (
                      <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                    {provider.id === 'github' && (
                      <svg className="w-5 h-5" fill="#333" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                    )}
                  </>
                )}
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {provider.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ayırıcı - Sadece sosyal sağlayıcılar varsa göster */}
      {hasSocialProviders && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">veya e-posta ile kayıt olun</span>
          </div>
        </div>
      )}

      {/* E-posta/Şifre Formu */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* İsim Soyisim */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Ad
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                placeholder="Adınız"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Soyad
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                placeholder="Soyadınız"
              />
            </div>
          </div>
        </div>

        {/* E-posta */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-posta Adresi *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              placeholder="E-posta adresiniz"
            />
          </div>
        </div>

        {/* Telefon */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefon Numarası
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              placeholder="Telefon numaranız"
            />
          </div>
        </div>

        {/* Şirket Adı */}
        <div className="space-y-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
            Şirket Adı
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="companyName"
              name="companyName"
              type="text"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              placeholder="Şirket adı (opsiyonel)"
            />
          </div>
        </div>

        {/* Şifre */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Şifre *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              placeholder="Şifrenizi girin (min. 6 karakter)"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Şifre Tekrar */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Şifre Tekrar *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              placeholder="Şifrenizi tekrar girin"
            />
          </div>
        </div>

        {/* Kayıt butonu */}
        <button
          type="submit"
          disabled={isLoading || socialLoading !== null}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-4 rounded-lg hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Kayıt oluşturuluyor...' : 'E-posta ile Kayıt Ol'}
        </button>

        {/* Bilgilendirme */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            Kayıt olarak <strong>Hizmet Şartlarını</strong> ve <strong>Gizlilik Politikasını</strong> kabul etmiş olursunuz.
          </p>
        </div>
      </form>
    </div>
  );
}
