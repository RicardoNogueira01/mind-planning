/**
 * Template Gallery Component
 * Modal for browsing and selecting templates
 * 
 * FLOW:
 * 1. User browses templates
 * 2. User clicks a template card to SELECT it (highlighted)
 * 3. User clicks "Add" button to confirm and enter ghost preview mode
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, Search, Sparkles, Check } from 'lucide-react';
import { templates } from '../../templates/templateDefinitions';
import type { Template } from '../../templates/templateDefinitions';
import TemplatePreview from './TemplatePreview';

interface TemplateGalleryProps {
  show: boolean;
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
  onStartBlank?: () => void;
}

const categories = [
  { id: 'all', label: 'All Templates', icon: '📋' },
  { id: 'project', label: 'Project', icon: '🎯' },
  { id: 'meeting', label: 'Meeting', icon: '📝' },
  { id: 'analysis', label: 'Analysis', icon: '📊' },
  { id: 'brainstorm', label: 'Brainstorm', icon: '💡' },
  { id: 'personal', label: 'Personal', icon: '📅' },
];

export default function TemplateGallery({ show, onSelectTemplate, onClose, onStartBlank }: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  if (!show) return null;

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Handle template selection (just highlights, doesn't add)
  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
  };

  // Handle the actual "Add" action
  const handleAddTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
      setSelectedTemplate(null);
    }
  };

  // Handle close and reset
  const handleClose = () => {
    setSelectedTemplate(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] max-w-6xl h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
              <p className="text-sm text-gray-600">Select a template and click "Add" to place it on your canvas</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${selectedCategory === cat.id
                  ? 'bg-black text-white shadow-md'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
              >
                <span>{cat.icon}</span>
                <span className={selectedCategory === cat.id ? 'text-white' : 'text-gray-900'}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Template grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className={`relative cursor-pointer transition-all duration-200 ${selectedTemplate?.id === template.id
                      ? 'ring-4 ring-indigo-500 ring-offset-2 rounded-xl scale-[1.02]'
                      : 'hover:scale-[1.01]'
                    }`}
                  onClick={() => handleTemplateClick(template)}
                >
                  <TemplatePreview
                    template={template}
                    onClick={() => { }} // Handled by parent div
                  />
                  {/* Selected indicator */}
                  {selectedTemplate?.id === template.id && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                      <Check size={18} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedTemplate ? (
              <span className="flex items-center gap-2">
                <span className="text-2xl">{selectedTemplate.thumbnail}</span>
                <span>
                  <strong className="text-gray-900">{selectedTemplate.name}</strong>
                  <span className="text-gray-500"> selected</span>
                </span>
              </span>
            ) : (
              `Showing ${filteredTemplates.length} of ${templates.length} templates`
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            {onStartBlank && !selectedTemplate && (
              <button
                onClick={() => {
                  onStartBlank();
                  handleClose();
                }}
                className="px-6 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
              >
                Start Blank
              </button>
            )}
            {selectedTemplate && (
              <button
                onClick={handleAddTemplate}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2"
              >
                <Sparkles size={18} />
                Add Template
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

TemplateGallery.propTypes = {
  show: PropTypes.bool.isRequired,
  onSelectTemplate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onStartBlank: PropTypes.func
};
