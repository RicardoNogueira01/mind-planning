import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Calendar, User, Tag, Filter, Grid, List, Download, Upload, Star, MoreVertical } from 'lucide-react';

const MindMapManager = ({ onCreateNew, onOpenMindMap, onBack }) => {
  const [mindMaps, setMindMaps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, recent, favorites, shared
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedMaps, setSelectedMaps] = useState([]);
  const [sortBy, setSortBy] = useState('updated'); // updated, created, name, size

  // Load mind maps from localStorage on component mount
  useEffect(() => {
    const savedMaps = localStorage.getItem('mindMaps');
    if (savedMaps) {
      setMindMaps(JSON.parse(savedMaps));
    } else {
      // Initialize with some sample data
      const sampleMaps = [
        {
          id: 'map-1',
          title: 'Project Planning',
          description: 'Strategic planning for Q4 product launch',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          author: 'John Doe',
          collaborators: ['John Doe', 'Sarah Wilson'],
          tags: ['business', 'strategy', 'planning'],
          nodeCount: 24,
          isFavorite: true,
          thumbnail: null,
          color: '#3B82F6'
        },
        {
          id: 'map-2',
          title: 'Learning Roadmap',
          description: 'Personal development and skill acquisition plan',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
          author: 'Sarah Wilson',
          collaborators: ['Sarah Wilson'],
          tags: ['education', 'personal', 'goals'],
          nodeCount: 18,
          isFavorite: false,
          thumbnail: null,
          color: '#10B981'
        },
        {
          id: 'map-3',
          title: 'Event Organization',
          description: 'Planning for annual company retreat',
          createdAt: '2024-01-08',
          updatedAt: '2024-01-16',
          author: 'Mike Johnson',
          collaborators: ['Mike Johnson', 'Emily Davis'],
          tags: ['event', 'planning', 'team'],
          nodeCount: 31,
          isFavorite: true,
          thumbnail: null,
          color: '#8B5CF6'
        }
      ];
      setMindMaps(sampleMaps);
      localStorage.setItem('mindMaps', JSON.stringify(sampleMaps));
    }
  }, []);

  // Save mind maps to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mindMaps', JSON.stringify(mindMaps));
  }, [mindMaps]);

  // Filter and sort mind maps
  const filteredMaps = mindMaps
    .filter(map => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        map.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        map.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        map.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category filter
      const matchesFilter = filterBy === 'all' ||
        (filterBy === 'recent' && new Date(map.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (filterBy === 'favorites' && map.isFavorite) ||
        (filterBy === 'shared' && map.collaborators.length > 1);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'size':
          return b.nodeCount - a.nodeCount;
        default:
          return 0;
      }
    });

  const handleCreateNew = () => {
    const newMap = {
      id: `map-${Date.now()}`,
      title: 'Untitled Mind Map',
      description: '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      author: 'Current User',
      collaborators: ['Current User'],
      tags: [],
      nodeCount: 1,
      isFavorite: false,
      thumbnail: null,
      color: '#6366F1'
    };
    
    setMindMaps([newMap, ...mindMaps]);
    onCreateNew && onCreateNew(newMap);
  };

  const handleDeleteMap = (mapId) => {
    setMindMaps(mindMaps.filter(map => map.id !== mapId));
    setShowDeleteConfirm(null);
  };

  const handleToggleFavorite = (mapId) => {
    setMindMaps(mindMaps.map(map => 
      map.id === mapId ? { ...map, isFavorite: !map.isFavorite } : map
    ));
  };

  const handleBulkDelete = () => {
    setMindMaps(mindMaps.filter(map => !selectedMaps.includes(map.id)));
    setSelectedMaps([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5"/>
                  <path d="M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Mind Maps</h1>
            </div>
            <p className="text-gray-600">Create, organize, and manage your mind maps</p>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedMaps.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                Delete ({selectedMaps.length})
              </button>
            )}
            
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              New Mind Map
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />                <input
                  type="text"
                  placeholder="Search mind maps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-black"
                />
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="flex items-center gap-3">
              {/* Filter Dropdown */}              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 text-black"
              >
                <option value="all">All Maps</option>
                <option value="recent">Recent</option>
                <option value="favorites">Favorites</option>
                <option value="shared">Shared</option>
              </select>

              {/* Sort Dropdown */}              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 text-black"
              >
                <option value="updated">Last Modified</option>
                <option value="created">Date Created</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'} rounded-l-lg transition-colors`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'} rounded-r-lg transition-colors`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Maps</p>
                <p className="text-2xl font-bold text-gray-900">{mindMaps.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M3 3v18h18"/>
                  <path d="M7 12l3 3 7-7"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{mindMaps.filter(m => m.isFavorite).length}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="text-yellow-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shared</p>
                <p className="text-2xl font-bold text-gray-900">{mindMaps.filter(m => m.collaborators.length > 1).length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Nodes</p>
                <p className="text-2xl font-bold text-gray-900">{mindMaps.reduce((sum, map) => sum + map.nodeCount, 0)}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6"/>
                  <path d="m21 12-6 0m-6 0-6 0"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mind Maps Grid/List */}
        {filteredMaps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-4 p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6"/>
                  <path d="m21 12-6 0m-6 0-6 0"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No mind maps found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? `No results found for "${searchQuery}"` : 'Get started by creating your first mind map.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={20} />
                  Create Your First Mind Map
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMaps.map((map) => (
              <div key={map.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: map.color }}
                        ></div>
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{map.title}</h3>
                        {map.isFavorite && (
                          <Star className="text-yellow-500 fill-current" size={14} />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{map.description}</p>
                    </div>
                    
                    <div className="relative ml-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => onOpenMindMap && onOpenMindMap(map)}
                >
                  {/* Thumbnail placeholder */}
                  <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6"/>
                      <path d="m21 12-6 0m-6 0-6 0"/>
                    </svg>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{map.nodeCount} nodes</span>
                      <span>{getRelativeTime(map.updatedAt)}</span>
                    </div>
                    
                    {/* Tags */}
                    {map.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {map.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                            {tag}
                          </span>
                        ))}
                        {map.tags.length > 2 && (
                          <span className="text-xs text-gray-400">+{map.tags.length - 2} more</span>
                        )}
                      </div>
                    )}
                    
                    {/* Collaborators */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <User size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{map.author}</span>
                      </div>
                      {map.collaborators.length > 1 && (
                        <span className="text-xs text-gray-400">+{map.collaborators.length - 1} collaborators</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={selectedMaps.includes(map.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMaps([...selectedMaps, map.id]);
                          } else {
                            setSelectedMaps(selectedMaps.filter(id => id !== map.id));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-gray-500">Select</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(map.id);
                        }}
                        className="p-1 text-gray-400 hover:text-yellow-500 rounded"
                        title="Toggle favorite"
                      >
                        <Star size={14} className={map.isFavorite ? 'fill-current text-yellow-500' : ''} />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(map.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                        title="Delete mind map"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedMaps.length === filteredMaps.length && filteredMaps.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMaps(filteredMaps.map(map => map.id));
                          } else {
                            setSelectedMaps([]);
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nodes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMaps.map((map) => (
                    <tr key={map.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedMaps.includes(map.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMaps([...selectedMaps, map.id]);
                            } else {
                              setSelectedMaps(selectedMaps.filter(id => id !== map.id));
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => onOpenMindMap && onOpenMindMap(map)}
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-3" 
                            style={{ backgroundColor: map.color }}
                          ></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">{map.title}</div>
                              {map.isFavorite && (
                                <Star className="text-yellow-500 fill-current" size={14} />
                              )}
                            </div>
                            {map.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{map.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{map.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{map.nodeCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRelativeTime(map.updatedAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {map.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                              {tag}
                            </span>
                          ))}
                          {map.tags.length > 2 && (
                            <span className="text-xs text-gray-400">+{map.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleFavorite(map.id)}
                            className="text-gray-400 hover:text-yellow-500"
                            title="Toggle favorite"
                          >
                            <Star size={16} className={map.isFavorite ? 'fill-current text-yellow-500' : ''} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(map.id)}
                            className="text-gray-400 hover:text-red-500"
                            title="Delete mind map"
                          >
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Mind Map</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{mindMaps.find(m => m.id === showDeleteConfirm)?.title}"?
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMap(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapManager;
