import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { userApi } from '../api/client';
import TopBar from './shared/TopBar';
import { 
  ArrowLeft,
  Save,
  X,
  Upload,
  Camera,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Linkedin,
  Github,
  Globe,
  Plus,
  Loader2
} from 'lucide-react';

const EditProfilePage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    department: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    websiteUrl: '',
    skills: [],
    color: '#6366f1',
    initials: ''
  });

  const [newSkill, setNewSkill] = useState('');

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userId = memberId || 'me';
        const data = await userApi.getById(userId);
        
        setFormData({
          name: data.name || '',
          jobTitle: data.jobTitle || '',
          department: data.department || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          websiteUrl: data.websiteUrl || '',
          skills: Array.isArray(data.skills) ? data.skills : [],
          color: data.color || '#6366f1',
          initials: data.initials || (data.name ? data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'),
          avatar: data.avatar
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setFeedbackMessage({ message: 'Failed to load profile data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [memberId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = memberId || 'me';
      
      await userApi.update(userId, {
        name: formData.name,
        jobTitle: formData.jobTitle,
        department: formData.department,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        websiteUrl: formData.websiteUrl,
        skills: formData.skills,
        color: formData.color,
        initials: formData.initials
      });
      
      setFeedbackMessage({ message: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => {
        setFeedbackMessage(null);
        navigate(`/profile/${memberId || 'me'}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setFeedbackMessage({ message: 'Failed to save profile. Please try again.', type: 'error' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${memberId || 'me'}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <TopBar showSearch={false} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TopBar showSearch={false} />
      <div className="p-3 md:p-6">
        {/* Feedback Message */}
        {feedbackMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in">
            <div className={`px-6 py-3 rounded-lg shadow-lg border ${
              feedbackMessage.type === 'success' 
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
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('editProfile.title')}</h1>
              <p className="text-xs md:text-sm text-gray-500">{t('editProfile.subtitle')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
            >
              <X size={16} />
              <span className="hidden sm:inline">{t('editProfile.cancel')}</span>
              <span className="sm:hidden">Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span className="hidden sm:inline">{saving ? 'Saving...' : t('editProfile.save')}</span>
              <span className="sm:hidden">{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        <div>
          {/* Avatar Section */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">{t('editProfile.profilePicture')}</h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              {formData.avatar ? (
                <img 
                  src={formData.avatar} 
                  alt={formData.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-lg flex-shrink-0"
                />
              ) : (
                <div 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-lg flex-shrink-0"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.initials}
                </div>
              )}
              <div className="flex-1 w-full text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-600 mb-3">Your profile picture is managed by Clerk. You can update it in your account settings.</p>
                <p className="text-xs text-gray-500">Profile color and initials are used when no avatar is available.</p>
                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Color</label>
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-12 h-8 rounded cursor-pointer border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Initials</label>
                    <input
                      type="text"
                      name="initials"
                      value={formData.initials}
                      onChange={handleInputChange}
                      maxLength={2}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center uppercase text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Product">Product</option>
                  <option value="HR">HR</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Social Links</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Linkedin size={16} />
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Github size={16} />
                  GitHub
                </label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Globe size={16} />
                  Website
                </label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Bio</h2>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
            ></textarea>
            <p className="text-xs text-gray-500 mt-2">{formData.bio.length} / 500 characters</p>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Skills</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Add a skill"
              />
              <button
                onClick={handleAddSkill}
                className="px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium flex-shrink-0"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg font-medium flex items-center gap-2 group">
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-blue-900 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
