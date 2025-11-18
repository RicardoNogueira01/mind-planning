import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Minus
} from 'lucide-react';

const TeamMembersManager = () => {
  // Sample data
  const [teamMembers] = useState([
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

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMembers.map(member => (
        <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg"
                style={{ backgroundColor: member.color }}
              >
                {member.initials}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(member.performance)}`}>
                <div className="flex items-center gap-1">
                  {getPerformanceIcon(member.performance)}
                  {member.performance.replace('-', ' ')}
                </div>
              </span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={14} />
              <span>{member.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={14} />
              <span>{member.department}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={14} />
              <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Task Completion</span>
              <span className="text-sm font-medium">{member.completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                style={{ width: `${member.completionRate}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-green-600 font-semibold">{member.tasksCompleted}</div>
                <div className="text-gray-500">Completed</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <div className="text-yellow-600 font-semibold">{member.tasksInProgress}</div>
                <div className="text-gray-500">In Progress</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <div className="text-red-600 font-semibold">{member.overdueTasks}</div>
                <div className="text-gray-500">Overdue</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {member.skills.slice(0, 3).map(skill => (
                <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {skill}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{member.skills.length - 3} more
                </span>
              )}
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
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      {/* Header */}
      <header className="mb-4 md:mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 touch-manipulation">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div className="flex-1 md:flex-initial">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Team Members</h1>
              <p className="text-sm md:text-base text-gray-500">Manage your team and track performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-initial px-3 md:px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation">
              <Plus size={16} />
              Add Member
            </button>
          </div>
        </div>
      </header>      {/* Main Content */}
      <main>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgCompletionRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalOverdue}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
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
    </div>
  );
};

export default TeamMembersManager;
