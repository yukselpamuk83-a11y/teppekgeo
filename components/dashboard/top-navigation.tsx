
'use client';

import { Menu, List, Activity, LogIn, LogOut, User } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

interface TopNavigationProps {
  onDashboardToggle: () => void;
  onListingsToggle: () => void;
  isDashboardOpen: boolean;
  isListingsOpen: boolean;
  performanceStats?: any;
}

export function TopNavigation({ 
  onDashboardToggle, 
  onListingsToggle, 
  isDashboardOpen, 
  isListingsOpen,
  performanceStats 
}: TopNavigationProps) {
  const { data: session, status } = useSession() || {};
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: '/' });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      {/* Desktop Navigation */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 glass-panel border-b border-white/20 z-[200]">
        <div className="h-full max-w-none px-4 items-center justify-between w-full flex">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onDashboardToggle}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 glass-button ${
                isDashboardOpen 
                  ? 'text-teal-700 bg-teal-50 border-teal-200' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Menu className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* Authentication Section - Moved to left */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:block text-sm text-gray-700 font-medium">
                    {session.user?.name || session.user?.email?.split('@')[0] || 'Kullanıcı'}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-[199]"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[200] py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">
                          {session.user?.name || 'Kullanıcı'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.user?.email}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          // Profile page could be implemented here
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Profil
                      </button>
                      
                      <hr className="my-1" />
                      
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all duration-200 font-medium"
              >
                <LogIn className="w-4 h-4" />
                <span>Giriş Yap</span>
              </button>
            )}
          </div>

          {/* Center Section */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-black text-gray-800">Teppek</h1>
            <p className="text-sm text-gray-600 mt-1">Global Job Search Platform - Find Jobs Worldwide</p>
            
            {/* Performance Stats for Development */}
            {process.env.NODE_ENV === 'development' && performanceStats && (
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {performanceStats.filteredRecords?.toLocaleString()} / {performanceStats.totalRecords?.toLocaleString()}
                </span>
                <span>{performanceStats.queryTime?.toFixed(0)}ms</span>
                <span>Zoom: {performanceStats.zoom}</span>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center">
            <button
              onClick={onListingsToggle}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 glass-button ${
                isListingsOpen 
                  ? 'text-teal-700 bg-teal-50 border-teal-200' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>İlanlar</span>
              {performanceStats?.filteredRecords && (
                <span className="px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full">
                  {performanceStats.filteredRecords > 999 
                    ? `${(performanceStats.filteredRecords / 1000).toFixed(1)}K` 
                    : performanceStats.filteredRecords}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass-panel border-b border-white/20 z-[200]">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Mobile Left: Dashboard & Auth */}
          <div className="flex items-center gap-2">
            <button
              onClick={onDashboardToggle}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDashboardOpen 
                  ? 'text-teal-700 bg-teal-50' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Auth - Moved to left */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                >
                  {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                </button>

                {/* Mobile User Dropdown */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[199]"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[200] py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">
                          {session.user?.name || 'Kullanıcı'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Profil
                      </button>
                      
                      <hr className="my-1" />
                      
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600 transition-all"
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Center: Title */}
          <div className="text-center">
            <h1 className="text-xl font-black text-gray-800">Teppek</h1>
            {performanceStats && (
              <div className="text-xs text-gray-500">
                {performanceStats.filteredRecords?.toLocaleString()} ilan
              </div>
            )}
          </div>

          {/* Mobile Right: Listings Button */}
          <button
            onClick={onListingsToggle}
            className={`p-2 rounded-lg transition-all duration-200 relative ${
              isListingsOpen 
                ? 'text-teal-700 bg-teal-50' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <List className="w-5 h-5" />
            {performanceStats?.filteredRecords && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-teal-500 text-white text-xs rounded-full min-w-[20px] text-center">
                {performanceStats.filteredRecords > 99 
                  ? '99+' 
                  : performanceStats.filteredRecords}
              </span>
            )}
          </button>
        </div>
      </header>
    </>
  );
}
