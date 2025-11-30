import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Bell, Languages } from 'lucide-react';
import PropTypes from 'prop-types';

const TopBar = ({ showSearch = true }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [notificationCount] = useState(3);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">{t('nav.brand')}</h1>
              <p className="text-xs text-gray-500">{t('nav.subtitle')}</p>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={t('nav.search')}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search Icon for Mobile */}
            {showSearch && (
              <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Search size={20} className="text-gray-600" />
              </button>
            )}

            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title={language === 'en' ? 'Switch to Portuguese' : 'Mudar para Inglês'}
            >
              <div className="flex items-center gap-1.5">
                <Languages size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors uppercase">
                  {language === 'en' ? 'EN' : 'PT'}
                </span>
              </div>
            </button>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} className="text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                JD
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">{t('roles.admin')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TopBar.propTypes = {
  showSearch: PropTypes.bool,
};

export default TopBar;
