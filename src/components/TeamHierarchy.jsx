import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, User, ChevronDown, ChevronUp } from 'lucide-react';
import TopBar from './shared/TopBar';

const TeamHierarchy = () => {
    const { profession } = useParams();
    const navigate = useNavigate();
    const [expandedLevels, setExpandedLevels] = useState({});

    // Mock hierarchy data - in a real app, this would come from an API
    const hierarchyData = {
        'UX Core': {
            name: 'UX Core',
            color: 'from-purple-500 to-purple-600',
            levels: [
                {
                    level: 'Director',
                    members: [
                        {
                            id: 101,
                            name: 'Sarah Johnson',
                            initials: 'SJ',
                            email: 'sarah.johnson@company.com',
                            phone: '+1 (555) 100-0001',
                            role: 'UX Director',
                            department: 'User Experience',
                            color: '#8B5CF6',
                            performance: 'excellent',
                            tasksCompleted: 45,
                            tasksInProgress: 12,
                            overdueTasks: 0
                        }
                    ]
                },
                {
                    level: 'Senior',
                    members: [
                        {
                            id: 2,
                            name: 'Alex Kim',
                            initials: 'AK',
                            email: 'alex.kim@company.com',
                            phone: '+1 (555) 234-5678',
                            role: 'Senior UX Designer',
                            department: 'Design',
                            color: '#10B981',
                            performance: 'excellent',
                            tasksCompleted: 15,
                            tasksInProgress: 5,
                            overdueTasks: 0
                        },
                        {
                            id: 102,
                            name: 'Michael Chen',
                            initials: 'MC',
                            email: 'michael.chen@company.com',
                            phone: '+1 (555) 200-0002',
                            role: 'Senior UX Researcher',
                            department: 'User Research',
                            color: '#6366F1',
                            performance: 'excellent',
                            tasksCompleted: 38,
                            tasksInProgress: 8,
                            overdueTasks: 1
                        }
                    ]
                },
                {
                    level: 'Mid-Level',
                    members: [
                        {
                            id: 103,
                            name: 'Emma Wilson',
                            initials: 'EW',
                            email: 'emma.wilson@company.com',
                            phone: '+1 (555) 300-0003',
                            role: 'UX Designer',
                            department: 'Design Systems',
                            color: '#EC4899',
                            performance: 'good',
                            tasksCompleted: 22,
                            tasksInProgress: 6,
                            overdueTasks: 2
                        },
                        {
                            id: 104,
                            name: 'James Martinez',
                            initials: 'JM',
                            email: 'james.martinez@company.com',
                            phone: '+1 (555) 400-0004',
                            role: 'UX Designer',
                            department: 'User Experience',
                            color: '#F59E0B',
                            performance: 'good',
                            tasksCompleted: 19,
                            tasksInProgress: 7,
                            overdueTasks: 1
                        }
                    ]
                },
                {
                    level: 'Junior',
                    members: [
                        {
                            id: 105,
                            name: 'Olivia Brown',
                            initials: 'OB',
                            email: 'olivia.brown@company.com',
                            phone: '+1 (555) 500-0005',
                            role: 'Junior UX Designer',
                            department: 'User Experience',
                            color: '#14B8A6',
                            performance: 'good',
                            tasksCompleted: 12,
                            tasksInProgress: 8,
                            overdueTasks: 0
                        },
                        {
                            id: 106,
                            name: 'Liam Davis',
                            initials: 'LD',
                            email: 'liam.davis@company.com',
                            phone: '+1 (555) 600-0006',
                            role: 'Junior UX Researcher',
                            department: 'User Research',
                            color: '#06B6D4',
                            performance: 'needs-improvement',
                            tasksCompleted: 8,
                            tasksInProgress: 10,
                            overdueTasks: 3
                        }
                    ]
                }
            ]
        },
        'Platform Ops': {
            name: 'Platform Ops',
            color: 'from-cyan-500 to-cyan-600',
            levels: [
                {
                    level: 'Director',
                    members: [
                        {
                            id: 201,
                            name: 'Robert Taylor',
                            initials: 'RT',
                            email: 'robert.taylor@company.com',
                            phone: '+1 (555) 700-0007',
                            role: 'Platform Director',
                            department: 'Platform Operations',
                            color: '#0EA5E9',
                            performance: 'excellent',
                            tasksCompleted: 52,
                            tasksInProgress: 10,
                            overdueTasks: 0
                        }
                    ]
                },
                {
                    level: 'Senior',
                    members: [
                        {
                            id: 202,
                            name: 'Sophia Anderson',
                            initials: 'SA',
                            email: 'sophia.anderson@company.com',
                            phone: '+1 (555) 800-0008',
                            role: 'Senior DevOps Engineer',
                            department: 'DevOps',
                            color: '#8B5CF6',
                            performance: 'excellent',
                            tasksCompleted: 41,
                            tasksInProgress: 9,
                            overdueTasks: 0
                        }
                    ]
                },
                {
                    level: 'Mid-Level',
                    members: [
                        {
                            id: 203,
                            name: 'William Garcia',
                            initials: 'WG',
                            email: 'william.garcia@company.com',
                            phone: '+1 (555) 900-0009',
                            role: 'Platform Engineer',
                            department: 'Infrastructure',
                            color: '#10B981',
                            performance: 'good',
                            tasksCompleted: 28,
                            tasksInProgress: 12,
                            overdueTasks: 2
                        }
                    ]
                }
            ]
        },
        'Mobile App': {
            name: 'Mobile App',
            color: 'from-green-500 to-green-600',
            levels: [
                {
                    level: 'Director',
                    members: [
                        {
                            id: 301,
                            name: 'Isabella Thomas',
                            initials: 'IT',
                            email: 'isabella.thomas@company.com',
                            phone: '+1 (555) 110-0010',
                            role: 'Mobile Director',
                            department: 'Mobile Development',
                            color: '#10B981',
                            performance: 'excellent',
                            tasksCompleted: 48,
                            tasksInProgress: 11,
                            overdueTasks: 0
                        }
                    ]
                },
                {
                    level: 'Senior',
                    members: [
                        {
                            id: 302,
                            name: 'Ethan White',
                            initials: 'EW',
                            email: 'ethan.white@company.com',
                            phone: '+1 (555) 120-0011',
                            role: 'Senior iOS Developer',
                            department: 'Mobile Development',
                            color: '#3B82F6',
                            performance: 'excellent',
                            tasksCompleted: 35,
                            tasksInProgress: 8,
                            overdueTasks: 1
                        },
                        {
                            id: 303,
                            name: 'Ava Martinez',
                            initials: 'AM',
                            email: 'ava.martinez@company.com',
                            phone: '+1 (555) 130-0012',
                            role: 'Senior Android Developer',
                            department: 'Mobile Development',
                            color: '#EF4444',
                            performance: 'excellent',
                            tasksCompleted: 33,
                            tasksInProgress: 9,
                            overdueTasks: 0
                        }
                    ]
                }
            ]
        }
    };

    const currentHierarchy = hierarchyData[profession] || hierarchyData['UX Core'];

    const toggleLevel = (level) => {
        setExpandedLevels(prev => ({
            ...prev,
            [level]: !prev[level]
        }));
    };

    const getPerformanceColor = (performance) => {
        switch (performance) {
            case 'excellent': return 'bg-green-100 text-green-700';
            case 'good': return 'bg-blue-100 text-blue-700';
            case 'needs-improvement': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <TopBar showSearch={false} />

            <div className="p-4 md:p-8">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/team-members')}
                            className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-100"
                        >
                            <ArrowLeft size={20} className="text-gray-700" strokeWidth={2} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {currentHierarchy.name} Hierarchy
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Organizational structure and team members
                            </p>
                        </div>
                    </div>
                </header>

                {/* Hierarchy Tree */}
                <div className="max-w-6xl mx-auto">
                    {currentHierarchy.levels.map((levelData, levelIndex) => (
                        <div key={levelData.level} className="mb-8">
                            {/* Level Header */}
                            <button
                                onClick={() => toggleLevel(levelData.level)}
                                className="w-full flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all mb-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${currentHierarchy.color} flex items-center justify-center text-white font-bold`}>
                                        {levelIndex + 1}
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-lg font-bold text-gray-900">{levelData.level}</h2>
                                        <p className="text-sm text-gray-500">{levelData.members.length} member{levelData.members.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                {expandedLevels[levelData.level] ? (
                                    <ChevronUp size={20} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-gray-400" />
                                )}
                            </button>

                            {/* Members Grid */}
                            {expandedLevels[levelData.level] !== false && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-0 md:pl-16">
                                    {levelData.members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden"
                                        >
                                            {/* Colored top bar */}
                                            <div className={`h-2 bg-gradient-to-br ${currentHierarchy.color}`}></div>

                                            <div className="p-5">
                                                {/* Avatar and Name */}
                                                <div className="flex items-start gap-3 mb-4">
                                                    <div
                                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md relative flex-shrink-0"
                                                        style={{ backgroundColor: member.color }}
                                                    >
                                                        {member.initials}
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-900 text-base truncate">{member.name}</h3>
                                                        <p className="text-xs text-gray-500 truncate">{member.role}</p>
                                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${getPerformanceColor(member.performance)}`}>
                                                            {member.performance.replace('-', ' ')}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Contact Info */}
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Mail size={12} className="text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{member.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Phone size={12} className="text-gray-400 flex-shrink-0" />
                                                        <span>{member.phone}</span>
                                                    </div>
                                                </div>

                                                {/* Task Stats */}
                                                <div className="grid grid-cols-3 gap-2 mb-4">
                                                    <div className="bg-green-50 rounded-lg p-2 text-center">
                                                        <div className="text-green-600 font-bold text-sm">{member.tasksCompleted}</div>
                                                        <div className="text-[10px] text-gray-500">Done</div>
                                                    </div>
                                                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                                                        <div className="text-blue-600 font-bold text-sm">{member.tasksInProgress}</div>
                                                        <div className="text-[10px] text-gray-500">Active</div>
                                                    </div>
                                                    <div className="bg-red-50 rounded-lg p-2 text-center">
                                                        <div className="text-red-600 font-bold text-sm">{member.overdueTasks}</div>
                                                        <div className="text-[10px] text-gray-500">Overdue</div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <Link
                                                        to={`/profile/${member.id}`}
                                                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-2"
                                                    >
                                                        <User size={14} />
                                                        Profile
                                                    </Link>
                                                    <button className="flex-1 px-3 py-2 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-2">
                                                        <Mail size={14} />
                                                        Message
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamHierarchy;
