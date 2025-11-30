import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Bell, Languages, CheckCircle, AlertTriangle, Users, Calendar, FileText, X } from 'lucide-react';
import PropTypes from 'prop-types';

const TopBar = ({ showSearch = true }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  
  // Dummy notifications data
  const [notifications] = useState([
    {
      id: 1,
      type: 'task_completed',
      title: 'Task completed',
      message: 'Alex Kim completed "API integration testing"',
      time: '5 minutes ago',
      date: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 2,
      type: 'deadline_warning',
      title: 'Deadline approaching',
      message: 'Task "Design mockups" is due tomorrow',
      time: '2 hours ago',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 3,
      type: 'team_update',
      title: 'New team member',
      message: 'Sarah Wilson joined your team',
      time: '1 day ago',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 4,
      type: 'holiday_request',
      title: 'Holiday request',
      message: 'John Doe requested 3 days off starting Dec 15',
      time: '2 days ago',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 5,
      type: 'document_shared',
      title: 'Document shared',
      message: 'Maria Rodriguez shared "Q1 Budget Report.pdf"',
      time: '3 days ago',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true,
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const formatDate = (date) => {
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

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
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{unreadCount}</span>
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <p className="text-xs text-gray-500">{unreadCount} unread</p>
                      )}
                    </div>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => {
                          const Icon = notification.icon;
                          return (
                            <div 
                              key={notification.id} 
                              className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-blue-50/30' : ''
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className={`flex-shrink-0 w-10 h-10 ${notification.bgColor} rounded-lg flex items-center justify-center`}>
                                  <Icon size={18} className={notification.color} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-400">
                                      {formatDate(notification.date)}
                                    </p>
                                    <span className="text-gray-300">•</span>
                                    <p className="text-xs text-gray-400 capitalize">
                                      {notification.type.replace('_', ' ')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notifications</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <button className="w-full text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

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
