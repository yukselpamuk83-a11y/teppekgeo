
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SignUpForm } from '@/components/auth/signup-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Geri Dön</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Kayıt Ol</h1>
            <p className="text-gray-600 mt-2">
              Harita İş İlanları'na katıl
            </p>
          </div>

          <SignUpForm />

          {/* Alt bilgi */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabın var mı?{' '}
              <a href="/auth/signin" className="text-teal-600 hover:text-teal-700 font-medium">
                Giriş yap
              </a>
            </p>
          </div>
        </div>

        {/* Alt açıklama */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Dünya çapında iş fırsatları harita üzerinde</p>
        </div>
      </div>
    </div>
  );
}
