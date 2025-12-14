import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Clock, 
  FileText, 
  Users, 
  FolderOpen,
  Map,
  Scale,
  Loader2,
  ArrowRight,
  CheckSquare
} from 'lucide-react';
import { 
  globalSearch, 
  saveRecentSearch, 
  getRecentSearches,
  clearRecentSearches
} from '../../services/searchService';
import { SearchResult } from '../../types';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  onResultClick?: (result: SearchResult) => void;
}

export function GlobalSearch({ 
  placeholder = 'Search tasks, projects, people...', 
  className = '',
  onResultClick 
}: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeFilter, setActiveFilter] = useState<SearchResult['type'] | 'all'>('all');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token') || undefined;
        const response = await globalSearch({
          query: debouncedQuery,
          types: activeFilter === 'all' ? undefined : [activeFilter],
          limit: 10,
        }, token);
        
        setResults(response.results);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, activeFilter]);

  // Handle result click
  const handleResultClick = useCallback((result: SearchResult) => {
    saveRecentSearch(query);
    setRecentSearches(getRecentSearches());
    setIsOpen(false);
    setQuery('');
    
    if (onResultClick) {
      onResultClick(result);
    } else {
      // Navigate to result
      navigate(result.url);
    }
  }, [query, navigate, onResultClick]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalItems = results.length + (query ? 0 : recentSearches.length);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        } else if (!query && selectedIndex >= 0 && selectedIndex < recentSearches.length) {
          setQuery(recentSearches[selectedIndex]);
        } else if (query) {
          // Search with current query
          saveRecentSearch(query);
          setRecentSearches(getRecentSearches());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [results, recentSearches, selectedIndex, query, handleResultClick]);

  // Handle recent search click
  const handleRecentClick = (search: string) => {
    setQuery(search);
  };

  // Handle clear recent searches
  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  // Get icon for result type
  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'task': return CheckSquare;
      case 'project': return FolderOpen;
      case 'mindmap': return Map;
      case 'user': return Users;
      case 'decision': return Scale;
      default: return FileText;
    }
  };

  // Get color for result type
  const getResultColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-600';
      case 'project': return 'bg-green-100 text-green-600';
      case 'mindmap': return 'bg-purple-100 text-purple-600';
      case 'user': return 'bg-amber-100 text-amber-600';
      case 'decision': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Filter types
  const filterTypes: Array<{ value: SearchResult['type'] | 'all'; label: string; icon: React.ElementType }> = [
    { value: 'all', label: 'All', icon: Search },
    { value: 'task', label: 'Tasks', icon: CheckSquare },
    { value: 'project', label: 'Projects', icon: FolderOpen },
    { value: 'mindmap', label: 'MindMaps', icon: Map },
    { value: 'user', label: 'People', icon: Users },
    { value: 'decision', label: 'Decisions', icon: Scale },
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            title="Clear search"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={14} className="text-gray-500" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 size={16} className="text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-[480px] overflow-y-auto">
          {/* Filter Tabs */}
          {query && (
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 overflow-x-auto">
              {filterTypes.map(filter => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={14} />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Recent Searches (when no query) */}
          {!query && recentSearches.length > 0 && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Recent Searches</span>
                <button
                  onClick={handleClearRecent}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={search}
                  onClick={() => handleRecentClick(search)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No query, no recent */}
          {!query && recentSearches.length === 0 && (
            <div className="p-6 text-center">
              <Search size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Start typing to search...</p>
              <p className="text-xs text-gray-400 mt-1">Search tasks, projects, people, and more</p>
            </div>
          )}

          {/* Search Results */}
          {query && results.length > 0 && (
            <div className="p-2">
              {results.map((result, index) => {
                const Icon = getResultIcon(result.type);
                const colorClass = getResultColor(result.type);
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <span className="text-xs text-gray-400 capitalize">
                          {result.type}
                        </span>
                      </div>
                      {result.subtitle && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {result.subtitle}
                        </p>
                      )}
                      {result.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {result.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight size={14} className="text-gray-400 flex-shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {query && !isLoading && results.length === 0 && (
            <div className="p-6 text-center">
              <Search size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-700">No results found</p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords or filters</p>
            </div>
          )}

          {/* Loading State */}
          {query && isLoading && results.length === 0 && (
            <div className="p-6 text-center">
              <Loader2 size={24} className="mx-auto text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-500">Searching...</p>
            </div>
          )}

          {/* Search Tips */}
          {query && results.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-700 font-mono">↵</kbd> to select,{' '}
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-700 font-mono">↑↓</kbd> to navigate
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Mobile Search Button Component
interface MobileSearchButtonProps {
  onClick: () => void;
}

export function MobileSearchButton({ onClick }: MobileSearchButtonProps) {
  return (
    <button 
      onClick={onClick}
      title="Search"
      className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <Search size={20} className="text-gray-600" />
    </button>
  );
}

// Full Screen Mobile Search Component
interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchOverlay({ isOpen, onClose }: MobileSearchOverlayProps) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const handleResultClick = (result: SearchResult) => {
    onClose();
    navigate(result.url);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 md:hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            title="Close search"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
          <GlobalSearch 
            className="flex-1" 
            placeholder="Search..." 
            onResultClick={handleResultClick}
          />
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;
