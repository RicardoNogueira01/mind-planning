import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Bell, Languages, CheckCircle, AlertTriangle, Users, Calendar, FileText, X, Check, MessageCircle, Send, Maximize2, Minimize2 } from 'lucide-react';
import PropTypes from 'prop-types';

const TopBar = ({ showSearch = true }) => {
  const { language, changeLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const notificationRef = useRef(null);
  const languageRef = useRef(null);
  
  // Dummy chat contacts
  const [contacts] = useState([
    {
      id: 1,
      name: 'Alex Kim',
      initials: 'AK',
      color: 'bg-green-500',
      lastMessage: 'Thanks for the update!',
      lastMessageTime: '2 min ago',
      unreadCount: 3,
      online: true
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      initials: 'MR',
      color: 'bg-yellow-500',
      lastMessage: 'Can we discuss the project?',
      lastMessageTime: '15 min ago',
      unreadCount: 1,
      online: true
    },
    {
      id: 3,
      name: 'John Doe',
      initials: 'JD',
      color: 'bg-blue-500',
      lastMessage: 'See you tomorrow',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      online: false
    },
    {
      id: 4,
      name: 'Taylor Smith',
      initials: 'TS',
      color: 'bg-purple-500',
      lastMessage: 'Perfect!',
      lastMessageTime: '3 hours ago',
      unreadCount: 0,
      online: true
    }
  ]);

  // Dummy messages for selected contact
  const [messages] = useState({
    1: [
      { id: 1, sender: 'them', text: 'Hey! How is the project coming along?', time: '10:30 AM' },
      { id: 2, sender: 'me', text: 'Going well! Just finished the design phase.', time: '10:32 AM' },
      { id: 3, sender: 'them', text: 'That\'s great! Can you share the mockups?', time: '10:33 AM' },
      { id: 4, sender: 'me', text: 'Sure, I\'ll send them over in a few minutes.', time: '10:35 AM' },
      { id: 5, sender: 'them', text: 'Thanks for the update!', time: '10:36 AM' }
    ],
    2: [
      { id: 1, sender: 'them', text: 'Hi! Do you have time for a quick call?', time: '9:15 AM' },
      { id: 2, sender: 'me', text: 'Sure, give me 10 minutes.', time: '9:16 AM' },
      { id: 3, sender: 'them', text: 'Can we discuss the project?', time: '9:20 AM' }
    ],
    3: [
      { id: 1, sender: 'me', text: 'Are we still meeting tomorrow?', time: 'Yesterday' },
      { id: 2, sender: 'them', text: 'Yes, at 2 PM', time: 'Yesterday' },
      { id: 3, sender: 'me', text: 'Perfect!', time: 'Yesterday' },
      { id: 4, sender: 'them', text: 'See you tomorrow', time: 'Yesterday' }
    ],
    4: [
      { id: 1, sender: 'them', text: 'The report looks great!', time: '8:00 AM' },
      { id: 2, sender: 'me', text: 'Thanks! Let me know if you need any changes.', time: '8:05 AM' },
      { id: 3, sender: 'them', text: 'Perfect!', time: '8:06 AM' }
    ]
  });

  const totalUnreadMessages = contacts.reduce((sum, contact) => sum + contact.unreadCount, 0);
  
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

  // Click outside to close notifications and language dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguages(false);
      }
    };

    if (showNotifications || showLanguages) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showLanguages]);

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
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">{t('nav.brand')}</h1>
              <p className="text-xs text-gray-500">{t('nav.subtitle')}</p>
            </div>
          </Link>

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
            <div className="relative" ref={languageRef}>
              <button 
                onClick={() => setShowLanguages(!showLanguages)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <Languages size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors uppercase">
                    {language === 'en' ? 'EN' : language === 'pt' ? 'PT' : language === 'es' ? 'ES' : 'FR'}
                  </span>
                </div>
              </button>

              {/* Language Dropdown */}
              {showLanguages && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      changeLanguage('en');
                      setShowLanguages(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇬🇧</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">English</p>
                        <p className="text-xs text-gray-500">EN</p>
                      </div>
                    </div>
                    {language === 'en' && <Check size={16} className="text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('pt');
                      setShowLanguages(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇵🇹</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Português</p>
                        <p className="text-xs text-gray-500">PT</p>
                      </div>
                    </div>
                    {language === 'pt' && <Check size={16} className="text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('es');
                      setShowLanguages(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇪🇸</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Español</p>
                        <p className="text-xs text-gray-500">ES</p>
                      </div>
                    </div>
                    {language === 'es' && <Check size={16} className="text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('fr');
                      setShowLanguages(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇫🇷</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Français</p>
                        <p className="text-xs text-gray-500">FR</p>
                      </div>
                    </div>
                    {language === 'fr' && <Check size={16} className="text-blue-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Chat */}
            <div className="relative">
              <button 
                onClick={() => setShowChat(!showChat)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageCircle size={20} className="text-gray-600" />
                {totalUnreadMessages > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{totalUnreadMessages}</span>
                  </span>
                )}
              </button>
            </div>

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
                <div className="fixed inset-x-4 top-20 sm:absolute sm:right-0 sm:left-auto sm:top-full sm:mt-2 w-auto sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden max-w-md mx-auto sm:mx-0">
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
                  <div className="max-h-96 sm:max-h-96 overflow-y-auto">
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
            <Link 
              to="/profile/current-user" 
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                JD
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">{t('roles.admin')}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className={`fixed top-0 bg-white shadow-2xl border-l border-gray-200 z-50 transition-all duration-300 ${
          isChatFullscreen ? 'left-0 right-0' : 'right-0 w-full sm:w-[550px]'
        }`}
        style={{ height: 'calc(100vh)' }}
        >
          {/* Chat Header */}
          <div className="bg-black px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle size={20} className="text-white" />
              <div>
                <h3 className="text-white font-bold text-sm">Messages</h3>
                <p className="text-gray-400 text-xs">{totalUnreadMessages} unread</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChatFullscreen(!isChatFullscreen)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isChatFullscreen ? (
                  <Minimize2 size={18} className="text-white" />
                ) : (
                  <Maximize2 size={18} className="text-white" />
                )}
              </button>
              <button
                onClick={() => {
                  setShowChat(false);
                  setSelectedContact(null);
                  setIsChatFullscreen(false);
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex" style={{ height: 'calc(100vh - 60px)' }}>
            {/* Contacts List */}
            <div className={`${
              selectedContact && !isChatFullscreen ? 'hidden sm:block' : ''
            } w-full sm:w-60 border-r border-gray-200 bg-gray-50 overflow-y-auto`}>
              <div className="p-3">
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="divide-y divide-gray-200">
                {contacts.map(contact => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`px-4 py-3 hover:bg-white cursor-pointer transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-white border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full ${contact.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                          {contact.initials}
                        </div>
                        {contact.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{contact.name}</p>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{contact.lastMessageTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 truncate">{contact.lastMessage}</p>
                          {contact.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Conversation */}
            {selectedContact ? (
              <div className="flex-1 flex flex-col bg-white">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                  {!isChatFullscreen && (
                    <button
                      onClick={() => setSelectedContact(null)}
                      className="sm:hidden p-1 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={20} className="text-gray-600" />
                    </button>
                  )}
                  <div className={`w-10 h-10 rounded-full ${selectedContact.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {selectedContact.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{selectedContact.name}</p>
                    <p className="text-xs text-gray-500">{selectedContact.online ? 'Online' : 'Offline'}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages[selectedContact.id]?.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${
                        message.sender === 'me'
                          ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm'
                      } px-4 py-2`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (messageInput.trim()) {
                        console.log('Sending message:', messageInput);
                        setMessageInput('');
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex-1 hidden sm:flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageCircle size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">Select a conversation</p>
                  <p className="text-gray-400 text-xs mt-1">Choose a contact to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

TopBar.propTypes = {
  showSearch: PropTypes.bool,
};

export default TopBar;
