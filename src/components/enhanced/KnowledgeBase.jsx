import React, { useState, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  X, 
  Plus,
  Search,
  FileText,
  Folder,
  Upload,
  Download,
  Trash2,
  Edit2,
  Eye,
  ChevronRight,
  ChevronDown,
  Image,
  File,
  Link2,
  Star,
  Clock,
  User,
  Tag,
  Filter
} from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * KnowledgeBase - Team knowledge sharing hub
 * Central place for team documentation:
 * - Create and edit documents (markdown)
 * - Upload files (images, PDFs, etc.)
 * - Organize with folders/categories
 * - Search across all content
 * - Link docs to tasks
 */

const FILE_TYPES = {
  document: { icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  image: { icon: Image, color: 'text-green-500', bgColor: 'bg-green-50' },
  pdf: { icon: File, color: 'text-red-500', bgColor: 'bg-red-50' },
  link: { icon: Link2, color: 'text-purple-500', bgColor: 'bg-purple-50' },
  other: { icon: File, color: 'text-gray-500', bgColor: 'bg-gray-50' }
};

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All', icon: BookOpen },
  { id: 'guides', name: 'Guides & How-tos', icon: FileText },
  { id: 'templates', name: 'Templates', icon: Folder },
  { id: 'policies', name: 'Policies', icon: File },
  { id: 'onboarding', name: 'Onboarding', icon: User },
  { id: 'technical', name: 'Technical Docs', icon: FileText },
  { id: 'design', name: 'Design Assets', icon: Image }
];

export default function KnowledgeBase({ 
  collaborators = [],
  onClose 
}) {
  const fileInputRef = useRef(null);
  
  const [documents, setDocuments] = useState([
    // Sample documents
    {
      id: 1,
      title: 'Project Onboarding Guide',
      content: '# Welcome to the Team!\n\nThis guide will help you get started...\n\n## First Steps\n1. Set up your development environment\n2. Read the codebase overview\n3. Join the team Slack channels',
      type: 'document',
      category: 'onboarding',
      author: 'jd',
      createdAt: '2024-12-01',
      updatedAt: '2024-12-10',
      starred: true,
      tags: ['new-hire', 'setup']
    },
    {
      id: 2,
      title: 'Code Review Guidelines',
      content: '# Code Review Best Practices\n\n## What to Look For\n- Code quality and readability\n- Test coverage\n- Performance implications\n- Security considerations',
      type: 'document',
      category: 'guides',
      author: 'ak',
      createdAt: '2024-11-15',
      updatedAt: '2024-12-08',
      starred: false,
      tags: ['development', 'best-practices']
    },
    {
      id: 3,
      title: 'Brand Colors & Fonts',
      content: 'Primary: #3B82F6\nSecondary: #10B981\nFont: Inter, DM Sans',
      type: 'document',
      category: 'design',
      author: 'mr',
      createdAt: '2024-11-20',
      updatedAt: '2024-11-20',
      starred: true,
      tags: ['design', 'branding']
    },
    {
      id: 4,
      title: 'API Documentation',
      content: '# API Endpoints\n\n## Authentication\n`POST /api/auth/login`\n\n## Users\n`GET /api/users`\n`POST /api/users`',
      type: 'document',
      category: 'technical',
      author: 'ts',
      createdAt: '2024-12-05',
      updatedAt: '2024-12-12',
      starred: false,
      tags: ['api', 'backend']
    }
  ]);
  
  const [view, setView] = useState('list'); // 'list' | 'edit' | 'view'
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  
  const [editingDoc, setEditingDoc] = useState({
    title: '',
    content: '',
    category: 'guides',
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  // Filter documents
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      if (showStarredOnly && !doc.starred) return false;
      if (filterCategory !== 'all' && doc.category !== filterCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return doc.title.toLowerCase().includes(query) || 
               doc.content.toLowerCase().includes(query) ||
               doc.tags.some(t => t.toLowerCase().includes(query));
      }
      return true;
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [documents, filterCategory, searchQuery, showStarredOnly]);

  const handleCreateDoc = () => {
    setEditingDoc({
      title: '',
      content: '',
      category: 'guides',
      tags: []
    });
    setSelectedDoc(null);
    setView('edit');
  };

  const handleEditDoc = (doc) => {
    setEditingDoc({
      title: doc.title,
      content: doc.content,
      category: doc.category,
      tags: [...doc.tags]
    });
    setSelectedDoc(doc);
    setView('edit');
  };

  const handleSaveDoc = () => {
    if (!editingDoc.title.trim()) return;
    
    if (selectedDoc) {
      // Update existing
      setDocuments(prev => prev.map(d => 
        d.id === selectedDoc.id 
          ? { ...d, ...editingDoc, updatedAt: new Date().toISOString().split('T')[0] }
          : d
      ));
    } else {
      // Create new
      const newDoc = {
        id: Date.now(),
        ...editingDoc,
        type: 'document',
        author: collaborators[0]?.id || 'unknown',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        starred: false
      };
      setDocuments(prev => [newDoc, ...prev]);
    }
    
    setView('list');
    setSelectedDoc(null);
  };

  const handleDeleteDoc = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
      setView('list');
    }
  };

  const handleToggleStar = (id) => {
    setDocuments(prev => prev.map(d => 
      d.id === id ? { ...d, starred: !d.starred } : d
    ));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editingDoc.tags.includes(newTag.trim())) {
      setEditingDoc(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setEditingDoc(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newDoc = {
        id: Date.now(),
        title: file.name,
        content: e.target.result,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type === 'application/pdf' ? 'pdf' : 'other',
        category: 'guides',
        author: collaborators[0]?.id || 'unknown',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        starred: false,
        tags: [],
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      };
      setDocuments(prev => [newDoc, ...prev]);
    };
    
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file);
    }
    
    event.target.value = '';
  };

  const getCollaborator = (id) => collaborators.find(c => c.id === id);
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-sm sm:max-w-xl md:w-[600px] max-h-[90vh] flex flex-col mx-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Knowledge Base</h3>
              <p className="text-sm text-emerald-100">
                {documents.length} documents • Team wiki
              </p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <>
          {/* Search and actions */}
          <div className="p-3 border-b border-gray-200 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search docs, tags..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Upload file"
              >
                <Upload className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.md"
              />
              <button
                onClick={handleCreateDoc}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
              </button>
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  showStarredOnly
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Star className="w-3 h-3" /> Starred
              </button>
              {DEFAULT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    filterCategory === cat.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Documents list */}
          <div className="flex-1 overflow-y-auto">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No documents found</p>
                <p className="text-gray-400 text-xs mt-1">Create one or adjust your filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredDocs.map(doc => {
                  const author = getCollaborator(doc.author);
                  const typeConfig = FILE_TYPES[doc.type] || FILE_TYPES.other;
                  const TypeIcon = typeConfig.icon;
                  
                  return (
                    <div 
                      key={doc.id}
                      className="p-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 ${typeConfig.bgColor} rounded-lg`}>
                          <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div 
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => {
                                setSelectedDoc(doc);
                                setView('view');
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm text-gray-900 truncate">{doc.title}</h4>
                                {doc.starred && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                {author && (
                                  <span className="flex items-center gap-1">
                                    <div 
                                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                                      style={{ backgroundColor: author.color }}
                                    >
                                      {author.initials}
                                    </div>
                                    {author.name.split(' ')[0]}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(doc.updatedAt)}
                                </span>
                                {doc.fileSize && (
                                  <span>{formatFileSize(doc.fileSize)}</span>
                                )}
                              </div>
                              {doc.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {doc.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                      #{tag}
                                    </span>
                                  ))}
                                  {doc.tags.length > 3 && (
                                    <span className="text-[10px] text-gray-400">+{doc.tags.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleToggleStar(doc.id)}
                                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                title={doc.starred ? 'Unstar' : 'Star'}
                              >
                                <Star className={`w-4 h-4 ${doc.starred ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                              </button>
                              {doc.type === 'document' && (
                                <button
                                  onClick={() => handleEditDoc(doc)}
                                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-400" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="p-1.5 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* View Document */}
      {view === 'view' && selectedDoc && (
        <>
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <button
              onClick={() => {
                setView('list');
                setSelectedDoc(null);
              }}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← Back to list
            </button>
            <div className="flex gap-2">
              {selectedDoc.type === 'document' && (
                <button
                  onClick={() => handleEditDoc(selectedDoc)}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{selectedDoc.title}</h1>
            
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
              {getCollaborator(selectedDoc.author) && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {getCollaborator(selectedDoc.author).name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {formatDate(selectedDoc.updatedAt)}
              </span>
            </div>
            
            {selectedDoc.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedDoc.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {selectedDoc.type === 'image' ? (
              <img src={selectedDoc.content} alt={selectedDoc.title} className="max-w-full rounded-lg" />
            ) : (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedDoc.content}
                </pre>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit/Create Document */}
      {view === 'edit' && (
        <>
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <button
              onClick={() => {
                setView('list');
                setSelectedDoc(null);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Cancel
            </button>
            <button
              onClick={handleSaveDoc}
              disabled={!editingDoc.title.trim()}
              className="px-4 py-1.5 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {selectedDoc ? 'Save Changes' : 'Create Document'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <input
              type="text"
              value={editingDoc.title}
              onChange={(e) => setEditingDoc(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Document title..."
              className="w-full px-3 py-2 text-lg font-semibold text-gray-900 border-b border-gray-200 focus:outline-none focus:border-emerald-500"
            />
            
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Category</label>
                <select
                  value={editingDoc.category}
                  onChange={(e) => setEditingDoc(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {DEFAULT_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tags</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {editingDoc.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded flex items-center gap-1"
                  >
                    #{tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Content (Markdown supported)</label>
              <textarea
                value={editingDoc.content}
                onChange={(e) => setEditingDoc(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your documentation here...

# Heading
## Subheading

- Bullet points
- Lists work too

**Bold** and *italic* text"
                className="w-full h-64 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono"
              />
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      {view === 'list' && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Share knowledge, grow together</span>
            <span>{documents.filter(d => d.starred).length} starred docs</span>
          </div>
        </div>
      )}
    </div>
  );
}

KnowledgeBase.propTypes = {
  collaborators: PropTypes.array,
  onClose: PropTypes.func
};
