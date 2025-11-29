/**
 * Template Preview Card Component
 * Displays individual template with thumbnail and metadata
 */

import React from 'react';
import PropTypes from 'prop-types';
import type { Template } from '../../templates/templateDefinitions';
import { getTemplatePreview } from '../../templates/templateEngine';

interface TemplatePreviewProps {
  template: Template;
  onClick: () => void;
}

export default function TemplatePreview({ template, onClick }: TemplatePreviewProps) {
  const preview = getTemplatePreview(template, 280, 160);
  
  return (
    <button
      onClick={onClick}
      className="group relative bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left w-full"
    >
      {/* Thumbnail */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-3 overflow-hidden" style={{ height: '160px' }}>
        {/* Render mini preview */}
        <svg
          viewBox="0 0 280 160"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connections */}
          {preview.connections.map((conn, idx) => {
            const from = preview.nodes[conn.fromIndex];
            const to = preview.nodes[conn.toIndex];
            if (!from || !to) return null;
            
            return (
              <line
                key={idx}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#CBD5E1"
                strokeWidth="1.5"
                opacity="0.6"
              />
            );
          })}
          
          {/* Nodes */}
          {preview.nodes.map((node, idx) => (
            <circle
              key={idx}
              cx={node.x}
              cy={node.y}
              r={idx === 0 ? 8 : 6}
              fill={node.color}
              opacity="0.9"
            />
          ))}
        </svg>
        
        {/* Emoji icon overlay */}
        <div className="absolute top-2 left-2 text-3xl">
          {template.thumbnail}
        </div>
      </div>
      
      {/* Template info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
          {template.name}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2">
          {template.description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {template.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
              +{template.tags.length - 3}
            </span>
          )}
        </div>
        
        {/* Node count */}
        <div className="text-xs text-gray-500 pt-1">
          {template.nodeStructure.nodes.length} nodes • {template.nodeStructure.connections.length} connections
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity pointer-events-none" />
    </button>
  );
}

TemplatePreview.propTypes = {
  template: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
};
