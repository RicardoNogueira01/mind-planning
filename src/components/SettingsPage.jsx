import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import TopBar from './shared/TopBar';
import { ToggleSwitch, SectionCard, SelectInput } from './shared';
import {
  ArrowLeft,
  Bell,
  Lock,
  Eye,
  Shield,
  Globe,
  Moon,
  Sun,
  Mail,
  Smartphone,
  Calendar,
  Users,
  Activity,
  Download,
  Trash2,
  AlertTriangle,
  Check,
  Clock,
  ChevronRight
} from 'lucide-react';

const SettingsPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    taskAssignments: true,
    taskUpdates: true,
    deadlineReminders: true,
    teamActivity: false,
    weeklyDigest: true,

    // Privacy
    profileVisibility: 'team',
    showEmail: true,
    showPhone: false,
    showActivity: true,

    // Preferences
    theme: 'light',
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',

    // Security
    twoFactorAuth: false,
    sessionTimeout: '30',
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // In real app, save to API
    setFeedbackMessage({ message: 'Settings saved successfully!', type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleExportData = () => {
    setFeedbackMessage({ message: 'Exporting your data...', type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleDeleteAccount = () => {
    if (globalThis.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setFeedbackMessage({ message: 'Account deletion initiated', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TopBar showSearch={false} />
      <div className="p-3 md:p-6">
        {/* Feedback Message */}
        {feedbackMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in">
            <div className={`px-6 py-3 rounded-lg shadow-lg border ${feedbackMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
              }`}>
              <p className="font-medium">{feedbackMessage.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(`/profile/${memberId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
              <p className="text-xs md:text-sm text-gray-500">{t('settings.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Check size={16} />
            {t('settings.saveChanges')}
          </button>
        </div>

        <div className="space-y-6">
          {/* Notifications and Privacy - Grid Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notifications */}
            <SectionCard
              icon={Bell}
              iconColor="bg-blue-100"
              iconTextColor="text-blue-600"
              title={t('settings.notifications.title')}
              subtitle={t('settings.notifications.subtitle')}
            >
              <div className="space-y-4">
                <ToggleSwitch
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  label="Email Notifications"
                  description="Receive notifications via email"
                  icon={Mail}
                />

                <ToggleSwitch
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                  label="Push Notifications"
                  description="Receive push notifications on your devices"
                  icon={Smartphone}
                />

                <div className="pl-9 space-y-3 py-3">
                  <ToggleSwitch
                    checked={settings.taskAssignments}
                    onChange={() => handleToggle('taskAssignments')}
                    label="Task assignments"
                  />
                  <ToggleSwitch
                    checked={settings.taskUpdates}
                    onChange={() => handleToggle('taskUpdates')}
                    label="Task updates"
                  />
                  <ToggleSwitch
                    checked={settings.deadlineReminders}
                    onChange={() => handleToggle('deadlineReminders')}
                    label="Deadline reminders"
                  />
                  <ToggleSwitch
                    checked={settings.teamActivity}
                    onChange={() => handleToggle('teamActivity')}
                    label="Team activity"
                  />
                  <ToggleSwitch
                    checked={settings.weeklyDigest}
                    onChange={() => handleToggle('weeklyDigest')}
                    label="Weekly digest"
                  />
                </div>
              </div>
            </SectionCard>


            {/* Privacy */}
            <SectionCard
              icon={Eye}
              iconColor="bg-purple-100"
              iconTextColor="text-purple-600"
              title="Privacy"
              subtitle="Control what others can see"
            >
              <div className="space-y-4">
                <SelectInput
                  label="Profile Visibility"
                  value={settings.profileVisibility}
                  onChange={(e) => handleChange('profileVisibility', e.target.value)}
                  options={[
                    { value: 'public', label: 'Public - Everyone can see' },
                    { value: 'team', label: 'Team - Only team members' },
                    { value: 'private', label: 'Private - Only me' }
                  ]}
                />

                <ToggleSwitch
                  checked={settings.showEmail}
                  onChange={() => handleToggle('showEmail')}
                  label="Show email address"
                />

                <ToggleSwitch
                  checked={settings.showPhone}
                  onChange={() => handleToggle('showPhone')}
                  label="Show phone number"
                />

                <ToggleSwitch
                  checked={settings.showActivity}
                  onChange={() => handleToggle('showActivity')}
                  label="Show activity history"
                />
              </div>
            </SectionCard>
          </div>

          {/* Preferences and Security - Grid Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preferences */}
            <SectionCard
              icon={Globe}
              iconColor="bg-green-100"
              iconTextColor="text-green-600"
              title="Preferences"
              subtitle="Customize your experience"
            >
              <div className="space-y-4">
                <SelectInput
                  label="Theme"
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'Auto (System)' }
                  ]}
                  icon={settings.theme === 'dark' ? Moon : Sun}
                />

                <SelectInput
                  label="Language"
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'pt', label: 'Português' },
                    { value: 'es', label: 'Español' },
                    { value: 'fr', label: 'Français' }
                  ]}
                />

                <SelectInput
                  label="Timezone"
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  options={[
                    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                    { value: 'America/New_York', label: 'Eastern Time (ET)' },
                    { value: 'Europe/London', label: 'London (GMT)' },
                    { value: 'Europe/Lisbon', label: 'Lisbon (WET)' },
                    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' }
                  ]}
                />

                <div className="grid grid-cols-2 gap-4">
                  <SelectInput
                    label="Date Format"
                    value={settings.dateFormat}
                    onChange={(e) => handleChange('dateFormat', e.target.value)}
                    options={[
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                    ]}
                  />
                  <SelectInput
                    label="Time Format"
                    value={settings.timeFormat}
                    onChange={(e) => handleChange('timeFormat', e.target.value)}
                    options={[
                      { value: '12h', label: '12 Hour' },
                      { value: '24h', label: '24 Hour' }
                    ]}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Security */}
            <SectionCard
              icon={Shield}
              iconColor="bg-red-100"
              iconTextColor="text-red-600"
              title="Security"
              subtitle="Protect your account"
            >
              <div className="space-y-4">
                <ToggleSwitch
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                  label="Two-Factor Authentication"
                  description="Add an extra layer of security"
                />

                <SelectInput
                  label="Session Timeout"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                  options={[
                    { value: '15', label: '15 minutes' },
                    { value: '30', label: '30 minutes' },
                    { value: '60', label: '1 hour' },
                    { value: 'never', label: 'Never' }
                  ]}
                />

                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                  <Lock size={16} />
                  Change Password
                </button>
              </div>
            </SectionCard>
          </div>

          {/* Reminders & Alerts Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-md border border-indigo-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Bell size={20} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">Reminders & Alerts</h2>
                <p className="text-sm text-gray-500">Configure deadline notifications and alerts</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Reminder Rules Link */}
              <button
                onClick={() => navigate('/settings/reminders')}
                className="w-full px-4 py-4 bg-white border border-indigo-200 text-left rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-4 group"
              >
                <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Clock size={24} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Deadline Reminders</p>
                  <p className="text-sm text-gray-500">Configure automatic task deadline reminders and overdue alerts</p>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </button>

              {/* Future: Team Management Link */}
              <button
                className="w-full px-4 py-4 bg-white/50 border border-gray-200 text-left rounded-xl opacity-60 cursor-not-allowed flex items-center gap-4"
                disabled
              >
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Users size={24} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-500">Team Management</p>
                  <p className="text-sm text-gray-400">Manage team roles and permissions (Coming soon)</p>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">Soon</span>
              </button>
            </div>
          </div>

          {/* Data & Account - Full Width */}
          <SectionCard
            icon={Activity}
            iconColor="bg-orange-100"
            iconTextColor="text-orange-600"
            title="Data & Account"
            subtitle="Manage your data and account"
          >
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Download size={16} />
                Export My Data
              </button>

              <div className="pt-4 border-t border-gray-200">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900 mb-1">Danger Zone</p>
                      <p className="text-xs text-red-700">Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div >
  );
};

export default SettingsPage;
