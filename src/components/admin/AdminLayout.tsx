import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Settings, LogOut, RefreshCw, Key, AlertTriangle, Menu, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  {
    path: '/admin/api-key',
    label: 'API Key Management',
    icon: Key,
  },
  {
    path: '/admin/data',
    label: 'Data Management',
    icon: RefreshCw,
  },
];

export function AdminLayout() {
  const { user, signOut, loading, isConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full animate-fade-in">
          <div className="flex items-center gap-2 text-amber-600 mb-4">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h2 className="text-lg font-medium">Configuration Required</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Please configure Supabase environment variables to access the admin dashboard:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
            <li>VITE_SUPABASE_URL</li>
            <li>VITE_SUPABASE_ANON_KEY</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Settings className="w-6 h-6 text-blue-500" />
              <span className="ml-2 text-lg font-semibold hidden sm:block">Admin Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                {user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium 
                         text-gray-700 hover:text-gray-900 hover:bg-gray-100
                         transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
              <button
                onClick={toggleMobileMenu}
                className="sm:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 
                         hover:bg-gray-100 focus:outline-none focus:ring-2 
                         focus:ring-inset focus:ring-blue-500"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transition-opacity duration-300
                   sm:hidden ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleMobileMenu}
      >
        <div
          className={`fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl 
                     transform transition-transform duration-300 ease-in-out
                     ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="pt-20 pb-6 px-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 text-base font-medium rounded-md 
                           transition-colors duration-200 mb-2
                           ${location.pathname === item.path
                             ? 'bg-blue-50 text-blue-700'
                             : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={toggleMobileMenu}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden sm:block lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md 
                               transition-colors duration-200 mb-2 last:mb-0
                               ${location.pathname === item.path
                                 ? 'bg-blue-50 text-blue-700'
                                 : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </a>
                ))}
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1">
              <div className="bg-white rounded-lg shadow-sm">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}