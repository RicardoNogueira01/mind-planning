import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import TopBar from './shared/TopBar';
import { NudgeButton, triggerNudge } from './shared/NudgeButton';
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
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
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
    switch (performance) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'average': return 'bg-yellow-500';
      case 'needs-improvement': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredMembers.map(member => (
        <div key={member.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
          {/* Colored Header with Profession Badge */}
          <div className={`h-20 bg-gradient-to-br ${member.color === '#3B82F6' ? 'from-blue-500 to-blue-600' :
            member.color === '#10B981' ? 'from-green-500 to-green-600' :
              member.color === '#F59E0B' ? 'from-orange-500 to-orange-600' :
                member.color === '#8B5CF6' ? 'from-purple-500 to-purple-600' :
                  member.color === '#EF4444' ? 'from-red-500 to-red-600' :
                    member.color === '#06B6D4' ? 'from-cyan-500 to-cyan-600' :
                      'from-gray-500 to-gray-600'
            } relative flex items-start justify-between p-4`}>
            <Link
              to={`/team-hierarchy/${encodeURIComponent(member.department)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full text-xs font-semibold hover:bg-white transition-all shadow-sm"
            >
              <Users size={12} />
              {member.department}
            </Link>
            <div className="relative">
              <button
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
              >
                <MoreVertical size={18} className="text-white" />
              </button>
              {openMenuId === member.id && (
                <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  <Link
                    to={`/profile/${member.id}`}
                    className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => setOpenMenuId(null)}
                  >
                    <User size={13} />
                    View Profile
                  </Link>
                  <Link
                    to={`/team-hierarchy/${encodeURIComponent(member.department)}`}
                    className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => setOpenMenuId(null)}
                  >
                    <Users size={13} />
                    Position Hierarchy
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
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

          <div className="p-5 -mt-8">
            {/* Avatar */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 rounded-full border-3 border-white"></div>
              </div>
            </div>

            {/* Name and Role */}
            <div className="text-center mb-3">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{member.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{member.role}</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getPerformanceColor(member.performance)}`}>
                {getPerformanceIcon(member.performance)}
                {member.performance === 'excellent' ? 'Excellent' :
                  member.performance === 'good' ? 'Good' :
                    'Needs Improvement'}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 mb-3 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <Mail size={12} className="text-gray-400" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <Phone size={12} className="text-gray-400" />
                <span>{member.phone}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">`r`n              <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sprint Tasks</span>
              <span className="text-xs font-bold text-gray-900">
                {Math.round((member.tasksCompleted / (member.tasksCompleted + member.tasksInProgress + member.overdueTasks)) * 100)}%
              </span>
            </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${(member.tasksCompleted / (member.tasksCompleted + member.tasksInProgress + member.overdueTasks)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Task Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{member.tasksCompleted}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Done</div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-xl font-bold text-blue-600">{member.tasksInProgress}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Active</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{member.overdueTasks}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Overdue</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Link
                to={`/profile/${member.id}`}
                className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors text-sm font-semibold flex items-center justify-center gap-2"
              >
                <User size={16} />
                Profile
              </Link>
              <button
                className="flex-1 px-4 py-2.5 bg-black hover:bg-gray-900 text-white rounded-xl transition-colors text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  // Dispatch custom event to open chat with this member
                  window.dispatchEvent(new CustomEvent('openChatWith', {
                    detail: {
                      id: member.id,
                      name: member.name,
                      initials: member.initials,
                      color: member.color,
                      email: member.email
                    }
                  }));
                }}
              >
                <Mail size={16} />
                Message
              </button>
            </div>

            {/* Nudge Button */}`r`n            <div className="mt-2">
              <NudgeButton
                recipientId={member.id.toString()}
                recipientName={member.name}
                senderId="current-user"
                onNudge={(nudgeData) => {
                  console.log('Nudge sent!', nudgeData);
                  triggerNudge(member.name);
                }}
                maxNudgesPerMinute={5}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );


  const ListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TopBar showSearch={false} />

      <div className="p-4 md:p-8">
        {/* Feedback Message */}
        {feedbackMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in">
            <div className={`px-6 py-3 rounded-xl shadow-sm border ${feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-red-50 border-red-100 text-red-700'
              }`}>
              <p className="font-semibold">{feedbackMessage.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-100">
                <ArrowLeft size={20} className="text-gray-700" strokeWidth={2} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('teamMembers.title')}</h1>
                <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('teamMembers.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // 1. Play Sound
                  try {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (AudioContext) {
                      const ctx = new AudioContext();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.connect(gain); gain.connect(ctx.destination);
                      osc.type = 'sine'; osc.frequency.setValueAtTime(600, ctx.currentTime);
                      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
                      gain.gain.setValueAtTime(0.1, ctx.currentTime);
                      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                      osc.start(); osc.stop(ctx.currentTime + 0.4);
                    }
                  } catch (e) { }

                  // 2. Shake Screen
                  document.body.classList.add('shake');
                  setTimeout(() => document.body.classList.remove('shake'), 500);

                  // 3. Show Toast Notification
                  const existingNudge = document.getElementById('test-nudge-toast');
                  if (existingNudge) existingNudge.remove();

                  const nudge = document.createElement('div');
                  nudge.id = 'test-nudge-toast';
                  nudge.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-white border border-blue-100 rounded-xl shadow-xl p-4 z-[9999] animate-fade-in flex items-start gap-4 max-w-sm pointer-events-auto cursor-pointer hover:bg-gray-50 transition-colors w-full md:w-auto min-w-[320px]';
                  nudge.innerHTML = `
                    <div class="p-2 bg-blue-50 rounded-full text-blue-600 flex-shrink-0">
                       👋
                    </div>
                    <div class="flex-1 min-w-0">
                       <h4 class="font-bold text-gray-900 text-sm">You've been nudged!</h4>
                       <p class="text-xs text-gray-600 mt-1">John Doe wants your attention on "Project Alpha".</p>
                       <div class="mt-2 text-[10px] text-gray-400">Just now</div>
                    </div>
                  `;

                  // Add click to dismiss
                  nudge.onclick = () => {
                    nudge.style.opacity = '0';
                    nudge.style.transform = 'translate(-50%, -20px)';
                    setTimeout(() => nudge.remove(), 300);
                  };

                  document.body.appendChild(nudge);

                  // Auto dismiss
                  setTimeout(() => {
                    if (document.body.contains(nudge)) {
                      nudge.style.opacity = '0';
                      nudge.style.transform = 'translate(-50%, -20px)';
                      setTimeout(() => nudge.remove(), 300);
                    }
                  }, 5000);
                }}
                className="px-3 md:px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm touch-manipulation cursor-pointer"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                <span className="text-xl">👋</span>
                Test Nudge
              </button>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="px-3 md:px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 text-sm touch-manipulation cursor-pointer"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                <Plus size={16} />
                {t('teamMembers.addMember')}
              </button>
            </div>
          </div>
        </header>      {/* Main Content */}
        <main>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 md:mb-6">
            {/* Total Members */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg shadow-blue-500/30">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Users size={20} className="sm:hidden" />
                  <Users size={24} className="hidden sm:block" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-100">Total Members</p>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
                </div>
              </div>
              <p className="text-xs text-blue-100">+2 this month</p>
            </div>

            {/* Active Members */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                  <CheckCircle size={20} className="sm:hidden text-green-600" />
                  <CheckCircle size={24} className="hidden sm:block text-green-600" />
                </div>
                <span className="text-xs font-semibold px-2 sm:px-2.5 py-1 bg-green-100 text-green-700 rounded-full">+100%</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Active Members</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">On track</p>
            </div>

            {/* Avg Completion */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                  <TrendingUp size={20} className="sm:hidden text-purple-600" />
                  <TrendingUp size={24} className="hidden sm:block text-purple-600" />
                </div>
                <span className="text-xs font-semibold px-2 sm:px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">Good</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Avg Completion</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.avgCompletionRate}%</p>
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">+1.2% vs last month</p>
            </div>

            {/* Total Overdue */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-red-100 rounded-xl">
                  <AlertTriangle size={20} className="sm:hidden text-red-600" />
                  <AlertTriangle size={24} className="hidden sm:block text-red-600" />
                </div>
                <span className="text-xs font-semibold px-2 sm:px-2.5 py-1 bg-red-100 text-red-700 rounded-full">-4 from last week</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Overdue</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalOverdue}</p>
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
                  {t('common.filters')}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black text-sm md:text-base min-w-0 flex-shrink"
                >
                  <option value="name">{t('common.name')}</option>
                  <option value="role">{t('common.role')}</option>
                  <option value="completionRate">{t('common.completion')}</option>
                  <option value="tasksAssigned">{t('common.tasks')}</option>
                  <option value="overdueTasks">{t('common.overdue')}</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.status')}</label>                  <select
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
              {t('common.showing')} {filteredMembers.length} {t('common.of')} {teamMembers.length} {t('common.members')}
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
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 cursor-pointer"
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
