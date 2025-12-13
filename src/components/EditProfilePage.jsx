import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
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
  Plus
} from 'lucide-react';

const EditProfilePage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: 'Alex Kim',
    role: 'Senior Developer',
    department: 'Engineering',
    email: 'alex.kim@company.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Passionate full-stack developer with 8+ years of experience building scalable web applications. Love working with React, Node.js, and cloud technologies.',
    joinDate: '2023-01-15',
    linkedin: 'https://linkedin.com/in/alexkim',
    github: 'https://github.com/alexkim',
    website: 'https://alexkim.dev',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'GraphQL', 'MongoDB']
  });

  const [newSkill, setNewSkill] = useState('');

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

  const handleSave = () => {
    // In real app, save to API
    setFeedbackMessage({ message: 'Profile updated successfully!', type: 'success' });
    setTimeout(() => {
      setFeedbackMessage(null);
      navigate(`/profile/${memberId}`);
    }, 2000);
  };

  const handleCancel = () => {
    navigate(`/profile/${memberId}`);
  };

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
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
            >
              <Save size={16} />
              <span className="hidden sm:inline">{t('editProfile.save')}</span>
              <span className="sm:hidden">Save Changes</span>
            </button>
          </div>
        </div>

        <div>
          {/* Avatar Section */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">{t('editProfile.profilePicture')}</h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-lg flex-shrink-0">
                AK
              </div>
              <div className="flex-1 w-full text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-600 mb-3">Upload a new profile picture. JPG, PNG or GIF. Max size 5MB.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
                    <Upload size={16} />
                    {t('editProfile.uploadPhoto')}
                  </button>
                  <button className="px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
                    <Camera size={16} />
                    {t('editProfile.takePhoto')}
                  </button>
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
                  name="role"
                  value={formData.role}
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
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Product">Product</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Linkedin size={16} />
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Github size={16} />
                  GitHub
                </label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Globe size={16} />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
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
