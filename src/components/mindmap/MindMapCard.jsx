/**
 * MindMapCard Component
 * Reusable card for displaying a mind map in grid view
 */

import React from 'react';
import { Star, MoreVertical, Edit3, Trash2, User, Palette } from 'lucide-react';
import RoundColorPicker from '../RoundColorPicker';

const MindMapCard = ({ 
  map, 
  onOpen,
  onToggleFavorite,
  onDelete,
  onUpdateTitle,
  onUpdateColor,
  isEditing,
  onStartEdit,
  editingTitle,
  onEditTitleChange,
  showDropdown,
  onToggleDropdown,
  showColorPicker,
  onToggleColorPicker,
  getRelativeTime
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: map.color }}
              ></div>
              {isEditing ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => onEditTitleChange(e.target.value)}
                  onBlur={() => onUpdateTitle(map.id, editingTitle)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onUpdateTitle(map.id, editingTitle);
                    } else if (e.key === 'Escape') {
                      onStartEdit(null);
                    }
                  }}
                  className="text-sm font-semibold text-gray-900 bg-transparent border-b border-indigo-300 focus:outline-none focus:border-indigo-500 px-1"
                  autoFocus
                />
              ) : (
                <h3 className="font-semibold text-gray-900 text-sm truncate">{map.title}</h3>
              )}
              {map.isFavorite && (
                <Star className="text-yellow-500 fill-current" size={14} />
              )}
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{map.description}</p>
          </div>
          
          <div className="relative ml-2 dropdown-container">
            <button 
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onToggleDropdown();
              }}
            >
              <MoreVertical size={16} />
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 w-48">
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEdit(map);
                    onToggleDropdown();
                  }}
                >
                  <Edit3 size={14} />
                  Edit Name
                </button>
                
                <div className="px-4 py-2 text-sm text-gray-700">
                  <button
                    className="flex items-center gap-2 w-full text-left hover:bg-gray-50 p-2 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleColorPicker();
                    }}
                  >
                    <Palette size={14} />
                    <span>Change Color</span>
                  </button>
                  
                  {/* Round Color Picker */}
                  {showColorPicker && (
                    <div className="relative mt-2">
                      <RoundColorPicker
                        currentColor={map.color || '#3B82F6'}
                        onColorSelect={(color) => {
                          onUpdateColor(map.id, color);
                          onToggleDropdown();
                          onToggleColorPicker();
                        }}
                        onClose={() => {
                          onToggleColorPicker();
                        }}
                        position="bottom-left"
                      />
                    </div>
                  )}
                </div>
                
                <hr className="my-2" />
                
                <button
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(map.id);
                    onToggleDropdown();
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => onOpen(map.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen(map.id);
          }
        }}
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
    </div>
  );
};

export default MindMapCard;
