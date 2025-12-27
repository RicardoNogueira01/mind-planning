import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import TopBar from './shared/TopBar';
import { NudgeButton, triggerNudge } from './shared/NudgeButton';
import { ArrowLeft, Search, Filter, Grid3X3, List, Plus, Edit2, Trash2, MoreVertical, Users, CheckCircle, Clock, AlertTriangle, Mail, Phone, Calendar, Award, TrendingUp, TrendingDown, Minus, X, Upload, User } from 'lucide-react';

interface TeamMember {
    id: number;
    name: string;
    initials: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    color: string;
    avatar: string | null;
    joinDate: string;
    status: 'active' | 'inactive';
    tasksAssigned: number;
    tasksCompleted: number;
    tasksInProgress: number;
    overdueTasks: number;
    completionRate: number;
    skills: string[];
    projects: string[];
    lastActive: string;
    performance: 'excellent' | 'good' | 'needs-improvement';
}

interface FormData {
    photo: File | string | null;
    photoPreview: string | null;
    name: string;
    email: string;
    phone: string;
    jobTitle: string;
    subDepartment: string;
}

interface FeedbackMessage {
    message: string;
    type: 'success' | 'error';
}

interface Stats {
    total: number;
    active: number;
    avgCompletionRate: number;
    totalOverdue: number;
}

const jobTitleDepartments: Record<string, string[]> = {
    'Software Engineer': ['Frontend Development', 'Backend Development', 'Full Stack Development', 'DevOps', 'Mobile Development'],
    'QA Engineer': ['Quality Assurance', 'Test Automation', 'Manual Testing', 'Performance Testing'],
    'Product Manager': ['Product Management', 'Product Strategy', 'Product Operations'],
    'UX Designer': ['User Experience', 'Design Systems', 'User Research'],
    'UI Designer': ['User Interface', 'Visual Design', 'Design Systems'],
    'Data Analyst': ['Data Analytics', 'Business Intelligence', 'Data Visualization'],
    'DevOps Engineer': ['DevOps', 'Infrastructure', 'Cloud Operations', 'Site Reliability'],
    'Project Manager': ['Project Management', 'Agile Delivery', 'Program Management'],
    'Marketing Manager': ['Digital Marketing', 'Content Marketing', 'Brand Management'],
    'HR Manager': ['Human Resources', 'Talent Acquisition', 'Employee Relations'],
};

const TeamMembersManager: React.FC = () => {
    const { t } = useLanguage();

    const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
    const [showEditMemberModal, setShowEditMemberModal] = useState<boolean>(false);
    const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const [formData, setFormData] = useState<FormData>({
        photo: null, photoPreview: null, name: '', email: '', phone: '', jobTitle: '', subDepartment: ''
    });

    const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: file, photoPreview: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string): void => {
        setFormData(prev => ({
            ...prev, [field]: value,
            ...(field === 'jobTitle' ? { subDepartment: '' } : {})
        }));
    };

    const showFeedback = (message: string, type: 'success' | 'error' = 'success'): void => {
        setFeedbackMessage({ message, type });
        setTimeout(() => setFeedbackMessage(null), 3000);
    };

    const resetForm = (): void => {
        setFormData({ photo: null, photoPreview: null, name: '', email: '', phone: '', jobTitle: '', subDepartment: '' });
        setEditingMemberId(null);
    };

    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { id: 1, name: 'John Doe', initials: 'JD', email: 'john.doe@company.com', phone: '+1 (555) 123-4567', role: 'Senior Developer', department: 'Engineering', color: '#3B82F6', avatar: null, joinDate: '2022-03-15', status: 'active', tasksAssigned: 14, tasksCompleted: 8, tasksInProgress: 4, overdueTasks: 2, completionRate: 57, skills: ['React', 'Node.js', 'TypeScript'], projects: ['Project Alpha'], lastActive: '2 hours ago', performance: 'excellent' },
        { id: 2, name: 'Alex Kim', initials: 'AK', email: 'alex.kim@company.com', phone: '+1 (555) 234-5678', role: 'UX Designer', department: 'Design', color: '#10B981', avatar: null, joinDate: '2021-11-08', status: 'active', tasksAssigned: 20, tasksCompleted: 15, tasksInProgress: 5, overdueTasks: 0, completionRate: 75, skills: ['Figma', 'Adobe XD'], projects: ['Project Gamma'], lastActive: '1 hour ago', performance: 'excellent' },
        { id: 3, name: 'Maria Rodriguez', initials: 'MR', email: 'maria.rodriguez@company.com', phone: '+1 (555) 345-6789', role: 'Project Manager', department: 'Management', color: '#F59E0B', avatar: null, joinDate: '2020-07-20', status: 'active', tasksAssigned: 18, tasksCompleted: 5, tasksInProgress: 10, overdueTasks: 3, completionRate: 28, skills: ['Agile', 'Scrum'], projects: ['Project Alpha'], lastActive: '30 minutes ago', performance: 'needs-improvement' },
        { id: 4, name: 'Taylor Smith', initials: 'TS', email: 'taylor.smith@company.com', phone: '+1 (555) 456-7890', role: 'Frontend Developer', department: 'Engineering', color: '#8B5CF6', avatar: null, joinDate: '2023-01-10', status: 'active', tasksAssigned: 10, tasksCompleted: 4, tasksInProgress: 6, overdueTasks: 0, completionRate: 40, skills: ['Vue.js', 'CSS'], projects: ['Project Beta'], lastActive: '5 minutes ago', performance: 'good' },
    ]);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPerformance, setSelectedPerformance] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (editingMemberId) {
            setTeamMembers(prevMembers => prevMembers.map(member =>
                member.id === editingMemberId
                    ? { ...member, name: formData.name, email: formData.email, phone: formData.phone, role: formData.jobTitle, department: formData.subDepartment, avatar: formData.photoPreview }
                    : member
            ));
            showFeedback('Member updated successfully!');
            setShowEditMemberModal(false);
        } else {
            const newMember: TeamMember = {
                id: Math.max(...teamMembers.map(m => m.id)) + 1,
                name: formData.name, email: formData.email, phone: formData.phone, role: formData.jobTitle, department: formData.subDepartment, avatar: formData.photoPreview,
                initials: formData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
                color: '#' + Math.floor(Math.random() * 16777215).toString(16),
                joinDate: new Date().toISOString().split('T')[0], status: 'active', tasksAssigned: 0, tasksCompleted: 0, tasksInProgress: 0, overdueTasks: 0, completionRate: 0, skills: [], projects: [], lastActive: 'Just now', performance: 'good'
            };
            setTeamMembers(prevMembers => [...prevMembers, newMember]);
            showFeedback('Member added successfully!');
            setShowAddMemberModal(false);
        }
        resetForm();
    };

    const handleEdit = (member: TeamMember): void => {
        setEditingMemberId(member.id);
        setFormData({ photo: member.avatar, photoPreview: member.avatar, name: member.name, email: member.email, phone: member.phone, jobTitle: member.role, subDepartment: member.department });
        setShowEditMemberModal(true);
        setOpenMenuId(null);
    };

    const handleDelete = (memberId: number, memberName: string): void => {
        if (globalThis.confirm(`Are you sure you want to delete ${memberName}?`)) {
            setTeamMembers(prevMembers => prevMembers.filter(m => m.id !== memberId));
            showFeedback('Member deleted successfully!', 'error');
            setOpenMenuId(null);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (openMenuId && !(event.target as Element).closest('.relative')) setOpenMenuId(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openMenuId]);

    const departments = [...new Set(teamMembers.map(m => m.department))];

    const filteredMembers = teamMembers
        .filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.email.toLowerCase().includes(searchTerm.toLowerCase()) || member.role.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
            const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
            const matchesPerformance = selectedPerformance === 'all' || member.performance === selectedPerformance;
            return matchesSearch && matchesDepartment && matchesStatus && matchesPerformance;
        })
        .sort((a, b) => {
            let aValue: string | number = a[sortBy as keyof TeamMember] as string | number;
            let bValue: string | number = b[sortBy as keyof TeamMember] as string | number;
            if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
            return aValue < bValue ? 1 : -1;
        });

    const stats: Stats = {
        total: teamMembers.length,
        active: teamMembers.filter(m => m.status === 'active').length,
        avgCompletionRate: Math.round(teamMembers.reduce((sum, m) => sum + m.completionRate, 0) / teamMembers.length),
        totalOverdue: teamMembers.reduce((sum, m) => sum + m.overdueTasks, 0)
    };

    const getPerformanceColor = (perf: string): string => {
        switch (perf) {
            case 'excellent': return 'text-green-600 bg-green-100';
            case 'good': return 'text-blue-600 bg-blue-100';
            case 'needs-improvement': return 'text-orange-600 bg-orange-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getPerformanceIcon = (perf: string) => {
        switch (perf) {
            case 'excellent': return <TrendingUp size={14} />;
            case 'good': return <Minus size={14} />;
            case 'needs-improvement': return <TrendingDown size={14} />;
            default: return null;
        }
    };

    const GridView: React.FC = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map(member => (
                <div key={member.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group">
                    <div className="h-1.5" style={{ backgroundColor: member.color }}></div>
                    <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                {member.avatar ? <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-lg object-cover shadow-md" /> : <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-md" style={{ backgroundColor: member.color }}>{member.initials}</div>}
                                <div className="min-w-0">
                                    <Link to={`/team/${encodeURIComponent(member.role)}`} className="font-bold text-gray-900 text-sm hover:text-blue-600 transition-colors cursor-pointer">{member.name}</Link>
                                    <p className="text-xs text-gray-500">{member.role}</p>
                                </div>
                            </div>
                            <div className="relative flex-shrink-0">
                                <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}><MoreVertical size={14} className="text-gray-400" /></button>
                                {openMenuId === member.id && (
                                    <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                                        <button className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2" onClick={() => handleEdit(member)}><Edit2 size={13} />Edit Member</button>
                                        <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2" onClick={() => handleDelete(member.id, member.name)}><Trash2 size={13} />Delete Member</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2 mb-3">
                            <p className="text-xs text-gray-600 flex items-center gap-1"><Mail size={12} />{member.email}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-1"><Phone size={12} />{member.phone}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${member.status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'}`}>{member.status}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getPerformanceColor(member.performance)}`}>{member.performance}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                            <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-500">Assigned</p><p className="text-sm font-bold text-gray-900">{member.tasksAssigned}</p></div>
                            <div className="bg-green-50 rounded-lg p-2"><p className="text-xs text-gray-500">Done</p><p className="text-sm font-bold text-green-600">{member.tasksCompleted}</p></div>
                            <div className="bg-red-50 rounded-lg p-2"><p className="text-xs text-gray-500">Overdue</p><p className="text-sm font-bold text-red-600">{member.overdueTasks}</p></div>
                        </div>
                        <div className="mb-3"><div className="flex justify-between items-center text-xs mb-1"><span className="text-gray-600">Completion Rate</span><span className="font-bold text-gray-900">{member.completionRate}%</span></div><div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${member.completionRate >= 70 ? 'bg-green-500' : member.completionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${member.completionRate}%` }}></div></div></div>
                        <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500"><span className="flex items-center gap-1"><Clock size={12} />{member.lastActive}</span><NudgeButton recipientId={String(member.id)} recipientName={member.name} senderId="manager" onNudge={() => triggerNudge(member.name)} /></div>
                    </div>
                </div>
            ))}
        </div>
    );

    const ListView: React.FC = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Member</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Tasks</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Completion</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Performance</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredMembers.map(member => (
                            <tr key={member.id} className="hover:bg-gray-50">
                                <td className="py-4 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{ backgroundColor: member.color }}>{member.initials}</div><div><div className="font-medium text-gray-900">{member.name}</div><div className="text-sm text-gray-500">{member.role}</div></div></div></td>
                                <td className="py-4 px-4 text-sm text-gray-900">{member.department}</td>
                                <td className="py-4 px-4 text-sm"><span className="text-gray-900">{member.tasksCompleted}/{member.tasksAssigned}</span>{member.overdueTasks > 0 && <span className="ml-2 text-red-600">({member.overdueTasks} overdue)</span>}</td>
                                <td className="py-4 px-4"><div className="flex items-center gap-2"><div className="w-16 bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${member.completionRate >= 70 ? 'bg-green-500' : member.completionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${member.completionRate}%` }}></div></div><span className="text-sm font-medium text-gray-700">{member.completionRate}%</span></div></td>
                                <td className="py-4 px-4"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(member.performance)}`}>{getPerformanceIcon(member.performance)}{member.performance}</span></td>
                                <td className="py-4 px-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => handleEdit(member)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button><button onClick={() => handleDelete(member.id, member.name)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></div></td>
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
            <div className="p-3 md:p-6">
                {feedbackMessage && (<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in"><div className={`px-6 py-3 rounded-lg shadow-lg border ${feedbackMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}><p className="font-medium">{feedbackMessage.message}</p></div></div>)}

                <header className="mb-4 md:mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                            <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 touch-manipulation"><ArrowLeft size={20} className="text-gray-600" /></Link>
                            <div className="flex-1 md:flex-initial min-w-0"><h1 className="text-xl md:text-2xl font-bold text-gray-900">Team Members</h1><p className="text-sm md:text-base text-gray-500 truncate md:whitespace-normal">Manage your team and track individual performance</p></div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-initial px-3 md:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation cursor-pointer" onClick={() => { triggerNudge('Everyone'); showFeedback('Test nudge sent!'); }}>Test Nudge</button>
                            <button onClick={() => setShowAddMemberModal(true)} className="flex-1 md:flex-initial px-3 md:px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation cursor-pointer"><Plus size={16} /><span className="hidden md:inline">Add Member</span></button>
                        </div>
                    </div>
                </header>

                <main>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 sm:p-6 shadow-lg text-white"><div className="flex items-center justify-between mb-3 sm:mb-4"><div className="p-2 sm:p-3 bg-white/20 rounded-xl"><Users size={20} className="text-white" /></div><span className="text-xs font-semibold px-2 py-1 bg-white/20 rounded-full">Team</span></div><p className="text-xs sm:text-sm text-blue-100 mb-1">Total Members</p><div className="flex items-baseline gap-2"><p className="text-2xl sm:text-3xl font-bold">{stats.total}</p></div><p className="text-xs text-blue-100">+2 this month</p></div>
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between mb-3 sm:mb-4"><div className="p-2 sm:p-3 bg-green-100 rounded-xl"><CheckCircle size={20} className="text-green-600" /></div><span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">+100%</span></div><p className="text-xs sm:text-sm text-gray-600 mb-1">Active Members</p><p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.active}</p><p className="text-xs text-gray-500 mt-1 sm:mt-2">On track</p></div>
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between mb-3 sm:mb-4"><div className="p-2 sm:p-3 bg-purple-100 rounded-xl"><TrendingUp size={20} className="text-purple-600" /></div><span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Good</span></div><p className="text-xs sm:text-sm text-gray-600 mb-1">Avg Completion</p><p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.avgCompletionRate}%</p><p className="text-xs text-gray-500 mt-1 sm:mt-2">+1.2% vs last month</p></div>
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between mb-3 sm:mb-4"><div className="p-2 sm:p-3 bg-red-100 rounded-xl"><AlertTriangle size={20} className="text-red-600" /></div><span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-full">-4 from last week</span></div><p className="text-xs sm:text-sm text-gray-600 mb-1">Total Overdue</p><p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalOverdue}</p></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
                                <div className="relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search members..." value={searchTerm} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 text-gray-900 placeholder-gray-500" /></div>
                                <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-black ${showFilters ? 'bg-gray-50' : ''}`}><Filter size={16} />{t('common.filters')}</button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                <select value={sortBy} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black text-sm md:text-base min-w-0 flex-shrink"><option value="name">{t('common.name')}</option><option value="role">{t('common.role')}</option><option value="completionRate">{t('common.completion')}</option><option value="tasksAssigned">{t('common.tasks')}</option><option value="overdueTasks">{t('common.overdue')}</option></select>
                                <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black flex-shrink-0">{sortOrder === 'asc' ? '↑' : '↓'}</button>
                                <div className="flex border border-gray-300 rounded-lg overflow-hidden flex-shrink-0"><button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}><Grid3X3 size={16} /></button><button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}><List size={16} /></button></div>
                            </div>
                        </div>
                        {showFilters && (<div className="mt-4 pt-4 border-t border-gray-200"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-2">Department</label><select value={selectedDepartment} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"><option value="all">All Departments</option>{departments.map(dept => (<option key={dept} value={dept}>{dept}</option>))}</select></div><div><label className="block text-sm font-medium text-gray-700 mb-2">{t('common.status')}</label><select value={selectedStatus} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"><option value="all">All Statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Performance</label><select value={selectedPerformance} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedPerformance(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"><option value="all">All Performance Levels</option><option value="excellent">Excellent</option><option value="good">Good</option><option value="needs-improvement">Needs Improvement</option></select></div></div></div>)}
                    </div>

                    <div className="mb-4"><p className="text-sm text-gray-600">{t('common.showing')} {filteredMembers.length} {t('common.of')} {teamMembers.length} {t('common.members')}</p></div>
                    {viewMode === 'grid' ? <GridView /> : <ListView />}
                </main>

                {showAddMemberModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between"><div><h2 className="text-xl font-bold text-gray-900">Add Team Member</h2><p className="text-sm text-gray-500">Fill in the details to add a new member</p></div><button onClick={() => setShowAddMemberModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"><X size={20} className="text-gray-500" /></button></div>
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label><div className="flex items-center gap-4"><div className="relative">{formData.photoPreview ? (<img src={formData.photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />) : (<div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200"><User size={32} className="text-gray-400" /></div>)}</div><div><label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"><Upload size={16} />Upload Photo<input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" /></label><p className="text-xs text-gray-500 mt-2">Recommended: Square image, at least 200x200px</p></div></div></div>
                                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label><input type="text" required value={formData.name} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)} placeholder="e.g., John Doe" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="email" required value={formData.email} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)} placeholder="john.doe@company.com" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" /></div></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label><div className="relative"><Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="tel" required value={formData.phone} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)} placeholder="+1 (555) 123-4567" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" /></div></div></div>
                                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Job Title <span className="text-red-500">*</span></label><select required value={formData.jobTitle} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('jobTitle', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"><option value="">Select a job title...</option>{Object.keys(jobTitleDepartments).sort().map(title => (<option key={title} value={title}>{title}</option>))}</select></div>
                                {formData.jobTitle && (<div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Sub Department <span className="text-red-500">*</span></label><select required value={formData.subDepartment} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('subDepartment', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"><option value="">Select a sub department...</option>{jobTitleDepartments[formData.jobTitle]?.map(dept => (<option key={dept} value={dept}>{dept}</option>))}</select></div>)}
                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200"><button type="button" onClick={() => setShowAddMemberModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button><button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 cursor-pointer"><Plus size={16} />Add Member</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {showEditMemberModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between"><div><h2 className="text-xl font-bold text-gray-900">Edit Team Member</h2><p className="text-sm text-gray-500">Update member details</p></div><button onClick={() => { setShowEditMemberModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-500" /></button></div>
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label><div className="flex items-center gap-4"><div className="relative">{formData.photoPreview ? (<img src={formData.photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />) : (<div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200"><User size={32} className="text-gray-400" /></div>)}</div><div><label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"><Upload size={16} />Upload Photo<input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" /></label></div></div></div>
                                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label><input type="text" required value={formData.name} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="email" required value={formData.email} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" /></div></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label><div className="relative"><Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="tel" required value={formData.phone} onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" /></div></div></div>
                                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Job Title <span className="text-red-500">*</span></label><select required value={formData.jobTitle} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('jobTitle', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"><option value="">Select a job title...</option>{Object.keys(jobTitleDepartments).sort().map(title => (<option key={title} value={title}>{title}</option>))}</select></div>
                                {formData.jobTitle && (<div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Sub Department <span className="text-red-500">*</span></label><select required value={formData.subDepartment} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('subDepartment', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"><option value="">Select a sub department...</option>{jobTitleDepartments[formData.jobTitle]?.map(dept => (<option key={dept} value={dept}>{dept}</option>))}</select></div>)}
                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200"><button type="button" onClick={() => { setShowEditMemberModal(false); resetForm(); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button><button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"><Edit2 size={16} />Update Member</button></div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamMembersManager;
