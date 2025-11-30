import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, User, Grid, List, Star } from 'lucide-react';
import PropTypes from 'prop-types';
import TopBar from './shared/TopBar';
import { useMindMaps } from '../hooks/useMindMaps';
import { useMindMapFilters } from '../hooks/useMindMapFilters';
import { getRelativeTime } from '../utils/dateUtils';
import MindMapCard from './mindmap/MindMapCard';

const MindMapManager = ({ onCreateNew, onOpenMindMap, onBack }) => {
  const { mindMaps, createMap, deleteMap, deleteMaps, toggleFavorite, updateMapColor, updateMapTitle } = useMindMaps();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedMaps, setSelectedMaps] = useState([]);
  const [sortBy, setSortBy] = useState('updated');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingMap, setEditingMap] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(null);

  const filteredMaps = useMindMapFilters(mindMaps, searchQuery, filterBy, sortBy);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
        setShowColorPicker(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateNew = () => {
    createMap();
    if (onCreateNew) {
      onCreateNew();
    }
  };

  const handleDeleteMap = (mapId) => {
    deleteMap(mapId);
    setShowDeleteConfirm(null);
  };

  const handleBulkDelete = () => {
    deleteMaps(selectedMaps);
    setSelectedMaps([]);
  };

  const startEditing = (map) => {
    setEditingMap(map.id);
    setEditingTitle(map.title);
  };

  const handleUpdateMapTitle = (mapId, newTitle) => {
    updateMapTitle(mapId, newTitle);
    setEditingMap(null);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar showSearch={false} />
      
      <div className="p-3 md:p-6">
        {/* Header */}
        <header className="mb-4 md:mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 touch-manipulation flex-shrink-0"
              title="Back to Dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="flex-1 md:flex-initial min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Mind Maps</h1>
              <p className="text-sm md:text-base text-gray-500 truncate md:whitespace-normal">Create, organize, and manage your mind maps</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            {selectedMaps.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm touch-manipulation flex-1 md:flex-initial"
              >
                <Trash2 size={16} />
                Delete ({selectedMaps.length})
              </button>
            )}
            
            <button
              onClick={handleCreateNew}
              className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm touch-manipulation flex-1 md:flex-initial"
            >
              <Plus size={20} />
              New Mind Map
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 md:gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search mind maps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm md:text-base"
                />
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto">
              {/* Filter Dropdown */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="flex-1 lg:flex-initial px-2 md:px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs md:text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 touch-manipulation"
              >
                <option value="all">All Maps</option>
                <option value="recent">Recent</option>
                <option value="favorites">Favorites</option>
                <option value="shared">Shared</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 lg:flex-initial px-2 md:px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs md:text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 touch-manipulation"
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
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-l-lg transition-colors touch-manipulation`}
                  aria-label="Grid view"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-r-lg transition-colors touch-manipulation`}
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <Plus size={20} />
                  Create Your First Mind Map
                </button>
              )}
            </div>
          </div>        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create New Mind Map Card - appears first when there are existing maps */}
            <div 
              className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer group"
              onClick={handleCreateNew}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCreateNew();
                }
              }}
            >
              <div className="p-6 h-full flex flex-col items-center justify-center text-center min-h-[200px]">
                <div className="mb-4 p-4 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-all">
                  <Plus size={32} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Create New Mind Map</h3>
                <p className="text-sm text-gray-500">Start organizing your ideas with a new mind map</p>
              </div>
            </div>

            {/* Existing Mind Maps */}
            {filteredMaps.map((map) => (
              <MindMapCard
                key={map.id}
                map={map}
                onOpen={onOpenMindMap}
                onToggleFavorite={toggleFavorite}
                onDelete={setShowDeleteConfirm}
                onUpdateTitle={handleUpdateMapTitle}
                onUpdateColor={updateMapColor}
                isEditing={editingMap === map.id}
                onStartEdit={startEditing}
                editingTitle={editingTitle}
                onEditTitleChange={setEditingTitle}
                showDropdown={activeDropdown === map.id}
                onToggleDropdown={() => setActiveDropdown(activeDropdown === map.id ? null : map.id)}
                showColorPicker={showColorPicker === map.id}
                onToggleColorPicker={() => setShowColorPicker(showColorPicker === map.id ? null : map.id)}
                getRelativeTime={getRelativeTime}
              />
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
                      </td>                      <td className="px-6 py-4 whitespace-nowrap">                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => onOpenMindMap && onOpenMindMap(map.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onOpenMindMap && onOpenMindMap(map.id);
                            }
                          }}
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
                            onClick={() => toggleFavorite(map.id)}
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
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-50 rounded-xl">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Mind Map</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{mindMaps.find(m => m.id === showDeleteConfirm)?.title}"?
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
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

      {/* Floating Action Button - appears when there are mind maps for quick creation */}
      {filteredMaps.length > 0 && (
        <button
          onClick={handleCreateNew}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gray-800 hover:bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-10"
          title="Create New Mind Map"
        >
          <Plus size={24} />
        </button>
      )}
      </div>
    </div>
  );
};

MindMapManager.propTypes = {
  onCreateNew: PropTypes.func,
  onOpenMindMap: PropTypes.func,
  onBack: PropTypes.func.isRequired
};

export default MindMapManager;
