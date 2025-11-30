import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import TopBar from './shared/TopBar';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Upload,
  User
} from 'lucide-react';

const TeamMembersManager = () => {
  const { t } = useLanguage();
  
  // Modal state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    photo: null,
    photoPreview: null,
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    subDepartment: ''
  });

  // Job titles with their corresponding sub-departments
  const jobTitleDepartments = {
    'Software Engineer': ['Frontend Development', 'Backend Development', 'Full Stack Development', 'DevOps', 'Mobile Development'],
    'QA Engineer': ['Quality Assurance', 'Test Automation', 'Manual Testing', 'Performance Testing'],
    'Product Manager': ['Product Management', 'Product Strategy', 'Product Operations'],
    'UX Designer': ['User Experience', 'Design Systems', 'User Research'],
    'UI Designer': ['User Interface', 'Visual Design', 'Design Systems'],
    'Data Analyst': ['Data Analytics', 'Business Intelligence', 'Data Visualization'],
    'Data Scientist': ['Machine Learning', 'Data Science', 'AI Research'],
    'DevOps Engineer': ['DevOps', 'Infrastructure', 'Cloud Operations', 'Site Reliability'],
    'Project Manager': ['Project Management', 'Agile Delivery', 'Program Management'],
    'Business Analyst': ['Business Analysis', 'Requirements Engineering', 'Process Improvement'],
    'Marketing Manager': ['Digital Marketing', 'Content Marketing', 'Brand Management', 'Growth Marketing'],
    'Sales Representative': ['Sales', 'Account Management', 'Business Development'],
    'Customer Support': ['Customer Service', 'Technical Support', 'Customer Success'],
    'HR Manager': ['Human Resources', 'Talent Acquisition', 'Employee Relations'],
    'Finance Manager': ['Finance', 'Accounting', 'Financial Planning'],
    'Security Engineer': ['Cybersecurity', 'Information Security', 'Security Operations']
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: file,
          photoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset sub-department when job title changes
      ...(field === 'jobTitle' ? { subDepartment: '' } : {})
    }));
  };

  const showFeedback = (message, type = 'success') => {
    setFeedbackMessage({ message, type });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      photo: null,
      photoPreview: null,
      name: '',
      email: '',
      phone: '',
      jobTitle: '',
      subDepartment: ''
    });
    setEditingMemberId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingMemberId) {
      // Edit existing member
      setTeamMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === editingMemberId 
            ? { 
                ...member, 
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.jobTitle,
                department: formData.subDepartment,
                avatar: formData.photoPreview
              }
            : member
        )
      );
      showFeedback('Member updated successfully!');
      setShowEditMemberModal(false);
    } else {
      // Add new member
      const newMember = {
        id: Math.max(...teamMembers.map(m => m.id)) + 1,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.jobTitle,
        department: formData.subDepartment,
        avatar: formData.photoPreview,
        initials: formData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        tasksAssigned: 0,
        tasksCompleted: 0,
        tasksInProgress: 0,
        overdueTasks: 0,
        completionRate: 0,
        skills: [],
        projects: [],
        lastActive: 'Just now',
        performance: 'good'
      };
      setTeamMembers(prevMembers => [...prevMembers, newMember]);
      showFeedback('Member added successfully!');
      setShowAddMemberModal(false);
    }
    
    resetForm();
  };

  const handleEdit = (member) => {
    setEditingMemberId(member.id);
    setFormData({
      photo: member.avatar,
      photoPreview: member.avatar,
      name: member.name,
      email: member.email,
      phone: member.phone,
      jobTitle: member.role,
      subDepartment: member.department
    });
    setShowEditMemberModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to delete ${memberName}?`)) {
      setTeamMembers(prevMembers => prevMembers.filter(m => m.id !== memberId));
      showFeedback('Member deleted successfully!', 'error');
      setOpenMenuId(null);
    }
  };

  // Sample data
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'John Doe',
      initials: 'JD',
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      role: 'Senior Developer',
      department: 'Engineering',
      color: '#3B82F6',
      avatar: null,
      joinDate: '2022-03-15',
      status: 'active',
      tasksAssigned: 14,
      tasksCompleted: 8,
      tasksInProgress: 4,
      overdueTasks: 2,
      completionRate: 57,
      skills: ['React', 'Node.js', 'TypeScript', 'GraphQL'],
      projects: ['Project Alpha', 'Project Beta'],
      lastActive: '2 hours ago',
      performance: 'excellent'
    },
    {
      id: 2,
      name: 'Alex Kim',
      initials: 'AK',
      email: 'alex.kim@company.com',
      phone: '+1 (555) 234-5678',
      role: 'UX Designer',
      department: 'Design',
      color: '#10B981',
      avatar: null,
      joinDate: '2021-11-08',
      status: 'active',
      tasksAssigned: 20,
      tasksCompleted: 15,
      tasksInProgress: 5,
      overdueTasks: 0,
      completionRate: 75,
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      projects: ['Project Gamma', 'Project Delta'],
      lastActive: '1 hour ago',
      performance: 'excellent'
    },
    {
      id: 3,
      name: 'Maria Rodriguez',
      initials: 'MR',
      email: 'maria.rodriguez@company.com',
      phone: '+1 (555) 345-6789',
      role: 'Project Manager',
      department: 'Management',
      color: '#F59E0B',
      avatar: null,
      joinDate: '2020-07-20',
      status: 'active',
      tasksAssigned: 18,
      tasksCompleted: 5,
      tasksInProgress: 10,
      overdueTasks: 3,
      completionRate: 28,
      skills: ['Agile', 'Scrum', 'Jira', 'Stakeholder Management'],
      projects: ['Project Alpha', 'Project Epsilon'],
      lastActive: '30 minutes ago',
      performance: 'needs-improvement'
    },
    {
      id: 4,
      name: 'Taylor Smith',
      initials: 'TS',
      email: 'taylor.smith@company.com',
      phone: '+1 (555) 456-7890',
      role: 'Frontend Developer',
      department: 'Engineering',
      color: '#8B5CF6',
      avatar: null,
      joinDate: '2023-01-10',
      status: 'active',
      tasksAssigned: 10,
      tasksCompleted: 4,
      tasksInProgress: 6,
      overdueTasks: 0,
      completionRate: 40,
      skills: ['Vue.js', 'CSS', 'JavaScript', 'Responsive Design'],
      projects: ['Project Beta', 'Project Gamma'],
      lastActive: '5 minutes ago',
      performance: 'good'
    },
    {
      id: 5,
      name: 'David Chen',
      initials: 'DC',
      email: 'david.chen@company.com',
      phone: '+1 (555) 567-8901',
      role: 'QA Engineer',
      department: 'Quality Assurance',
      color: '#EF4444',
      avatar: null,
      joinDate: '2022-09-05',
      status: 'inactive',
      tasksAssigned: 8,
      tasksCompleted: 6,
      tasksInProgress: 1,
      overdueTasks: 1,
      completionRate: 75,
      skills: ['Selenium', 'Jest', 'Cypress', 'Test Automation'],
      projects: ['Project Delta'],
      lastActive: '2 days ago',
      performance: 'good'
    },
    {
      id: 6,
      name: 'Sarah Wilson',
      initials: 'SW',
      email: 'sarah.wilson@company.com',
      phone: '+1 (555) 678-9012',
      role: 'Backend Developer',
      department: 'Engineering',
      color: '#06B6D4',
      avatar: null,
      joinDate: '2021-05-18',
      status: 'active',
      tasksAssigned: 16,
      tasksCompleted: 12,
      tasksInProgress: 4,
      overdueTasks: 0,
      completionRate: 75,
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      projects: ['Project Alpha', 'Project Epsilon'],
      lastActive: '1 hour ago',
      performance: 'excellent'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPerformance, setSelectedPerformance] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.relative')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  // Filter and sort data
  const filteredMembers = teamMembers
    .filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
      const matchesPerformance = selectedPerformance === 'all' || member.performance === selectedPerformance;
      
      return matchesSearch && matchesDepartment && matchesStatus && matchesPerformance;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'completionRate' || sortBy === 'tasksAssigned' || sortBy === 'tasksCompleted' || sortBy === 'overdueTasks') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get unique departments
  const departments = [...new Set(teamMembers.map(member => member.department))];

  // Calculate statistics
  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'active').length,
    avgCompletionRate: Math.round(teamMembers.reduce((sum, m) => sum + m.completionRate, 0) / teamMembers.length),
    totalOverdue: teamMembers.reduce((sum, m) => sum + m.overdueTasks, 0)
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs-improvement': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceIcon = (performance) => {
    switch (performance) {
      case 'excellent': return <TrendingUp size={12} />;
      case 'good': return <Minus size={12} />;
      case 'needs-improvement': return <TrendingDown size={12} />;
      default: return <Minus size={12} />;
    }
  };

  const getPerformanceTopColor = (performance) => {
    switch(performance) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'average': return 'bg-yellow-500';
      case 'needs-improvement': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredMembers.map(member => (
        <div key={member.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group">
          {/* Performance Top Line */}
          <div className={`h-1 ${getPerformanceTopColor(member.performance)}`}></div>
          
          <div className="p-4">
            {/* Header with Avatar and Actions */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md relative"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{member.name}</h3>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                >
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
                {openMenuId === member.id && (
                  <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                    <button 
                      className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit2 size={13} />
                      Edit Member
                    </button>
                    <button 
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onClick={() => handleDelete(member.id, member.name)}
                    >
                      <Trash2 size={13} />
                      Delete Member
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${getPerformanceColor(member.performance)}`}>
                  {getPerformanceIcon(member.performance)}
                  {member.performance.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail size={12} className="text-gray-400" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Users size={12} className="text-gray-400" />
                <span>{member.department}</span>
              </div>
            </div>

            {/* Task Progress */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-gray-600">Progress</span>
                <span className="text-xs font-bold text-gray-900">{member.tasksCompleted}/{member.tasksCompleted + member.tasksInProgress + member.overdueTasks}</span>
              </div>
              
              {/* Progress Bar with Segments */}
              <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-gray-200">
                <div 
                  className="bg-green-500"
                  style={{ width: `${(member.tasksCompleted / (member.tasksCompleted + member.tasksInProgress + member.overdueTasks)) * 100}%` }}
                ></div>
                <div 
                  className="bg-yellow-500"
                  style={{ width: `${(member.tasksInProgress / (member.tasksCompleted + member.tasksInProgress + member.overdueTasks)) * 100}%` }}
                ></div>
                <div 
                  className="bg-red-500"
                  style={{ width: `${(member.overdueTasks / (member.tasksCompleted + member.tasksInProgress + member.overdueTasks)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Task Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <div className="text-green-600 font-bold text-base">{member.tasksCompleted}</div>
                <div className="text-[10px] text-gray-500">Done</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2 text-center">
                <div className="text-yellow-600 font-bold text-base">{member.tasksInProgress}</div>
                <div className="text-[10px] text-gray-500">Active</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <div className="text-red-600 font-bold text-base">{member.overdueTasks}</div>
                <div className="text-[10px] text-gray-500">Overdue</div>
              </div>
            </div>

            {/* Skills/Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {member.skills.slice(0, 3).map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-medium">
                  {skill}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded font-medium">
                  +{member.skills.length - 3}
                </span>
              )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Link 
                to={`/profile/${member.id}`}
                className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <User size={12} />
                Profile
              </Link>
              <button className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
                <Mail size={12} />
                Message
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Member</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Role & Department</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Performance</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Tasks</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Completion Rate</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Last Active</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMembers.map(member => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.initials}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{member.role}</div>
                    <div className="text-gray-500">{member.department}</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(member.performance)}`}>
                    {getPerformanceIcon(member.performance)}
                    {member.performance.replace('-', ' ')}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <div className="text-gray-900">{member.tasksCompleted} / {member.tasksAssigned} completed</div>
                    {member.overdueTasks > 0 && (
                      <div className="text-red-600">{member.overdueTasks} overdue</div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                        style={{ width: `${member.completionRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{member.completionRate}%</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">{member.lastActive}</td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-50">
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
      <header className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('teamMembers.title')}</h1>
              <p className="text-sm text-gray-500">{t('teamMembers.subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddMemberModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30"
          >
            <Plus size={18} />
            {t('teamMembers.addMember')}
          </button>
        </div>
      </header>      {/* Main Content */}
      <main>
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Members */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-100">Total Members</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
            </div>
            <p className="text-xs text-blue-100">+2 this month</p>
          </div>

          {/* Active Members */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-700 rounded-full">+100%</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Active Members</p>
            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
            <p className="text-xs text-gray-500 mt-2">On track</p>
          </div>

          {/* Avg Completion */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">Good</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Completion</p>
            <p className="text-3xl font-bold text-gray-900">{stats.avgCompletionRate}%</p>
            <p className="text-xs text-gray-500 mt-2">+1.2% vs last month</p>
          </div>

          {/* Total Overdue */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-700 rounded-full">-4 from last week</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Overdue</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOverdue}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 text-gray-900 placeholder-gray-500"
                />
              </div>
                <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-black ${showFilters ? 'bg-gray-50' : ''}`}
              >
                <Filter size={16} />
                Filters
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black text-sm md:text-base min-w-0 flex-shrink"
              >
                <option value="name">Name</option>
                <option value="role">Role</option>
                <option value="completionRate">Completion</option>
                <option value="tasksAssigned">Tasks</option>
                <option value="overdueTasks">Overdue</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black flex-shrink-0"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Performance</label>                  <select
                    value={selectedPerformance}
                    onChange={(e) => setSelectedPerformance(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  >
                    <option value="all">All Performance Levels</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="needs-improvement">Needs Improvement</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredMembers.length} of {teamMembers.length} members
          </p>
        </div>        {/* Members List */}
        {viewMode === 'grid' ? <GridView /> : <ListView />}
      </main>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Team Member</h2>
                <p className="text-sm text-gray-500">Fill in the details to add a new member</p>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {formData.photoPreview ? (
                      <img
                        src={formData.photoPreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                        <User size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                      <Upload size={16} />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: Square image, at least 200x200px
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Email and Phone in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john.doe@company.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Job Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select a job title...</option>
                  {Object.keys(jobTitleDepartments).sort().map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>

              {/* Sub Department - Only show when job title is selected */}
              {formData.jobTitle && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.subDepartment}
                    onChange={(e) => handleInputChange('subDepartment', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select a sub department...</option>
                    {jobTitleDepartments[formData.jobTitle].map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Team Member</h2>
                <p className="text-sm text-gray-500">Update member details</p>
              </div>
              <button
                onClick={() => {
                  setShowEditMemberModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {formData.photoPreview ? (
                      <img
                        src={formData.photoPreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                        <User size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                      <Upload size={16} />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: Square image, at least 200x200px
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Email and Phone in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john.doe@company.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Job Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select a job title...</option>
                  {Object.keys(jobTitleDepartments).sort().map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>

              {/* Sub Department - Only show when job title is selected */}
              {formData.jobTitle && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.subDepartment}
                    onChange={(e) => handleInputChange('subDepartment', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select a sub department...</option>
                    {jobTitleDepartments[formData.jobTitle].map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditMemberModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Update Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TeamMembersManager;
